import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [otp, setOtp] = useState('');
    const [trustDevice, setTrustDevice] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Get or Create device ID for "Remember This Device"
    const getDeviceId = () => {
        let id = localStorage.getItem('resort_device_id');
        if (!id) {
            id = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now();
            localStorage.setItem('resort_device_id', id);
        }
        return id;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Make API call
        try {
            const deviceId = getDeviceId();
            const endpoint = showOtp ? '/api/verify-otp' : '/api/login';
            const payload = showOtp 
                ? { username: formData.username, otp, deviceId, trustDevice } 
                : { username: formData.username, password: formData.password, deviceId };

            const res = await axios.post(endpoint, payload);

            if (res.data.twoFactor) {
                setShowOtp(true);
                return; // Wait for OTP
            }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/admin');

        } catch (err) {
            console.error("Login Failed:", err);
            // More detailed error message
            if (err.response) {
                setError(`Error: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`);
            } else if (err.request) {
                setError("No response from server. Is the backend running?");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-resort-dark">Admin Login</h1>
                    <p className="text-gray-500 text-sm mt-2">Daulat Resort Management Panel</p>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!showOtp ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                    placeholder="Enter admin username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resort-gold focus:border-transparent outline-none transition"
                                    placeholder="Enter password"
                                    required
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-sm text-resort-gold hover:text-yellow-600 font-medium transition"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 text-center font-bold">Verification Code</label>
                            <p className="text-xs text-center text-gray-500 mb-4">A 6-digit code has been sent to your email.</p>
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resort-gold text-center text-2xl tracking-[10px] outline-none transition font-bold"
                                placeholder="000000"
                                required
                            />
                            
                            <div className="mt-4 flex items-center justify-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="trustDevice" 
                                    checked={trustDevice}
                                    onChange={(e) => setTrustDevice(e.target.checked)}
                                    className="w-4 h-4 text-resort-gold focus:ring-resort-gold border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="trustDevice" className="text-sm text-gray-600 cursor-pointer hover:text-resort-dark transition">
                                    Trust this device for 30 days
                                </label>
                            </div>

                            <div className="text-center mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowOtp(false)}
                                    className="text-xs text-gray-400 hover:text-resort-dark transition"
                                >
                                    ← Back to login
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-resort-gold hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
                    >
                        {loading ? (showOtp ? 'Verifying...' : 'Signing In...') : (showOtp ? 'Complete Login' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    For access issues, contact system administrator.
                </div>
            </motion.div>
        </div>
    );
}
