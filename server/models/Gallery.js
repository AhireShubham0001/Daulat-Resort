import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: 'General',
    },
    cloudId: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
