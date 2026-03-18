import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daulat_resort')
    .then(async () => {
        const UserSchema = new mongoose.Schema({
            username: String,
            role: String
        }, { strict: false });
        const User = mongoose.model('UserDebug', UserSchema, 'users');
        
        const users = await User.find({}, 'username role');
        console.log("Found Users:");
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
