import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi, Users, ArrowRight, X, Star,
    ChevronLeft, ChevronRight, BedDouble, Bath,
    Coffee, Tv, Wind, Dumbbell, Car, UtensilsCrossed,
    CheckCircle2
} from 'lucide-react';
import Footer from '../components/Footer';

// ── Icon map for common amenities ──
const amenityIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('wifi') || n.includes('wi-fi'))  return <Wifi size={15} />;
    if (n.includes('tv') || n.includes('television')) return <Tv size={15} />;
    if (n.includes('bed'))    return <BedDouble size={15} />;
    if (n.includes('bath') || n.includes('tub'))  return <Bath size={15} />;
    if (n.includes('coffee') || n.includes('breakfast')) return <Coffee size={15} />;
    if (n.includes('ac') || n.includes('air'))    return <Wind size={15} />;
    if (n.includes('gym') || n.includes('fitness')) return <Dumbbell size={15} />;
    if (n.includes('park') || n.includes('car'))  return <Car size={15} />;
    if (n.includes('kitchen') || n.includes('dining')) return <UtensilsCrossed size={15} />;
    if (n.includes('pool'))   return <span className="text-sm">🏊</span>;
    if (n.includes('butler')) return <span className="text-sm">🎩</span>;
    if (n.includes('jacuzzi') || n.includes('spa')) return <span className="text-sm">♨️</span>;
    if (n.includes('bar'))    return <span className="text-sm">🍸</span>;
    if (n.includes('ocean') || n.includes('view')) return <span className="text-sm">🌊</span>;
    return <CheckCircle2 size={15} />;
};

// ── Slider used inside both card and popup ──
const ImageSlider = ({ images, roomName, height = 'h-64', large = false }) => {
    const fallback = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1200";
    const slides = images && images.length > 0 ? images : [fallback];
    const [current, setCurrent] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        setCurrent(0);
    }, [images]);

    useEffect(() => {
        if (slides.length <= 1) return;
        timerRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timerRef.current);
    }, [slides.length]);

    const goTo = (idx) => {
        clearInterval(timerRef.current);
        setCurrent(idx);
        if (slides.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrent(prev => (prev + 1) % slides.length);
            }, 3000);
        }
    };

    const prev = () => goTo((current - 1 + slides.length) % slides.length);
    const next = () => goTo((current + 1) % slides.length);

    return (
        <div className={`relative ${height} bg-gray-900 overflow-hidden`}>
            <AnimatePresence mode="wait">
                <motion.img
                    key={slides[current]}
                    src={slides[current]}
                    alt={`${roomName} - ${current + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>

            {/* Prev / Next arrows — only in large mode */}
            {large && slides.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition backdrop-blur-sm"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition backdrop-blur-sm"
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            {/* Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`rounded-full transition-all duration-300 ${
                                i === current
                                    ? 'w-5 h-2 bg-white'
                                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Counter badge */}
            {slides.length > 1 && (
                <div className="absolute top-3 left-3 z-20 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                    {current + 1} / {slides.length}
                </div>
            )}
        </div>
    );
};

// ── Full-detail popup modal ──
const RoomDetailModal = ({ room, onClose }) => {
    const navigate = useNavigate();

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!room) return null;

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Modal panel */}
                <motion.div
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
                    initial={{ opacity: 0, scale: 0.92, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 40 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 rounded-full p-2 shadow-lg transition"
                    >
                        <X size={20} />
                    </button>

                    {/* Large image slider */}
                    <div className="rounded-t-3xl overflow-hidden">
                        <ImageSlider images={room.images} roomName={room.name} height="h-72 md:h-96" large />
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-gray-900">{room.name}</h2>
                                <div className="flex items-center gap-3 mt-1.5 text-gray-500 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Users size={15} />
                                        {room.capacity || room.occupancy || 2} Guests
                                    </span>
                                    {/* Star rating (static decoration) */}
                                    <span className="flex items-center gap-0.5 text-yellow-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                                    </span>
                                </div>
                            </div>
                            {/* Price */}
                            <div className="text-right shrink-0">
                                <p className="text-3xl font-bold text-resort-dark">
                                    ₹{room.price}
                                </p>
                                <p className="text-gray-400 text-sm">per night</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-100 mb-5" />

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">About this room</h3>
                            <p className="text-gray-600 leading-relaxed">{room.description || 'Enjoy a comfortable and luxurious stay in this beautiful room.'}</p>
                        </div>

                        {/* Amenities */}
                        {(room.amenities || []).length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Amenities</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {(room.amenities || []).map((am, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700"
                                        >
                                            <span className="text-resort-gold shrink-0">{amenityIcon(am)}</span>
                                            {am}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                            <Link
                                to={`/booking?roomId=${room._id}`}
                                className="flex-1 bg-resort-dark text-white font-bold py-3 rounded-xl hover:bg-resort-gold transition flex items-center justify-center gap-2 shadow-lg"
                            >
                                Book This Room <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ── Room card ──
const RoomCard = ({ room, onViewDetails }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl border border-gray-100"
    >
        {/* Sliding image carousel */}
        <div className="relative">
            <ImageSlider images={room.images} roomName={room.name} height="h-64" />
            {/* Room name & guests */}
            <div className="absolute bottom-4 left-4 z-20 text-white pointer-events-none">
                <h3 className="text-2xl font-serif font-bold drop-shadow">{room.name}</h3>
                <p className="flex items-center text-sm opacity-90">
                    <Users size={14} className="mr-1" />
                    {room.capacity || room.occupancy || 2} Guests
                </p>
            </div>
            {/* Price badge */}
            <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-resort-dark font-bold text-sm shadow-sm">
                ₹{room.price} <span className="text-xs font-normal text-gray-500">/ night</span>
            </div>
        </div>

        <div className="p-6">
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{room.description}</p>

            {/* Top 3 amenities */}
            <div className="flex flex-wrap gap-2 mb-5">
                {(room.amenities || []).slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-medium border border-gray-100 flex items-center gap-1">
                        <span className="text-resort-gold">{amenityIcon(amenity)}</span>
                        {amenity}
                    </span>
                ))}
                {(room.amenities || []).length > 3 && (
                    <span className="text-gray-400 text-xs self-center">+{room.amenities.length - 3} more</span>
                )}
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={() => onViewDetails(room)}
                    className="text-resort-gold font-bold text-sm hover:underline underline-offset-4 decoration-2 transition"
                >
                    View Details
                </button>
                <Link
                    to={`/booking?roomId=${room._id}`}
                    className="px-6 py-2 bg-resort-dark text-white rounded-lg hover:bg-resort-gold transition shadow-md hover:shadow-lg flex items-center text-sm font-medium"
                >
                    Book Now <ArrowRight size={16} className="ml-2" />
                </Link>
            </div>
        </div>
    </motion.div>
);

// ── Main Rooms page ──
export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            axios.get('/api/rooms')
                .then(res => setRooms(res.data))
                .catch(() => {
                    setRooms([
                        { _id: '1', name: 'Ocean Villa', price: 450, description: 'Wake up to the sound of waves in this stunning oceanfront villa. Features a private infinity pool and direct beach access.', amenities: ['Pool', 'Wifi', 'King Bed', 'Ocean View', 'AC', 'TV'], capacity: 2, images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800"] },
                        { _id: '2', name: 'Garden Suite', price: 200, description: 'Surrounded by lush tropical gardens, this suite offers tranquility and privacy. Perfect for couples seeking a romantic getaway.', amenities: ['Wifi', 'Breakfast', 'Garden View', 'Bathtub', 'TV'], capacity: 2, images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800"] },
                        { _id: '3', name: 'Presidential Penthouse', price: 1200, description: 'The ultimate luxury experience. Top floor penthouse with panoramic 360-degree views, personal butler service, and private jacuzzi.', amenities: ['Jacuzzi', 'Butler', 'Wifi', 'Bar', 'Gym Access', 'AC', 'Ocean View'], capacity: 4, images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800"] },
                        { _id: '4', name: 'Family Bungalow', price: 350, description: 'Spacious accommodation for the whole family. Includes a kitchenette, living area, and easy access to the kids club.', amenities: ['Kitchen', 'Wifi', '2 Bedrooms', 'TV', 'Parking'], capacity: 4, images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"] },
                    ]);
                })
                .finally(() => setLoading(false));
        }, 1000);
    }, []);

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
            <div className="w-16 h-16 border-4 border-resort-gold border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-resort-dark font-serif text-lg animate-pulse">Curating Luxury...</p>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <div className="pt-32 pb-12 px-6 flex-grow">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-12 text-center">
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-resort-dark mb-4">Our Accommodations</h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto font-light">
                            Choose from our collection of exquisite rooms, suites, and villas. Each designed to provide you with the utmost comfort and style.
                        </p>
                    </header>

                    {/* Filter Tabs */}
                    <div className="flex justify-center mb-12 space-x-1 md:space-x-4">
                        {['all', 'villas', 'suites', 'rooms'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${filter === tab ? 'bg-resort-dark text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {rooms.map(room => (
                                <RoomCard
                                    key={room._id}
                                    room={room}
                                    onViewDetails={setSelectedRoom}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            <Footer />

            {/* Room Detail Popup */}
            <AnimatePresence>
                {selectedRoom && (
                    <RoomDetailModal
                        room={selectedRoom}
                        onClose={() => setSelectedRoom(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
