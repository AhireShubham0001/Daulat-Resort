import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trash, Plus, Upload, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [title, setTitle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const res = await axios.get('/api/admin/gallery', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setImages(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching gallery:", err);
            if (err.response?.status === 401) navigate('/login');
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData();
        formData.append('image', newImage);
        formData.append('title', title);

        try {
            await axios.post('https://github.com/AhireShubham0001/Daulat-Resortadmin/gallery', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                onUploadProgress: (e) => {
                    const pct = Math.round((e.loaded * 100) / e.total);
                    console.log(`Gallery upload: ${pct}%`);
                },
            });
            fetchGallery();
            setNewImage(null);
            setTitle('');
        } catch (err) {
            console.error("Upload failed:", err);
            if (err.response?.status === 401) return navigate('/login');
            const msg = err.response?.data?.message || 'Upload failed. Check image size (max 20 MB).';
            alert(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete from Cloudinary too.")) return;
        try {
            await axios.delete(`/api/admin/gallery/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setImages(images.filter(img => img._id !== id));
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate('/login');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Gallery Management (Cloudinary)</h2>

            {/* Upload Form */}
            <form onSubmit={handleUpload} className="mb-8 p-4 bg-gray-50 rounded border border-dashed border-gray-300">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input
                        type="file"
                        onChange={(e) => setNewImage(e.target.files[0])}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Image Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border p-2 rounded w-full md:w-auto flex-grow"
                        required
                    />
                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                    >
                        {uploading ? <><Loader2 size={18} className="mr-2 animate-spin" /> Uploading...</> : <><Upload size={18} className="mr-2" /> Upload</>}
                    </button>
                </div>
            </form>

            {/* Gallery Grid */}
            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <motion.div
                            key={img._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition bg-gray-100"
                        >
                            <img src={img.imageUrl} alt={img.title} className="w-full h-40 object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-2 truncate">
                                {img.title}
                            </div>
                            <button
                                onClick={() => handleDelete(img._id)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                            >
                                <Trash size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
