import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash, Plus, Upload, X, Save, Loader2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // ADD Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        capacity: '',
        amenities: '',
    });
    const [files, setFiles] = useState([]);

    // EDIT Modal State
    const [editRoom, setEditRoom] = useState(null); // the room being edited (or null)
    const [editFormData, setEditFormData] = useState({
        name: '',
        price: '',
        description: '',
        capacity: '',
        amenities: '',
    });
    const [editFiles, setEditFiles] = useState([]);
    const [editUploading, setEditUploading] = useState(false);
    const [deletedImages, setDeletedImages] = useState([]); // URLs marked for removal

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get('/api/rooms');
            setRooms(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching rooms:", err);
            setLoading(false);
        }
    };

    // ---- ADD ROOM ----
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('capacity', formData.capacity);
        data.append('amenities', formData.amenities.split(',').map(a => a.trim()));

        for (let i = 0; i < files.length; i++) {
            data.append('images', files[i]);
        }

        try {
            await axios.post('http://localhost:5000/api/admin/rooms', data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                onUploadProgress: (e) => {
                    const pct = Math.round((e.loaded * 100) / e.total);
                    console.log(`Upload progress: ${pct}%`);
                },
            });
            fetchRooms();
            setShowForm(false);
            setFormData({ name: '', price: '', description: '', capacity: '', amenities: '' });
            setFiles([]);
        } catch (err) {
            console.error("Upload failed:", err);
            if (err.response?.status === 401) return navigate('/login');
            const msg = err.response?.data?.message || 'Failed to create room. Check image sizes (max 20 MB each).';
            alert(msg);
        } finally {
            setUploading(false);
        }
    };

    // ---- DELETE ROOM ----
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            await axios.delete(`/api/admin/rooms/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRooms(rooms.filter(r => r._id !== id));
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate('/login');
        }
    };

    // ---- EDIT ROOM ----
    const openEditModal = (room) => {
        setEditRoom(room);
        setEditFormData({
            name: room.name || '',
            price: room.price || '',
            description: room.description || '',
            capacity: room.capacity || room.occupancy || '',
            amenities: (room.amenities || []).join(', '),
        });
        setEditFiles([]);
        setDeletedImages([]);
    };

    const closeEditModal = () => {
        setEditRoom(null);
        setEditFiles([]);
        setDeletedImages([]);
    };

    // Toggle an image URL in/out of the deletedImages list
    const handleDeleteImage = (url) => {
        setDeletedImages(prev =>
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        );
    };

    const handleEditInputChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditUploading(true);

        const data = new FormData();
        data.append('name', editFormData.name);
        data.append('price', editFormData.price);
        data.append('description', editFormData.description);
        data.append('capacity', editFormData.capacity);
        data.append('amenities', editFormData.amenities.split(',').map(a => a.trim()).join(','));

        for (let i = 0; i < editFiles.length; i++) {
            data.append('images', editFiles[i]);
        }

        // Send the list of deleted image URLs so server can remove them
        if (deletedImages.length > 0) {
            data.append('deletedImages', JSON.stringify(deletedImages));
        }

        try {
            const res = await axios.put(`http://localhost:5000/api/admin/rooms/${editRoom._id}`, data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                onUploadProgress: (e) => {
                    const pct = Math.round((e.loaded * 100) / e.total);
                    console.log(`Edit upload progress: ${pct}%`);
                },
            });
            setRooms(rooms.map(r => r._id === editRoom._id ? res.data : r));
            closeEditModal();
        } catch (err) {
            console.error("Edit failed:", err);
            if (err.response?.status === 401) return navigate('/login');
            const msg = err.response?.data?.message || 'Failed to update room. Check image sizes (max 20 MB each).';
            alert(msg);
        } finally {
            setEditUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-resort-gold text-white px-4 py-2 rounded-lg flex items-center hover:bg-yellow-600 transition"
                >
                    {showForm ? <X className="mr-2" /> : <Plus className="mr-2" />}
                    {showForm ? 'Cancel' : 'Add New Room'}
                </button>
            </div>

            {/* ADD ROOM FORM */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input name="name" placeholder="Room Name (e.g. Deluxe Suite)" value={formData.name} onChange={handleInputChange} className="p-2 border rounded" required />
                        <input name="price" type="number" placeholder="Price per Night (₹)" value={formData.price} onChange={handleInputChange} className="p-2 border rounded" required />
                        <input name="capacity" type="number" placeholder="Capacity (Guests)" value={formData.capacity} onChange={handleInputChange} className="p-2 border rounded" required />
                        <input name="amenities" placeholder="Amenities (comma separated: Wifi, TV, AC)" value={formData.amenities} onChange={handleInputChange} className="p-2 border rounded" />
                    </div>
                    <textarea name="description" placeholder="Room Description" value={formData.description} onChange={handleInputChange} className="w-full p-2 border rounded mb-4 h-24" required />

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-2">Room Images (Select Multiple)</label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setFiles(e.target.files)}
                            className="w-full p-2 border rounded bg-white"
                            accept="image/*"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 w-full flex justify-center items-center"
                    >
                        {uploading ? <><Loader2 size={20} className="mr-2 animate-spin" /> Uploading to Server...</> : <><Save size={20} className="mr-2" /> Create Room</>}
                    </button>
                </form>
            )}

            {/* ROOMS LIST */}
            {loading ? <p>Loading rooms...</p> : (
                <div className="grid gap-6">
                    {rooms.map((room) => (
                        <div key={room._id} className="border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start shadow-sm hover:shadow-md transition">
                            {/* Room Image Preview (Cover) */}
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                {room.images && room.images.length > 0 ? (
                                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>

                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
                                <p className="text-resort-gold font-bold">₹{room.price} <span className="text-gray-400 text-sm font-normal">/ night</span></p>
                                {(room.capacity || room.occupancy) && (
                                    <p className="text-gray-500 text-sm mt-1">
                                        👥 Capacity: <span className="font-semibold text-gray-700">{room.capacity || room.occupancy} guests</span>
                                    </p>
                                )}
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{room.description}</p>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {(room.amenities || []).map((am, i) => (
                                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{am}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 self-start md:self-center shrink-0">
                                <button
                                    onClick={() => openEditModal(room)}
                                    className="text-blue-500 hover:bg-blue-50 p-2 rounded transition"
                                    title="Edit Room"
                                >
                                    <Pencil size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(room._id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                                    title="Delete Room"
                                >
                                    <Trash size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {rooms.length === 0 && <p className="text-center text-gray-500 py-10">No rooms found. Add one above!</p>}
                </div>
            )}

            {/* EDIT ROOM MODAL */}
            {editRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Pencil size={22} className="text-blue-500" />
                                Edit Room
                            </h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleEditSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Room Name</label>
                                    <input
                                        name="name"
                                        placeholder="Room Name"
                                        value={editFormData.name}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price per Night (₹)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        placeholder="Price"
                                        value={editFormData.price}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity (Guests)</label>
                                    <input
                                        name="capacity"
                                        type="number"
                                        placeholder="Capacity"
                                        value={editFormData.capacity}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Amenities (comma separated)</label>
                                    <input
                                        name="amenities"
                                        placeholder="Wifi, TV, AC..."
                                        value={editFormData.amenities}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Room Description"
                                    value={editFormData.description}
                                    onChange={handleEditInputChange}
                                    className="w-full p-2 border rounded h-24 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    required
                                />
                            </div>

                            {/* Current Images Preview with Delete */}
                            {editRoom.images && editRoom.images.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Current Images
                                        {deletedImages.length > 0 && (
                                            <span className="ml-2 text-xs text-red-500 font-normal">
                                                ({deletedImages.length} marked for removal)
                                            </span>
                                        )}
                                    </label>
                                    <div className="flex gap-3 flex-wrap">
                                        {editRoom.images.map((img, i) => {
                                            const isDeleted = deletedImages.includes(img);
                                            return (
                                                <div key={i} className="relative group w-20 h-16">
                                                    <img
                                                        src={img}
                                                        alt={`Room ${i + 1}`}
                                                        className={`w-full h-full object-cover rounded-lg border-2 transition-all ${
                                                            isDeleted
                                                                ? 'opacity-30 border-red-400 grayscale'
                                                                : 'border-transparent'
                                                        }`}
                                                    />
                                                    {/* Delete / Undo button – top-right corner */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteImage(img)}
                                                        className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow transition-all ${
                                                            isDeleted
                                                                ? 'bg-gray-400 hover:bg-gray-500'
                                                                : 'bg-red-500 hover:bg-red-600'
                                                        }`}
                                                        title={isDeleted ? 'Undo remove' : 'Remove image'}
                                                    >
                                                        {isDeleted ? '↩' : '×'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Replace Images (optional — leave empty to keep current images)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setEditFiles(e.target.files)}
                                    className="w-full p-2 border rounded bg-white"
                                    accept="image/*"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 border border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editUploading}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 flex justify-center items-center transition"
                                >
                                    {editUploading
                                        ? <><Loader2 size={20} className="mr-2 animate-spin" /> Saving...</>
                                        : <><Save size={20} className="mr-2" /> Save Changes</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRooms;
