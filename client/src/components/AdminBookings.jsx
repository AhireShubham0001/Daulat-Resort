import { useState, useEffect } from 'react';
import { 
    Calendar, 
    Phone, 
    CheckCircle, 
    XCircle, 
    Clock, 
    User, 
    Mail, 
    MessageSquare,
    ChevronRight,
    Search,
    Filter,
    LayoutList
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AdminCalendarView from './AdminCalendarView';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/admin/bookings', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setBookings(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Bookings Error:", err);
            setLoading(false);
        }
    };

    const updateStatus = async (id, status, type = 'status') => {
        try {
            const payload = type === 'verification' ? { verificationStatus: status } : { status: status };
            await axios.put(`/api/admin/bookings/${id}`, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchBookings();
        } catch (err) {
            console.error("Update Status Error:", err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getVerifColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-blue-100 text-blue-700';
            case 'Verified': return 'bg-purple-100 text-purple-700';
            case 'Called': return 'bg-orange-100 text-orange-700';
            case 'Waiting': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesFilter = filter === 'All' || b.status === filter || b.verificationStatus === filter;
        const matchesSearch = b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             b.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-resort-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2">
                    <Filter size={18} className="text-gray-400" />
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium text-gray-600 focus:ring-0"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                        <hr />
                        <option value="Waiting">Waiting Verification</option>
                        <option value="Called">Called</option>
                        <option value="Verified">Verified</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search guest or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-resort-gold/20 transition"
                    />
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow text-resort-dark pointer-events-none' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutList size={16} /> List
                    </button>
                    <button 
                        onClick={() => setViewMode('calendar')} 
                        className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white shadow text-resort-dark pointer-events-none' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Calendar size={16} /> Calendar
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'calendar' ? (
                <AdminCalendarView bookings={filteredBookings} />
            ) : (
            <div className="grid grid-cols-1 gap-4">
                {filteredBookings.map((booking) => (
                    <motion.div 
                        layout
                        key={booking._id} 
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300"
                    >
                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-resort-cream rounded-lg text-resort-dark">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{booking.guestName}</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Mail size={14} /> {booking.email}
                                        </p>
                                        <p className="text-sm text-resort-gold font-bold flex items-center gap-1">
                                            <MessageSquare size={14} /> {booking.roomId?.name || 'Unknown Room'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-xs font-bold uppercase tracking-wider">
                                        <span className={`px-2 py-1 rounded-md ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                        <span className={`px-2 py-1 rounded-md ${getVerifColor(booking.verificationStatus)}`}>
                                            {booking.verificationStatus}
                                        </span>
                                    </div>
                                    {booking.lastModifiedBy && (
                                        <p className="text-[11px] text-gray-400 mt-2 font-normal">
                                            Modified by <span className="font-semibold text-gray-500">{booking.lastModifiedBy.username || 'Admin'}</span> on {new Date(booking.updatedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-800">₹{booking.totalPrice}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {/* Action: Call */}
                                    {booking.verificationStatus === 'Waiting' && (
                                        <button 
                                            onClick={() => updateStatus(booking._id, 'Called', 'verification')}
                                            className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
                                            title="Mark as Called"
                                        >
                                            <Phone size={18} />
                                        </button>
                                    )}
                                    
                                    {/* Action: Verify */}
                                    {booking.verificationStatus === 'Called' && (
                                        <button 
                                            onClick={() => updateStatus(booking._id, 'Verified', 'verification')}
                                            className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                                            title="Mark as Verified"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}

                                    {/* Action: Complete */}
                                    {(booking.verificationStatus === 'Verified' || booking.verificationStatus === 'Called') && (
                                        <button 
                                            onClick={() => updateStatus(booking._id, 'Completed', 'verification')}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                            title="Complete Process"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}

                                    {/* Action: Cancel */}
                                    {booking.status !== 'Cancelled' && (
                                        <button 
                                            onClick={() => updateStatus(booking._id, 'Cancelled')}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                            title="Cancel Booking"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {filteredBookings.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                        <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No bookings found matching your criteria.</p>
                    </div>
                )}
            </div>
            )}
        </div>
    );
}
