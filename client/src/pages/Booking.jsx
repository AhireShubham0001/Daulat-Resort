import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Mail, CreditCard, CheckCircle, BedDouble } from 'lucide-react';
import Footer from '../components/Footer';

export default function Booking() {
    const [searchParams] = useSearchParams();
    const initialRoomId = searchParams.get('roomId') || '';
    const [status, setStatus] = useState('idle');
    const [rooms, setRooms] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [allBookings, setAllBookings] = useState([]);

    const [form, setForm] = useState({
        guestName: '',
        email: '',
        startDate: '',
        endDate: '',
        roomId: initialRoomId
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomsRes, bookingsRes] = await Promise.all([
                    axios.get('/api/rooms'),
                    axios.get('/api/bookings')
                ]);
                setRooms(roomsRes.data);
                setAvailableRooms(roomsRes.data);
                setAllBookings(bookingsRes.data);
            } catch (err) {
                console.error("Fetch Data Error:", err);
            }
        };
        fetchData();
    }, []);

    // Effect to filter rooms based on availability when dates change
    useEffect(() => {
        if (!form.startDate || !form.endDate || rooms.length === 0) {
            setAvailableRooms(rooms);
            return;
        }

        const start = new Date(form.startDate);
        const end = new Date(form.endDate);

        if (start >= end) {
            setAvailableRooms([]);
            return;
        }

        const bookedRoomIds = allBookings
            .filter(booking => {
                const bStart = new Date(booking.checkIn || booking.startDate);
                const bEnd = new Date(booking.checkOut || booking.endDate);
                // Overlap check: (StartDate1 <= EndDate2) and (EndDate1 >= StartDate2)
                return start < bEnd && end > bStart && booking.status !== 'Cancelled';
            })
            .map(booking => booking.roomId?._id || booking.roomId);

        const filtered = rooms.filter(room => !bookedRoomIds.includes(room._id));
        setAvailableRooms(filtered);

        // If currently selected room is no longer available, clear it
        if (form.roomId && !filtered.find(r => r._id === form.roomId)) {
            setForm(prev => ({ ...prev, roomId: '' }));
        }
    }, [form.startDate, form.endDate, rooms, allBookings]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        // Simulate slight delay for UX
        setTimeout(async () => {
            try {
                await axios.post('/api/bookings', form);
                setStatus('success');
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        }, 1500);
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-resort-cream flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-resort-dark mb-4">Reservation Confirmed!</h2>
                    <p className="text-gray-600 mb-8">Thank you, {form.guestName}. Check your email ({form.email}) for details.</p>
                    <button onClick={() => window.location.href = '/'} className="bg-resort-gold text-white px-8 py-3 rounded-full hover:bg-resort-gold-dark transition font-bold shadow-lg">
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-resort-cream pt-32 pb-12">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Left Side: Illustration / Info */}
                <div className="hidden md:flex flex-col justify-center space-y-6">
                    <h1 className="text-5xl font-serif font-bold text-resort-dark leading-tight">
                        Your Wait is Over.<br />
                        <span className="text-resort-gold">Just One Click Away.</span>
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Secure your stay at Daulat Resort. We look forward to creating unforgettable memories with you.
                    </p>
                    <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm">
                        <h3 className="font-bold text-resort-dark mb-2">Need Assistance?</h3>
                        <p className="text-sm text-gray-500">Call our 24/7 concierge at +1 (800) 123-4567 or email reservations@daulatresort.com</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-resort-gold via-yellow-400 to-resort-gold"></div>
                    <h2 className="text-3xl font-serif font-bold text-resort-dark mb-8 text-center">Book Your Stay</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Guest Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="guestName"
                                    required
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-resort-gold focus:ring-2 focus:ring-resort-gold/20 outline-none transition bg-gray-50 focus:bg-white"
                                    placeholder="Full Name"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-resort-gold focus:ring-2 focus:ring-resort-gold/20 outline-none transition bg-gray-50 focus:bg-white"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Check-In</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-resort-gold focus:ring-2 focus:ring-resort-gold/20 outline-none transition bg-gray-50 focus:bg-white text-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 ml-1">Check-Out</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="endDate"
                                        required
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-resort-gold focus:ring-2 focus:ring-resort-gold/20 outline-none transition bg-gray-50 focus:bg-white text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Select Accomodation</label>
                            <div className="relative">
                                <BedDouble className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <select
                                    name="roomId"
                                    required
                                    value={form.roomId}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-resort-gold focus:ring-2 focus:ring-resort-gold/20 outline-none transition bg-gray-50 focus:bg-white appearance-none"
                                >
                                    <option value="">{availableRooms.length > 0 ? 'Choose a Room' : 'No rooms available for these dates'}</option>
                                    {availableRooms.map(room => (
                                        <option key={room._id} value={room._id}>
                                            {room.name} — ₹{room.price}/night
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {!form.startDate || !form.endDate ? (
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">* Select dates first to see availability</p>
                            ) : null}
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-4 mt-4 bg-resort-dark text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {status === 'loading' ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Confirm Reservation</span>
                                    <CreditCard size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
}
