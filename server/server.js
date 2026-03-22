import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// IMPORT NEW ADMIN ROUTES - RE-ENABLED
import adminRoutes from './routes/admin.js';
import authMiddleware from './utils/authMiddleware.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://daulat-resort.vercel.app',
    process.env.CLIENT_URL // In case you want to set it manually in Render later
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));               // raise JSON body limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // for form fields

// --- MODELS ---
const RoomSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    images: [String],
    amenities: [String],
    threeDModel: String,
    occupancy: Number,  // kept for backward compat with old records
    capacity: Number,   // used by the admin form
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

const BookingSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    guestName: String,
    email: String,
    startDate: Date,
    endDate: Date,
    totalPrice: Number,
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending'
    },
    verificationStatus: {
        type: String,
        enum: ['Waiting', 'Called', 'Verified', 'Completed'],
        default: 'Waiting'
    },
    staffNotes: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String },
    contactNumber: { type: String },
    profileImage: { type: String },
    role: {
        type: String,
        enum: ['Owner', 'Manager', 'Receptionist', 'Accountant', 'Staff'],
        default: 'Staff'
    },
    otp: { type: String },
    otpExpires: { type: Date },
    isTwoFactorEnabled: { type: Boolean, default: false },
    trustedDevices: [{
        deviceId: { type: String },
        expiresAt: { type: Date }
    }],
    customPermissions: {
        bookings: { view: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, verify: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
        rooms: { view: { type: Boolean, default: false }, add: { type: Boolean, default: false }, edit: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
        gallery: { view: { type: Boolean, default: false }, add: { type: Boolean, default: false }, delete: { type: Boolean, default: false } },
        users: { manage: { type: Boolean, default: false } },
        settings: { view: { type: Boolean, default: false }, edit: { type: Boolean, default: false } }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- MOUNT NEW ADMIN ROUTES - RE-ENABLED ---
app.use('/api/admin', authMiddleware, adminRoutes);

// --- PUBLIC ROUTES ---
// Basic health check route for the root
app.get('/', (req, res) => {
    res.send('Daulat Resort API is running successfully!');
});

// Default /api/rooms and bookings
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await Room.find().populate('lastModifiedBy', 'username');
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('roomId');
        // Map backend schema to frontend expectation
        const formattedBookings = bookings.map(b => ({
            _id: b._id,
            guestName: b.guestName,
            email: b.email,
            roomType: b.roomId ? b.roomId.name : 'Unknown Room',
            checkIn: b.startDate,
            checkOut: b.endDate,
            totalPrice: b.totalPrice,
            status: b.status,
            verificationStatus: b.verificationStatus
        }));
        res.json(formattedBookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const { roomId, guestName, email, startDate, endDate } = req.body;

        // Basic validation
        if (!roomId || !startDate || !endDate) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        // Fetch room to get price
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Calculate total price
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const totalPrice = diffDays * room.price;

        const newBooking = new Booking({
            roomId,
            guestName,
            email,
            startDate,
            endDate,
            totalPrice,
            status: 'Pending' // Reservation is under progress, needs verification
        });

        await newBooking.save();

        // Send Confirmation Email in background so the user doesn't wait
        const sendBookingEmail = async () => {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Daulat Resort - Reservation In Progress',
                    html: `
                        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #c5a059; text-align: center;">Reservation In Progress</h2>
                            <p>Dear <strong>${guestName}</strong>,</p>
                            <p>Thank you for choosing Daulat Resort. Your reservation request has been successfully received and is currently under progress.</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Room:</strong> ${room.name}</p>
                                <p style="margin: 5px 0 0;"><strong>Dates:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
                                <p style="margin: 5px 0 0;"><strong>Total Price:</strong> ₹${totalPrice}</p>
                            </div>
                            <p>Our staff will call you shortly to verify your details and complete the booking process.</p>
                            <p style="text-align: center; color: #777; font-size: 12px; margin-top: 30px;">
                                Daulat Resort - Looking Forward to Your Visit
                            </p>
                        </div>
                    `
                });
                console.log(`Confirmation email sent to: ${email}`);
            } catch (emailErr) {
                console.error("Confirmation Email Error:", emailErr);
            }
        };

        sendBookingEmail(); // Must await this on Vercel or the Lambda freezes before it fires

        res.status(201).json(newBooking);
    } catch (err) {
        console.error("Booking Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Public gallery route
app.get('/api/gallery', async (req, res) => {
    try {
        const Gallery = mongoose.models.Gallery;
        if (!Gallery) return res.json([]);
        const images = await Gallery.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for: ${username}`);

        const user = await User.findOne({ username });

        if (!user) {
            console.log("User not found in database");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // --- 2-STEP VERIFICATION BASED ON USER PREFERENCE ---
        if (user.isTwoFactorEnabled) {
            // Check if device is trusted
            const { deviceId } = req.body;
            const isTrusted = user.trustedDevices.some(d => d.deviceId === deviceId && d.expiresAt > new Date());

            if (!isTrusted) {
                const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
                const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes expiry

                await User.findByIdAndUpdate(user._id, { otp, otpExpires });

                // Send OTP via Email in background so the user doesn't wait
                const sendOTP = async () => {
                    try {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                        });

                        await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: user.email,
                            subject: 'Daulat Resort - 2-Step Verification Code',
                            html: `
                                <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                                    <h2 style="color: #c5a059;">Your Safety Code</h2>
                                    <p>Please use the following 6-digit code to complete your login to the Admin Panel.</p>
                                    <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px; color: #333;">${otp}</h1>
                                    <p style="color: #777; font-size: 12px;">This code will expire in 10 minutes.</p>
                                </div>
                            `
                        });
                    } catch (err) {
                        console.error("OTP Email Error:", err);
                    }
                };

                sendOTP(); // Fire and forget! Doesn't block the response.

                return res.json({ twoFactor: true, message: "Verification code sent to your email." });
            }
        }

        // For non-admin roles, login directly
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                customPermissions: user.customPermissions
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- VERIFY OTP ---
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { username, otp } = req.body;
        const user = await User.findOne({ username });

        if (!user || user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(401).json({ message: "Invalid or expired verification code." });
        }

        // Clear OTP after successful verification
        const updateData = { otp: null, otpExpires: null };

        // Handle "Trust this device"
        const { deviceId, trustDevice } = req.body;
        if (trustDevice && deviceId) {
            const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days
            updateData.$push = { trustedDevices: { deviceId, expiresAt } };
        }

        await User.findByIdAndUpdate(user._id, updateData);

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '2h' }
        );

        res.json({
            token,
            user: {
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                customPermissions: user.customPermissions
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FORGOT PASSWORD ---

// Step 1: Send Reset Link
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email, username } = req.body;
        const users = await User.find({ email });

        if (users.length === 0) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        let user;
        if (users.length > 1) {
            if (!username) {
                return res.status(400).json({
                    needUsername: true,
                    message: "Multiple accounts found with this email. Please provide your username."
                });
            }
            user = users.find(u => u.username === username);
            if (!user) {
                return res.status(404).json({ message: "No user found with this email and username combination" });
            }
        } else {
            user = users[0];
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Daulat Resort - Password Reset',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Valid for 15 mins.</p>`
        });

        res.json({ message: "Reset link sent to your email." });
    } catch (err) {
        console.error("Email Error Details:", err);
        res.status(500).json({ message: "Error sending email. Check server console for details." });
    }
});

// Step 2: Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(400).json({ message: "Invalid or expired token." });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;

// Verify Nodemailer Email Configuration on Startup
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

console.log(`[Email Setup] Loading Gmail config for: ${process.env.EMAIL_USER || 'UNDEFINED'}`);
emailTransporter.verify()
    .then(() => console.log(`✅ SUCCESS: Nodemailer attached to Gmail -> ${process.env.EMAIL_USER}`))
    .catch((error) => {
        console.error("❌ CRITICAL: Nodemailer Failed to connect to Gmail!");
        console.error(error.message || error);
    });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daulat_resort')
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error(err));
