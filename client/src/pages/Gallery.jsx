import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Images } from 'lucide-react';
import Footer from '../components/Footer';

// ── Category tabs derived from data ──
const ALL = 'All';

// ── Lightbox (full-screen preview) ──
const Lightbox = ({ image, onClose, onPrev, onNext }) => {
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose, onNext, onPrev]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition backdrop-blur-sm"
                >
                    <X size={22} />
                </button>

                {/* Prev arrow */}
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 md:left-8 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition backdrop-blur-sm text-2xl font-light"
                >
                    ‹
                </button>

                {/* Image */}
                <motion.div
                    className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                    onClick={e => e.stopPropagation()}
                >
                    <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                    />
                    {/* Caption */}
                    <div className="mt-4 text-center">
                        <p className="text-white font-serif text-xl font-semibold">{image.title}</p>
                        <span className="inline-block mt-1.5 text-xs text-white/50 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                            {image.category}
                        </span>
                    </div>
                </motion.div>

                {/* Next arrow */}
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 md:right-8 z-50 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition backdrop-blur-sm text-2xl font-light"
                >
                    ›
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

// ── Masonry-style grid item ──
const GalleryItem = ({ image, index, onClick }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.35, delay: index * 0.04 }}
        onClick={onClick}
        className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300"
        style={{
            // Vary heights to create a natural masonry feel
            gridRowEnd: `span ${index % 5 === 0 ? 2 : 1}`
        }}
    >
        <img
            src={image.imageUrl}
            alt={image.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ minHeight: index % 5 === 0 ? '360px' : '220px' }}
            loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-serif font-semibold text-lg leading-tight">{image.title}</p>
                <span className="text-white/60 text-xs uppercase tracking-widest">{image.category}</span>
            </div>
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                <ZoomIn size={18} className="text-white" />
            </div>
        </div>
    </motion.div>
);

// ── Skeleton loader card ──
const SkeletonCard = ({ tall }) => (
    <div
        className={`rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse`}
        style={{ minHeight: tall ? '360px' : '220px' }}
    />
);

// ── Main Gallery Page ──
export default function Gallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(ALL);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        axios.get('https://daulat-resort.onrender.com/gallery')
            .then(res => {
                setImages(res.data);
            })
            .catch(() => {
                // Fallback demo data so page looks great even without a server
                setImages([
                    { _id: '1', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', title: 'Mountain Sunrise', category: 'Nature' },
                    { _id: '2', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', title: 'Luxury Pool Villa', category: 'Rooms' },
                    { _id: '3', imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800', title: 'Infinity Pool', category: 'Pool' },
                    { _id: '4', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', title: 'Fine Dining', category: 'Dining' },
                    { _id: '5', imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', title: 'Presidential Suite', category: 'Rooms' },
                    { _id: '6', imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', title: 'Garden Terrace', category: 'Nature' },
                    { _id: '7', imageUrl: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800', title: 'Spa & Wellness', category: 'Spa' },
                    { _id: '8', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', title: 'Family Bungalow', category: 'Rooms' },
                    { _id: '9', imageUrl: 'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800', title: 'Sunset View Lounge', category: 'Dining' },
                    { _id: '10', imageUrl: 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=800', title: 'Resort Exterior', category: 'General' },
                    { _id: '11', imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', title: 'Reception Lobby', category: 'General' },
                    { _id: '12', imageUrl: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=800', title: 'Morning Spa', category: 'Spa' },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Unique categories from data
    const categories = [ALL, ...Array.from(new Set(images.map(img => img.category).filter(Boolean)))];

    // Filtered list
    const filtered = filter === ALL ? images : images.filter(img => img.category === filter);

    // Lightbox navigation
    const openLightbox = (idx) => setLightboxIndex(idx);
    const closeLightbox = () => setLightboxIndex(null);
    const prevImage = () => setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length);
    const nextImage = () => setLightboxIndex(i => (i + 1) % filtered.length);

    return (
        <div className="bg-resort-cream min-h-screen flex flex-col">

            {/* ── Hero Banner ── */}
            <div className="relative h-72 md:h-96 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600"
                    alt="Gallery Hero"
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-resort-cream" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-resort-gold text-sm uppercase tracking-[0.3em] font-semibold mb-3"
                    >
                        Visual Journey
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 drop-shadow-lg"
                    >
                        Our Gallery
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-lg max-w-xl font-light"
                    >
                        Moments crafted in luxury — explore the beauty of Daulat Resort.
                    </motion.p>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-grow px-4 md:px-8 pb-16 max-w-7xl mx-auto w-full">

                {/* ── Category Filter ── */}
                <div className="flex justify-center gap-2 flex-wrap py-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider transition-all duration-300 border ${filter === cat
                                ? 'bg-resort-dark text-white border-resort-dark shadow-lg scale-105'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-resort-gold hover:text-resort-gold'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ── Image Count ── */}
                {!loading && (
                    <p className="text-center text-gray-400 text-sm mb-8 flex items-center justify-center gap-2">
                        <Images size={15} />
                        {filtered.length} {filtered.length === 1 ? 'photo' : 'photos'}
                        {filter !== ALL && ` in ${filter}`}
                    </p>
                )}

                {/* ── Skeleton Loader ── */}
                {loading && (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="break-inside-avoid mb-4">
                                <SkeletonCard tall={i % 5 === 0} />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Masonry Gallery Grid ── */}
                {!loading && filtered.length > 0 && (
                    <motion.div
                        layout
                        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
                    >
                        <AnimatePresence>
                            {filtered.map((image, index) => (
                                <motion.div
                                    key={image._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    transition={{ duration: 0.35, delay: index * 0.03 }}
                                    className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-2xl transition-shadow duration-300"
                                    onClick={() => openLightbox(index)}
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt={image.title}
                                        className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                                        <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="text-white font-serif font-semibold text-base leading-tight">{image.title}</p>
                                            <span className="text-white/60 text-xs uppercase tracking-widest">{image.category}</span>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-1.5 scale-75 group-hover:scale-100 transition-transform duration-300">
                                            <ZoomIn size={16} className="text-white" />
                                        </div>
                                    </div>

                                    {/* Gold accent border on hover */}
                                    <div className="absolute inset-0 rounded-2xl border-2 border-resort-gold/0 group-hover:border-resort-gold/40 transition-all duration-300 pointer-events-none" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ── Empty State ── */}
                {!loading && filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                            <Images size={36} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-gray-500 mb-2">No photos yet</h3>
                        <p className="text-gray-400 text-sm">Photos in the <span className="font-semibold">{filter}</span> category will appear here.</p>
                    </motion.div>
                )}
            </div>

            <Footer />

            {/* ── Lightbox ── */}
            {lightboxIndex !== null && (
                <Lightbox
                    image={filtered[lightboxIndex]}
                    onClose={closeLightbox}
                    onPrev={prevImage}
                    onNext={nextImage}
                />
            )}
        </div>
    );
}
