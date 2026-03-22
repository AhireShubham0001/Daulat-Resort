import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { X, Calendar as CalendarIcon, Mail, User, Phone, CheckCircle, BedDouble } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AdminCalendarView({ bookings }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    // Map bookings to React Big Calendar event format
    const events = bookings.map(b => {
        return {
            id: b._id,
            title: `${b.guestName} - ${b.roomId?.name || 'Room'}`,
            start: new Date(b.startDate),
            end: new Date(b.endDate),
            status: b.status,
            allDay: true,
            resource: b
        };
    });

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3b82f6'; // blue default
        if (event.status === 'Confirmed') {
            backgroundColor = '#22c55e'; // green-500
        } else if (event.status === 'Pending') {
            backgroundColor = '#eab308'; // yellow-500
        } else if (event.status === 'Cancelled') {
            backgroundColor = '#ef4444'; // red-500
        }
        
        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                fontWeight: 'bold',
                padding: '2px 6px',
                cursor: 'pointer'
            }
        };
    };

    // When clicking a specific event
    const handleSelectEvent = (event) => {
        setSelectedDate(event.start);
        setSelectedBookings([event.resource]);
        setModalOpen(true);
    };

    // When clicking a date cell (an empty slot on the month view)
    const handleSelectSlot = ({ start }) => {
        const clickedDate = new Date(start);
        clickedDate.setHours(0, 0, 0, 0);

        // Find all bookings spanning across this selected date
        const dayBookings = bookings.filter(b => {
             const sDate = new Date(b.startDate);
             const eDate = new Date(b.endDate);
             sDate.setHours(0, 0, 0, 0);
             eDate.setHours(23, 59, 59, 999);
             return clickedDate >= sDate && clickedDate <= eDate;
        });

        if (dayBookings.length > 0) {
            setSelectedDate(clickedDate);
            setSelectedBookings(dayBookings);
            setModalOpen(true);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[700px] relative">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'agenda']}
                defaultView="month"
                selectable={true}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                tooltipAccessor={(event) => `${event.title}\nStatus: ${event.status}\nFrom: ${event.start.toLocaleDateString()}\nTo: ${event.end.toLocaleDateString()}`}
            />

            {/* Daily Bookings Details Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <CalendarIcon className="text-resort-gold" size={24} /> 
                                        Bookings Overview
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Viewing details for {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Selected Date'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto p-6 bg-gray-50/30 flex-1">
                                {selectedBookings.length === 0 ? (
                                    <p className="text-center text-gray-500 py-10">No bookings found for this selection.</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {selectedBookings.map(b => (
                                            <div key={b._id} className="bg-white border text-left border-gray-100 shadow-sm rounded-xl p-5 hover:shadow-md transition relative">
                                                
                                                {/* Meta bar */}
                                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(b.status)}`}>
                                                        {b.status}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                                                        ₹{b.totalPrice} Total
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Left Column */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                                                <User size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Guest Name</p>
                                                                <p className="font-semibold text-gray-800">{b.guestName}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                                                <Mail size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Contact Details</p>
                                                                <p className="font-medium text-gray-700 text-sm">{b.email || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0">
                                                                <BedDouble size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Accommodation</p>
                                                                <p className="font-semibold text-gray-800">{b.roomId?.name || 'Unknown Room'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                                                                <CalendarIcon size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Duration</p>
                                                                <p className="font-medium text-gray-700 text-sm">
                                                                    {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Verification Status */}
                                                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={16} className={b.verificationStatus === 'Completed' || b.verificationStatus === 'Verified' ? 'text-green-500' : 'text-gray-300'} />
                                                        <p className="text-sm font-medium text-gray-600">Verification: <strong className="text-gray-800 uppercase text-xs tracking-wider">{b.verificationStatus}</strong></p>
                                                    </div>
                                                    
                                                    {b.lastModifiedBy && (
                                                        <p className="text-[10px] text-gray-400 truncate max-w-[150px]" title={`Modified by ${b.lastModifiedBy.username || 'Admin'} on ${new Date(b.updatedAt).toLocaleDateString()}`}>
                                                            Updated by {b.lastModifiedBy.username || 'Admin'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
