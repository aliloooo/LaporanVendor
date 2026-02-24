import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';
import LogoImg from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, role } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
            // Auth context will update role after sign in
            // Small delay to allow role state to settle
            setTimeout(() => {
                // Role check happens in useEffect of AuthContext, navigate after
                navigate('/');
            }, 500);
        } catch (err) {
            setError(err.message || 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                        <img
                            src={LogoImg}
                            alt="My CEM System"
                            className="h-32 w-auto object-contain brightness-0 invert mx-auto"
                        />
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Masuk ke akun Anda</h2>

                    {error && (
                        <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-start">
                            <AlertCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Masuk...</>
                            ) : (
                                <><LogIn className="w-5 h-5 mr-2" /> Masuk</>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-xs mt-6">
                    © 2026 VendorPortal · All rights reserved
                </p>
            </div>
        </div>
    );
};

export default Login;
