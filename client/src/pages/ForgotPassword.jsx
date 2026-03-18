import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [showUsername, setShowUsername] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await axios.post('/api/forgot-password', { email, username });
            setMessage(res.data.message);
            setShowUsername(false);
        } catch (err) {
            if (err.response?.data?.needUsername) {
                setShowUsername(true);
            }
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
            >
                <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center text-gray-500 hover:text-resort-gold transition mb-6"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Login
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-resort-dark">Forgot Password</h1>
                    <p className="text-gray-500 text-sm mt-2">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                {message && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm text-center font-medium">{message}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                placeholder="Enter your registered email"
                            />
                        </div>
                    </div>
                    
                    {showUsername && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-2 !mt-4"
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                    placeholder="Enter your unique username"
                                />
                            </div>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-resort-gold hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
