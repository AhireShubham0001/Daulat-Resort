import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Users, ChevronRight, Star, Coffee, Wifi, Waves } from 'lucide-react';
import axios from 'axios';

// Beautiful placeholder images from Unsplash
const HERO_IMG = "https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";
const EXP_IMG = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const DINING_IMG = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";


const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function Home() {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // Fetch featured rooms
        axios.get('/api/rooms')
            .then(res => {
                if (res.data) setRooms(res.data.slice(0, 3)); // Just 3 rooms for home
            })
            .catch(err => console.log(err));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate('/rooms');
    };

    return (
        <div className="w-full bg-resort-cream text-resort-dark overflow-x-hidden font-sans">

            {/* 1. HERO SECTION */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    className="absolute inset-0 z-0 bg-resort-dark"
                    style={{ y: y1 }}
                >
                    <img
                        src={HERO_IMG}
                        alt="Resort View"
                        className="w-full h-full object-cover opacity-60 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-resort-cream/90" />
                </motion.div>

                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <p className="text-resort-gold uppercase tracking-[0.3em] text-sm md:text-base mb-6 font-semibold">
                            Welcome to Paradise
                        </p>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight drop-shadow-lg">
                            Experience Unrivaled <br className="hidden md:block" />
                            <span className="italic font-light">Luxury</span>
                        </h1>
                        <p className="text-white/90 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto drop-shadow">
                            Escape the ordinary and discover a haven of tranquility above the clouds.
                            Your perfect getaway awaits at Daulat Resort.
                        </p>
                    </motion.div>
                </div>

                {/* Booking Bar (Absolute at bottom of hero) */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-4"
                >
                    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-2 md:p-4 border border-resort-gold/20">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            <div className="flex-1 p-4 flex items-center space-x-4">
                                <CalendarDays className="text-resort-gold" size={24} />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Check In</span>
                                    <input type="date" className="outline-none text-gray-700 bg-transparent text-sm w-full cursor-pointer" />
                                </div>
                            </div>
                            <div className="flex-1 p-4 flex items-center space-x-4">
                                <CalendarDays className="text-resort-gold" size={24} />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Check Out</span>
                                    <input type="date" className="outline-none text-gray-700 bg-transparent text-sm w-full cursor-pointer" />
                                </div>
                            </div>
                            <div className="flex-1 p-4 flex items-center space-x-4">
                                <Users className="text-resort-gold" size={24} />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Guests</span>
                                    <select className="outline-none text-gray-700 bg-transparent text-sm cursor-pointer border-none focus:ring-0">
                                        <option>1 Adult, 0 Children</option>
                                        <option>2 Adults, 0 Children</option>
                                        <option>2 Adults, 1 Child</option>
                                        <option>2 Adults, 2 Children</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="md:w-auto w-full bg-resort-dark text-white hover:bg-resort-gold transition-colors duration-300 px-8 py-4 font-bold tracking-wider uppercase text-sm flex items-center justify-center m-2 rounded">
                                Check Availability
                            </button>
                        </form>
                    </div>
                </motion.div>
            </section>

            {/* SPACER for the floating booking bar */}
            <div className="h-32 md:h-20 bg-resort-cream"></div>

            {/* 2. THE EXPERIENCE */}
            <section className="py-24 px-4 bg-resort-cream relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        className="space-y-8 relative z-10"
                    >
                        <h4 className="text-resort-gold uppercase tracking-widest font-bold text-sm">The Experience</h4>
                        <h2 className="text-4xl md:text-5xl font-serif text-resort-dark leading-snug">
                            Refined Elegance in Nature's Lap
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed font-light">
                            At Daulat softly nestled within lush hills, every detail is engineered to leave you breathless.
                            From world-class dining to our signature infinity pools overlooking the valley, we offer a sanctuary where time stands still and luxury becomes a feeling.
                        </p>
                        <div className="pt-4">
                            <Link to="/gallery" className="inline-flex items-center space-x-2 text-resort-dark border-b-2 border-resort-gold pb-1 font-semibold hover:text-resort-gold transition-colors group">
                                <span>Explore Gallery</span>
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="relative"
                        style={{ y: y2 }}
                    >
                        <div className="aspect-[4/5] overflow-hidden rounded-t-full relative shadow-2xl">
                            <img src={EXP_IMG} alt="Resort Interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]" />
                        </div>
                        <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-full shadow-xl hidden md:block">
                            <Star className="text-resort-gold w-16 h-16" fill="#D4AF37" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. FEATURED ROOMS */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center mb-16"
                    >
                        <h4 className="text-resort-gold uppercase tracking-widest font-bold text-sm mb-4">Our Accommodation</h4>
                        <h2 className="text-4xl md:text-5xl font-serif text-resort-dark">Curated For Comfort</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.length > 0 ? rooms.map((room, idx) => (
                            <motion.div
                                key={room._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2, duration: 0.6 }}
                                className="group cursor-pointer max-w-sm mx-auto w-full"
                                onClick={() => navigate('/rooms')}
                            >
                                <div className="relative h-80 overflow-hidden rounded-xl mb-6 shadow-md">
                                    <img
                                        src={room.images?.[0] || EXP_IMG}
                                        alt={room.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                                    <div className="absolute top-4 right-4 bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-resort-dark rounded shadow-sm">
                                        ₹{room.price} / Night
                                    </div>
                                </div>
                                <h3 className="text-2xl font-serif text-resort-dark mb-2 group-hover:text-resort-gold transition-colors">{room.name}</h3>
                                <div className="flex items-center text-sm text-gray-500 space-x-3 capitalize">
                                    <span className="flex items-center"><Users size={14} className="mr-1" /> {room.capacity} Guests</span>
                                    <span>•</span>
                                    <span className="truncate">{room.amenities?.[0] || 'Luxury Amenities'}</span>
                                </div>
                            </motion.div>
                        )) : (
                            // PLACEHOLDER IF NO ROOMS
                            [1, 2, 3].map((_, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2, duration: 0.6 }}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative h-80 overflow-hidden rounded-xl mb-6 shadow-md bg-gray-200 animate-pulse"></div>
                                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="text-center mt-16">
                        <Link to="/rooms" className="inline-block px-8 py-3 bg-resort-dark text-white font-bold tracking-wider uppercase text-sm hover:bg-resort-gold transition-colors duration-300 rounded">
                            View All Suites
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. FINE DINING & AMENITIES */}
            <section className="py-24 px-4 bg-resort-dark text-white relative">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2"
                    >
                        <div className="aspect-square lg:aspect-[4/3] rounded-sm overflow-hidden border-4 border-resort-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                            <img src={DINING_IMG} alt="Fine Dining" className="w-full h-full object-cover" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2 space-y-8"
                    >
                        <h4 className="text-resort-gold uppercase tracking-widest font-bold text-sm">Finest Amenities</h4>
                        <h2 className="text-4xl md:text-5xl font-serif leading-tight">Gastronomy & Wellness</h2>
                        <p className="text-gray-300 font-light text-lg">
                            Indulge your senses with local and international delicacies crafted by our executive chefs, then unwind in our holistic spa center.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white/5 rounded-full text-resort-gold">
                                    <Coffee size={24} />
                                </div>
                                <div>
                                    <h5 className="font-bold text-lg">Fine Dining</h5>
                                    <p className="text-sm text-gray-400 mt-1">Award-winning culinary excellence.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white/5 rounded-full text-resort-gold">
                                    <Waves size={24} />
                                </div>
                                <div>
                                    <h5 className="font-bold text-lg">Infinity Pool</h5>
                                    <p className="text-sm text-gray-400 mt-1">Temperature controlled serenity.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white/5 rounded-full text-resort-gold">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h5 className="font-bold text-lg">Luxury Spa</h5>
                                    <p className="text-sm text-gray-400 mt-1">Holistic wellness treatments.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-white/5 rounded-full text-resort-gold">
                                    <Wifi size={24} />
                                </div>
                                <div>
                                    <h5 className="font-bold text-lg">High-Speed Wifi</h5>
                                    <p className="text-sm text-gray-400 mt-1">Stay connected flawlessly.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 5. FOOTER CTA */}
            <section className="py-24 px-4 bg-resort-cream text-center">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="max-w-3xl mx-auto space-y-8"
                >
                    <Star className="text-resort-gold mx-auto w-12 h-12" fill="#D4AF37" />
                    <h2 className="text-5xl font-serif text-resort-dark">Ready for the utmost relaxation?</h2>
                    <p className="text-gray-500 text-lg font-light">
                        Book your stay today directly via our website for exclusive perks, best rates, and an unforgettable experience.
                    </p>
                    <Link to="/booking" className="inline-block px-10 py-4 bg-resort-gold text-white font-bold tracking-wider uppercase hover:bg-resort-dark transition-colors duration-300 shadow-xl rounded">
                        Book Now
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="bg-resort-dark border-t border-gray-800 text-gray-400 py-8 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} DAULAT RESORT. All Rights Reserved.</p>
            </footer>

        </div>
    );
}
