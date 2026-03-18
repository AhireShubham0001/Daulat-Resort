import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match.");
        }

        setLoading(true);
        setError('');

        try {
            const res = await axios.post('/api/reset-password', { token, newPassword: password });
            setMessage(res.data.message);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired reset link.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Password Updated!</h2>
                    <p className="text-gray-500 mt-2 mb-6">Your password has been reset successfully. You can now log in with your new password.</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full bg-resort-gold hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition"
                    >
                        Go to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-resort-dark">Set New Password</h1>
                    <p className="text-gray-500 text-sm mt-2">Please enter your new password below.</p>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-resort-gold hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
