import { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    Edit2, 
    Trash2, 
    X, 
    Mail, 
    Phone, 
    Shield, 
    Camera,
    Lock,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = ['Owner', 'Manager', 'Receptionist', 'Accountant', 'Staff'];

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        contactNumber: '',
        role: 'Staff',
        profileImage: null,
        isTwoFactorEnabled: false
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Users Error:", err);
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '', // Password stays empty unless changing
                email: user.email || '',
                contactNumber: user.contactNumber || '',
                role: user.role || 'Staff',
                profileImage: null,
                isTwoFactorEnabled: user.isTwoFactorEnabled || false
            });
            setPreviewImage(user.profileImage);
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                email: '',
                contactNumber: '',
                role: 'Staff',
                profileImage: null,
                isTwoFactorEnabled: false
            });
            setPreviewImage(null);
        }
        setModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImage: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingUser) {
                await axios.put(`/api/admin/users/${editingUser._id}`, data, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                await axios.post('/api/admin/users', data, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }
            await fetchUsers();
            setModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`/api/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchUsers();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-resort-gold/10 text-resort-gold rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                        <p className="text-sm text-gray-500">Add and manage resort staff accounts</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-resort-gold hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition shadow-md"
                >
                    <UserPlus size={18} />
                    <span>Add New User</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Loader2 className="w-12 h-12 text-resort-gold animate-spin mb-4" />
                    <p className="text-gray-500 font-medium animate-pulse">Loading staff members...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <motion.div 
                            layout
                            key={user._id} 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            {user.profileImage ? (
                                                <img 
                                                    src={user.profileImage} 
                                                    alt={user.username} 
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-resort-gold/20"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-resort-gold font-bold text-2xl uppercase border-2 border-gray-50">
                                                    {user.username.charAt(0)}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg uppercase flex items-center">
                                                {user.username}
                                                {user.isTwoFactorEnabled && (
                                                    <Lock size={14} className="ml-2 text-green-500" title="2FA Enabled" />
                                                )}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-resort-gold/10 text-resort-gold text-xs font-bold rounded-full uppercase tracking-wider">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <button 
                                            onClick={() => handleOpenModal(user)}
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(user._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <Mail size={16} className="mr-3 text-gray-400" />
                                        <span>{user.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <Phone size={16} className="mr-3 text-gray-400" />
                                        <span>{user.contactNumber || 'No contact provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingUser ? 'Update User Details' : 'Register New User'}
                                </h2>
                                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Profile Image Upload */}
                                <div className="flex flex-col items-center">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-md bg-gray-100 flex items-center justify-center">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={40} className="text-gray-300" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-2 bg-resort-gold text-white rounded-full shadow-lg cursor-pointer hover:bg-yellow-600 transition">
                                            <Camera size={16} />
                                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Upload Profile Photo</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Username</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="Enter username"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">
                                            {editingUser ? 'Update Password (Leave blank to keep current)' : 'Password'}
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input 
                                                required={!editingUser}
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input 
                                                type="email" 
                                                placeholder="email@daulatresort.com"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Contact Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <input 
                                                type="tel" 
                                                placeholder="+91 XXXXX XXXXX"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                                value={formData.contactNumber}
                                                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-gray-700">Resort Role</label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                            <select 
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition appearance-none"
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                            >
                                                {ROLES.map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 2FA Toggle */}
                                    <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${formData.isTwoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700">2-Step Verification</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Requires email code at login</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, isTwoFactorEnabled: !formData.isTwoFactorEnabled})}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isTwoFactorEnabled ? 'bg-resort-gold' : 'bg-gray-300'}`}
                                        >
                                            <span 
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isTwoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} 
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 flex space-x-4">
                                    <button 
                                        type="button"
                                        disabled={submitLoading}
                                        onClick={() => setModalOpen(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-bold disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submitLoading}
                                        className="flex-1 px-4 py-3 bg-resort-gold hover:bg-yellow-600 text-white rounded-lg transition shadow-lg shadow-yellow-200 font-bold flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {submitLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
