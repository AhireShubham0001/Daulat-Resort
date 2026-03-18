import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daulat_resort')
    .then(async () => {
        console.log("Connected to MongoDB");

        // Define minimal User schema for reset
        const UserSchema = new mongoose.Schema({
            username: { type: String, unique: true },
            password: { type: String },
            role: { type: String, default: 'user' }
        });
        const User = mongoose.model('User', UserSchema);

        // Hash plaintext 'adminpassword'
        const passwordHash = await bcrypt.hash('adminpassword', 10);

        try {
            await User.findOneAndUpdate(
                { username: 'admin' },
                { password: passwordHash, role: 'Owner' },
                { upsert: true, new: true }
            );
            console.log("-----------------------------------------");
            console.log("ADMIN PASSWORD RESET SUCCESSFUL");
            console.log("Username: admin");
            console.log("Password: adminpassword");
            console.log("-----------------------------------------");
        } catch (err) {
            console.error("Error creating admin:", err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch((err) => console.error("MongoDB Connection Failed:", err));
