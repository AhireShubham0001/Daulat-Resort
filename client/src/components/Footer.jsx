import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-resort-dark text-white pt-16 pb-8">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand */}
                <div>
                    <h2 className="text-3xl font-serif font-bold text-resort-gold mb-4">Daulat Resort</h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Experience the pinnacle of luxury and tranquility. Daulat Resort offers an unforgettable escape into nature's finest landscapes.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-resort-gold transition"><Facebook size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-resort-gold transition"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-resort-gold transition"><Twitter size={20} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2 inline-block">Quick Links</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/" className="hover:text-resort-gold transition">Home</Link></li>
                        <li><Link to="/rooms" className="hover:text-resort-gold transition">Accommodations</Link></li>
                        <li><Link to="/facilities" className="hover:text-resort-gold transition">Services & Amenities</Link></li>
                        <li><Link to="/gallery" className="hover:text-resort-gold transition">Photo Gallery</Link></li>
                        <li><Link to="/contact" className="hover:text-resort-gold transition">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2 inline-block">Contact Us</h3>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex items-start">
                            <MapPin className="text-resort-gold mr-3 mt-1 flex-shrink-0" size={18} />
                            <span>123 Resort Boulevard, Ocean View Drive, Paradise City, 90210</span>
                        </li>
                        <li className="flex items-center">
                            <Phone className="text-resort-gold mr-3 flex-shrink-0" size={18} />
                            <span>+1 (800) 123-4567</span>
                        </li>
                        <li className="flex items-center">
                            <Mail className="text-resort-gold mr-3 flex-shrink-0" size={18} />
                            <span>reservations@daulatresort.com</span>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2 inline-block">Newsletter</h3>
                    <p className="text-gray-400 text-sm mb-4">Subscribe for exclusive offers and updates.</p>
                    <form className="flex flex-col space-y-3">
                        <input
                            type="email"
                            placeholder="Your Email Address"
                            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-resort-gold focus:ring-1 focus:ring-resort-gold transition"
                        />
                        <button className="bg-resort-gold text-white font-bold py-2 rounded hover:bg-resort-gold-dark transition shadow-md hover:shadow-lg">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-xs">
                &copy; {new Date().getFullYear()} Daulat Resort. All rights reserved. | <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            </div>
        </footer>
    );
}
