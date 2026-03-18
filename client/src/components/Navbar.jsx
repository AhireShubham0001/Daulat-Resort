import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Brand */}
                <Link to="/" className="text-3xl font-serif font-bold text-resort-dark tracking-wide">
                    Daulat <span className="text-resort-gold">Resort</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-lg font-medium text-gray-700">
                    <Link to="/" className="hover:text-resort-gold transition-colors duration-300">Home</Link>
                    <Link to="/rooms" className="hover:text-resort-gold transition-colors duration-300">Rooms</Link>
                    <Link to="/facilities" className="hover:text-resort-gold transition-colors duration-300">Facilities</Link>
                    <Link to="/gallery" className="hover:text-resort-gold transition-colors duration-300">Gallery</Link>
                    <Link to="/contact" className="hover:text-resort-gold transition-colors duration-300">Contact</Link>
                    <Link to="/login" className="hover:text-resort-gold transition-colors duration-300 font-semibold border-b-2 border-transparent hover:border-resort-gold">Login</Link>
                    <Link to="/booking" className="px-6 py-2 bg-resort-gold text-white rounded-full hover:bg-resort-gold-dark transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        Book Now
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-resort-dark focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-20 left-4 right-4 bg-white rounded-xl shadow-2xl p-6 md:hidden z-40"
                    >
                        <div className="flex flex-col space-y-4 text-center">
                            <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 hover:text-resort-gold">Home</Link>
                            <Link to="/rooms" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 hover:text-resort-gold">Rooms</Link>
                            <Link to="/facilities" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 hover:text-resort-gold">Facilities</Link>
                            <Link to="/gallery" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 hover:text-resort-gold">Gallery</Link>
                            <Link to="/contact" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 hover:text-resort-gold">Contact</Link>
                            <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-resort-gold hover:text-resort-dark">Login</Link>
                            <Link to="/booking" onClick={() => setIsOpen(false)} className="w-full bg-resort-gold text-white py-3 rounded-lg font-bold shadow-md">Book Now</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
