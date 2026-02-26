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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-900 z-0" />
            <div className="absolute top-1/2 left-0 w-full h-1/2 bg-slate-50 z-0" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] z-0 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] z-0" />

            <div className="w-full max-w-lg z-10">
                {/* Card */}
                <div className="bg-white rounded-[32px] border border-slate-100 p-10 md:p-14 shadow-2xl">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                            <img
                                src={LogoImg}
                                alt="My CEM System"
                                className="h-24 w-auto object-contain mx-auto mb-4"
                            />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h1>
                        <p className="text-slate-400 font-medium mt-1">Silakan masuk ke akun administrator Anda</p>
                    </div>

                    {error && (
                        <div className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Alamat Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="nama@perusahaan.com"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Kata Sandi</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin mr-3" /> Memproses...</>
                            ) : (
                                <><LogIn className="w-5 h-5 mr-3" /> Masuk Sekarang</>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
                            © 2026 reporting system
                        </p>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <Link to="/" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
                        Kembali ke Dashboard Publik
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
