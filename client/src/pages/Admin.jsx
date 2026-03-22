import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CalendarCheck,
    BedDouble,
    Users,
    LogOut,
    Menu,
    X,
    Star,
    Image,
    Settings,
    Home
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminGallery from '../components/AdminGallery';
import AdminRooms from '../components/AdminRooms';
import AdminUsers from '../components/AdminUsers';
import AdminBookings from '../components/AdminBookings';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({ bookings: 0, revenue: 0, occupancy: 0 });
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
        fetchBookings();

        // Get user data from localStorage
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser && savedUser !== "undefined") {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } else {
                // Fallback for current sessions that haven't re-logged in
                setUser({ username: 'Admin', role: 'Staff' });
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
            setUser({ username: 'Admin', role: 'Staff' });
        }
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/admin/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate('/login');
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/bookings', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getMenuItems = () => {
        if (!user) return [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> }];

        const allItems = [
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, active: true },
            { id: 'bookings', label: 'Bookings', icon: <CalendarCheck size={20} />, active: user.role === 'Owner' || user.customPermissions?.bookings?.view },
            { id: 'rooms', label: 'Manage Rooms', icon: <BedDouble size={20} />, active: user.role === 'Owner' || user.customPermissions?.rooms?.view },
            { id: 'gallery', label: 'Gallery', icon: <Image size={20} />, active: user.role === 'Owner' || user.customPermissions?.gallery?.view },
            { id: 'users', label: 'Staff & Roles', icon: <Users size={20} />, active: user.role === 'Owner' || user.customPermissions?.users?.manage },
            { id: 'settings', label: 'Settings', icon: <Settings size={20} />, active: user.role === 'Owner' || user.customPermissions?.settings?.view },
        ];
        return allItems.filter(item => item.active);
    };

    const menuItems = getMenuItems();

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Mobile Sidebar Toggle */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-resort-dark text-white rounded-md shadow-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -250 }}
                animate={{ x: sidebarOpen || window.innerWidth >= 768 ? 0 : -250 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed md:static inset-y-0 left-0 z-40 w-64 bg-resort-dark text-white flex flex-col shadow-2xl"
            >
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-serif font-bold text-resort-gold">Admin Panel</h2>
                    <p className="text-xs text-gray-400 mt-1">Daulat Resort Management</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${activeTab === item.id
                                ? 'bg-resort-gold text-white shadow-md'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700 flex flex-col space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600/30 text-gray-300 hover:bg-gray-500 hover:text-white rounded-lg transition-colors duration-200"
                    >
                        <Home size={18} />
                        <span>Back to Website</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 bg-gray-50">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 capitalize">{activeTab}</h1>
                        <p className="text-gray-500">Overview & Management</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-3 group cursor-default" title={user.username}>
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-gray-800 uppercase leading-none">{user.username}</p>
                                    <p className="text-[10px] text-resort-gold font-bold uppercase tracking-widest">{user.role}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-resort-gold overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-white font-bold ring-2 ring-resort-gold/20 transition group-hover:ring-resort-gold/40">
                                    {(user && user.profileImage) ? (
                                        <img src={user.profileImage} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        (user?.username || 'A').charAt(0).toUpperCase()
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                        )}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* DASHBOARD VIEW */}
                        {activeTab === 'dashboard' && (
                            <div className="flex flex-col gap-6">
                                {/* KPIs Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <StatCard title="Total Bookings" value={stats.bookings || 0} icon={<CalendarCheck />} color="bg-blue-500" />
                                    <StatCard title="Pending Review" value={stats.pendingBookings || 0} icon={<CalendarCheck />} color="bg-yellow-500" />
                                    <StatCard title="Total Revenue" value={`₹${(stats.revenue || 0).toLocaleString()}`} icon={<Star />} color="bg-green-500" />
                                    <StatCard title="Occupancy Today" value={`${stats.occupancy || 0}%`} icon={<BedDouble />} color="bg-purple-500" />
                                    <StatCard title="Rooms Occupied" value={`${stats.occupiedRoomsCount || 0} / ${stats.rooms || 0}`} icon={<BedDouble />} color="bg-indigo-500" />
                                    <StatCard title="Total Users" value={stats.users || 0} icon={<Users />} color="bg-orange-500" />
                                </div>

                                {/* Recent Activity Table */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">Recent Booking Activity</h3>
                                        <button onClick={() => setActiveTab('bookings')} className="text-sm font-medium text-resort-gold transition hover:text-resort-dark">
                                            View All
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead>
                                                <tr className="text-gray-400 border-b border-gray-100">
                                                    <th className="pb-3 px-2 font-medium">Guest & Check-in</th>
                                                    <th className="pb-3 px-2 font-medium">Room Type</th>
                                                    <th className="pb-3 px-2 font-medium text-center">Payment Status</th>
                                                    <th className="pb-3 px-2 font-medium text-center">Staff Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-600">
                                                {bookings.slice(0, 5).map((booking, i) => {
                                                    const getVerifStyle = (s) => {
                                                        if (s === 'Completed') return 'bg-blue-100 text-blue-700';
                                                        if (s === 'Verified') return 'bg-purple-100 text-purple-700';
                                                        if (s === 'Called') return 'bg-orange-100 text-orange-700';
                                                        return 'bg-gray-100 text-gray-500';
                                                    };
                                                    return (
                                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                                                            <td className="py-3 px-2">
                                                                <div className="flex flex-col">
                                                                    <span className="text-resort-dark font-medium">{booking.guestName}</span>
                                                                    <span className="text-[11px] text-gray-400">{new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-2 text-sm">{booking.roomType}</td>
                                                            <td className="py-3 px-2 text-center">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                                    {booking.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2 text-center">
                                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getVerifStyle(booking.verificationStatus)}`}>
                                                                    {booking.verificationStatus || 'Waiting'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {bookings.length === 0 && <tr><td colSpan="4" className="py-6 text-center text-gray-400">No recent bookings found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NEW ADMIN TABS */}
                        {activeTab === 'gallery' && <AdminGallery />}
                        {activeTab === 'rooms' && <AdminRooms />}
                        {activeTab === 'users' && <AdminUsers />}
                        {activeTab === 'bookings' && <AdminBookings />}

                        {activeTab === 'settings' && <div className="bg-white p-6 rounded-lg shadow">Settings (Coming Soon)</div>}

                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition duration-300">
        <div className={`p-3 rounded-lg text-white ${color} shadow-lg shadow-gray-200`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);
