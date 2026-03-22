import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { uploadFile, deleteFile } from '../utils/cloudinary.js';
import multer from 'multer';
import Gallery from '../models/Gallery.js';
import mongoose from 'mongoose';
import { authorizeRoles, authorizePermission } from '../utils/authMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize:  5 * 1024 * 1024,    // 5 MB per file
        files: 5,                        // max 5 files per request
        fieldSize: 10 * 1024 * 1024,    // 10 MB per non-file field
    },
});


// Helper to get models safely
const getRoomModel = () => mongoose.model('Room');
const getBookingModel = () => mongoose.model('Booking');
const getUserModel = () => mongoose.model('User');

// --- FOLDER PATHS in Cloudinary ---
// Room images  → daulat_resort/rooms
// Gallery imgs → daulat_resort/gallery
const FOLDER_ROOMS   = 'daulat_resort/rooms';
const FOLDER_GALLERY = 'daulat_resort/gallery';
const FOLDER_USERS   = 'daulat_resort/users';

// --- ROOM MANAGEMENT (With Image Upload) ---

// ADD New Room
router.post('/rooms', authorizePermission('rooms', 'add'), upload.array('images', 5), async (req, res) => {
    try {
        const Room = getRoomModel();

        let imageUrls = [];

        // Handle File Uploads (if any)
        if (req.files && req.files.length > 0) {
            try {
                for (const file of req.files) {
                    const uploadRes = await uploadFile(file, FOLDER_ROOMS);
                    imageUrls.push(uploadRes.webContentLink);
                }
            } catch (uploadError) {
                console.error("Cloudinary Upload Failed:", uploadError);
                return res.status(500).json({ message: "Failed to upload images to Cloudinary. Check server logs." });
            }
        }

        // Prepare Room Data
        const roomData = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            capacity: req.body.capacity,
            images: imageUrls,
            createdBy: req.user.id,
            lastModifiedBy: req.user.id
        };

        if (req.body.amenities) {
            // Check if it's a string (from FormData usually starts as string)
            if (typeof req.body.amenities === 'string') {
                roomData.amenities = req.body.amenities.split(',').map(s => s.trim());
            } else if (Array.isArray(req.body.amenities)) {
                roomData.amenities = req.body.amenities;
            }
        }

        const newRoom = new Room(roomData);
        await newRoom.save();

        res.status(201).json(newRoom);

    } catch (err) {
        console.error("Create Room Error:", err);
        res.status(400).json({ message: err.message });
    }
});

// EDIT Room
router.put('/rooms/:id', authorizePermission('rooms', 'edit'), upload.array('images', 5), async (req, res) => {
    try {
        const Room = getRoomModel();

        // Build the update object from text fields
        const updateData = { lastModifiedBy: req.user.id };
        if (req.body.name)        updateData.name        = req.body.name;
        if (req.body.price)       updateData.price       = req.body.price;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.capacity)    updateData.capacity    = req.body.capacity;

        if (req.body.amenities) {
            if (typeof req.body.amenities === 'string') {
                updateData.amenities = req.body.amenities.split(',').map(s => s.trim());
            } else if (Array.isArray(req.body.amenities)) {
                updateData.amenities = req.body.amenities;
            }
        }

        // Handle image deletions + new uploads
        const currentRoom = await Room.findById(req.params.id);
        if (!currentRoom) return res.status(404).json({ message: 'Room not found' });

        // Start from existing images, remove the ones marked for deletion
        let images = [...(currentRoom.images || [])];
        if (req.body.deletedImages) {
            const toDelete = JSON.parse(req.body.deletedImages);
            images = images.filter(url => !toDelete.includes(url));
        }

        // Append any newly uploaded images
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadRes = await uploadFile(file, FOLDER_ROOMS);
                images.push(uploadRes.webContentLink);
            }
        }

        updateData.images = images;

        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(updatedRoom);

    } catch (err) {
        console.error("Edit Room Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE Room
router.delete('/rooms/:id', authorizePermission('rooms', 'delete'), async (req, res) => {
    try {
        const Room = getRoomModel();
        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: "Room deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- GALLERY MANAGEMENT ---
router.get('/gallery', authorizePermission('gallery', 'view'), async (req, res) => {
    try {
        const galleries = await Gallery.find().populate('lastModifiedBy', 'username').sort({ createdAt: -1 });
        res.json(galleries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/gallery', authorizePermission('gallery', 'add'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No image uploaded" });
        const uploadRes = await uploadFile(req.file, FOLDER_GALLERY);
        const newImage = new Gallery({
            imageUrl: uploadRes.webContentLink,
            title: req.body.title || req.file.originalname,
            category: req.body.category || 'General',
            cloudId: uploadRes.id,
            createdBy: req.user.id,
            lastModifiedBy: req.user.id
        });
        await newImage.save();
        res.status(201).json(newImage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/gallery/:id', authorizePermission('gallery', 'delete'), async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) return res.status(404).json({ message: "Image not found" });
        try {
            await deleteFile(image.cloudId || image.googleDriveId);
        } catch (e) { console.error("Cloudinary delete error", e); } // Continue to delete from DB even if Drive fails
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- BOOKING MANAGEMENT ---
router.get('/bookings', authorizePermission('bookings', 'view'), async (req, res) => {
    try {
        const Booking = getBookingModel();
        const bookings = await Booking.find().populate('roomId').populate('lastModifiedBy', 'username').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/bookings/:id', authorizePermission('bookings', 'edit'), async (req, res) => {
    try {
        const Booking = getBookingModel();
        const { status, verificationStatus } = req.body;
        const updateData = { lastModifiedBy: req.user.id };
        if (status) updateData.status = status;
        if (verificationStatus) {
            updateData.verificationStatus = verificationStatus;
            // Also automatically change the general status to Confirmed when verification finishes
            if (verificationStatus === 'Verified') {
                updateData.status = 'Confirmed';
            }
        }
        
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).populate('roomId');

        // Send Email Notification if status is "Verified" (Reservation Confirmed)
        if (verificationStatus === 'Verified') {
            try {
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: updatedBooking.email,
                    subject: 'Daulat Resort - Reservation Confirmed',
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #c5a059; text-align: center;">Reservation Confirmed!</h2>
                            <p>Dear <strong>${updatedBooking.guestName}</strong>,</p>
                            <p>Great news! Your booking verification is complete and your reservation has been <strong>fully confirmed</strong>.</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Room:</strong> ${updatedBooking.roomId?.name || 'N/A'}</p>
                                <p style="margin: 5px 0 0;"><strong>Dates:</strong> ${new Date(updatedBooking.startDate).toLocaleDateString()} - ${new Date(updatedBooking.endDate).toLocaleDateString()}</p>
                            </div>
                            <p>We look forward to hosting you at Daulat Resort.</p>
                            <p style="text-align: center; color: #777; font-size: 12px; margin-top: 30px;">
                                Daulat Resort - Creating Unforgettable Memories
                            </p>
                        </div>
                    `
                });
                console.log(`Confirmation email sent to: ${updatedBooking.email}`);
            } catch (emailErr) {
                console.error("Confirmation Email Error:", emailErr);
            }
        }

        // Send Email Notification if status is "Completed"
        if (verificationStatus === 'Completed') {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: updatedBooking.email,
                    subject: 'Daulat Resort - Reservation Completed',
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #c5a059; text-align: center;">Stay Completed!</h2>
                            <p>Dear <strong>${updatedBooking.guestName}</strong>,</p>
                            <p>We hope you had a wonderful stay at Daulat Resort in our <strong>${updatedBooking.roomId?.name || 'Luxury Room'}</strong>.</p>
                            <p>Your reservation is now marked as <strong>Completed</strong>. We would love to welcome you back again soon!</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Room:</strong> ${updatedBooking.roomId?.name || 'N/A'}</p>
                                <p style="margin: 5px 0 0;"><strong>Dates:</strong> ${new Date(updatedBooking.startDate).toLocaleDateString()} - ${new Date(updatedBooking.endDate).toLocaleDateString()}</p>
                            </div>
                            <p style="text-align: center; color: #777; font-size: 12px; margin-top: 30px;">
                                Daulat Resort - Creating Unforgettable Memories
                            </p>
                        </div>
                    `
                });
                console.log(`Completion email sent to: ${updatedBooking.email}`);
            } catch (emailErr) {
                console.error("Completion Email Error:", emailErr);
                // We don't return error here to ensure the status update remains successful
            }
        }

        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- STATS ---
router.get('/stats', async (req, res) => {
    try {
        const Booking = getBookingModel();
        const Room = getRoomModel();
        const User = getUserModel();
        
        const bookings = await Booking.countDocuments();
        const rooms = await Room.countDocuments();
        const users = await User.countDocuments();
        
        // "Pending" or "Ongoing" ones
        const pendingBookings = await Booking.countDocuments({ 
            status: { $in: ['Pending', 'Confirmed'] },
            verificationStatus: { $ne: 'Completed' }
        });

        // Sum revenue of non-cancelled bookings
        const revenue = await Booking.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        // Occupancy calculation based on today's overlap
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        
        const occupiedRooms = await Booking.distinct('roomId', {
            startDate: { $lte: endOfToday },
            endDate: { $gte: startOfToday },
            status: { $ne: 'Cancelled' }
        });
        
        const occupancy = rooms > 0 ? Math.round((occupiedRooms.length / rooms) * 100) : 0;

        res.json({ 
            bookings, 
            rooms, 
            users,
            pendingBookings,
            occupiedRoomsCount: occupiedRooms.length,
            revenue: revenue[0] ? revenue[0].total : 0, 
            occupancy 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// --- USER MANAGEMENT ---

// GET All Users
router.get('/users', authorizePermission('users', 'manage'), async (req, res) => {
    try {
        const User = getUserModel();
        const users = await User.find().populate('lastModifiedBy', 'username').select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD New User
router.post('/users', authorizePermission('users', 'manage'), upload.single('profileImage'), async (req, res) => {
    try {
        const User = getUserModel();
        const { username, password, email, contactNumber, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        let profileImage = '';
        if (req.file) {
            const uploadRes = await uploadFile(req.file, FOLDER_USERS);
            profileImage = uploadRes.webContentLink;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let customPermissions = undefined;
        if (req.body.customPermissions) {
            try {
                customPermissions = JSON.parse(req.body.customPermissions);
            } catch(e) {
                console.error("Failed to parse customPermissions", e);
            }
        }

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            contactNumber,
            role,
            profileImage,
            customPermissions,
            isTwoFactorEnabled: req.body.isTwoFactorEnabled === 'true' || req.body.isTwoFactorEnabled === true,
            createdBy: req.user.id,
            lastModifiedBy: req.user.id
        });

        await newUser.save();
        const userResponse = newUser.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);

    } catch (err) {
        console.error("Create User Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE User (including password/photo)
router.put('/users/:id', authorizePermission('users', 'manage'), upload.single('profileImage'), async (req, res) => {
    try {
        const User = getUserModel();
        const { username, password, email, contactNumber, role, isTwoFactorEnabled } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const updateData = { 
            username, 
            email, 
            contactNumber, 
            role,
            isTwoFactorEnabled: isTwoFactorEnabled === 'true' || isTwoFactorEnabled === true,
            lastModifiedBy: req.user.id
        };

        if (req.body.customPermissions) {
            try {
                updateData.customPermissions = JSON.parse(req.body.customPermissions);
            } catch(e) {
                 console.error("Failed to parse customPermissions", e);
            }
        }

        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (req.file) {
            const uploadRes = await uploadFile(req.file, FOLDER_USERS);
            updateData.profileImage = uploadRes.webContentLink;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        res.json(updatedUser);

    } catch (err) {
        console.error("Update User Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE User
router.delete('/users/:id', authorizePermission('users', 'manage'), async (req, res) => {
    try {
        const User = getUserModel();
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── Multer error handler (MUST be after all routes) ──
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE')
            return res.status(413).json({ message: 'Image too large. Maximum size is 5 MB per file.' });
        if (err.code === 'LIMIT_FILE_COUNT')
            return res.status(413).json({ message: 'Too many files. Maximum 5 images allowed.' });
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    console.error('Unhandled route error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

export default router;
