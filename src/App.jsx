import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import { Loader2 } from 'lucide-react';

// Lazy-loaded Pages
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UploadReport = React.lazy(() => import('./pages/UploadReport'));
const DownloadTemplate = React.lazy(() => import('./pages/DownloadTemplate'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
const AdminTemplates = React.lazy(() => import('./pages/admin/AdminTemplates'));

// Full Page Loader
const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
);

import {
    LayoutDashboard, UploadCloud, FileDown, LogOut, LogIn,
    ShieldCheck, FileText, FileSpreadsheet, Menu, X
} from 'lucide-react';
import LogoImg from './assets/logo.png';

const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'
            }`
        }
    >
        <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110`} />
        <span className="font-semibold text-sm">{label}</span>
    </NavLink>
);

const Layout = ({ children }) => {
    const { user, role, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    const location = useLocation();
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-slate-50/50 text-slate-900 font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 bg-white border-r border-slate-200 flex flex-col shrink-0
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                <div className="p-8 flex justify-between items-center md:justify-center">
                    <div className="flex flex-col items-center">
                        <img
                            src={LogoImg}
                            alt="My CEM System"
                            fetchpriority="high"
                            loading="eager"
                            className="h-16 md:h-20 w-auto object-contain"
                        />
                        <div className="mt-2 text-center">
                            <h1 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">CEM System</h1>
                        </div>
                    </div>
                    {/* Mobile close button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>


                <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
                    {/* Vendor Menu — always visible */}
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-4">Menu Utama</p>
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/upload" icon={UploadCloud} label="Upload Report" />
                    <NavItem to="/templates" icon={FileDown} label="Download Template" />

                    {/* Admin Menu — only when logged in as admin */}
                    {user && role === 'admin' && (
                        <>
                            <div className="pt-6 pb-1">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Panel Administrator</p>
                            </div>
                            <NavItem to="/admin/reports" icon={FileText} label="Kelola Laporan" />
                            <NavItem to="/admin/templates" icon={FileSpreadsheet} label="Kelola Template" />
                        </>
                    )}
                </nav>

                {/* Footer: show user info or login button */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    {user ? (
                        <div className="flex items-center space-x-3 p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-100 shrink-0">
                                {user.email.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{user.email.split('@')[0]}</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{role || 'admin'}</p>
                            </div>
                            <button
                                onClick={signOut}
                                title="Logout"
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <NavLink
                            to="/login"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 bg-white border border-slate-100 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 shadow-sm"
                        >
                            <LogIn className="w-5 h-5" />
                            <span className="text-sm font-bold">Admin Login</span>
                        </NavLink>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-100 h-16 flex items-center justify-between px-6 shrink-0 z-30">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <img src={LogoImg} alt="Logo" fetchpriority="high" loading="eager" className="h-8 w-auto" />
                    <div className="w-10" /> {/* Spacer */}
                </header>

                {/* Desktop Header */}
                <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 items-center px-10 justify-between shrink-0 sticky top-0 z-20">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Reporting Dashboard</h2>
                        <p className="text-xs text-slate-400 font-medium">Monitoring vendor compliance and report analytics</p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-end mr-2">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status Sistem</div>
                            {user && role === 'admin' ? (
                                <span className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold ring-1 ring-blue-100">
                                    <ShieldCheck className="w-4 h-4" /> Mode Admin
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold ring-1 ring-slate-100">
                                    <FileText className="w-4 h-4" /> Penampil Publik
                                </span>
                            )}
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100" />
                        <div className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6 md:p-10 scroll-smooth">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </div>
            </main>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <React.Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public login page (admin only) */}
                        <Route path="/login" element={<Login />} />

                        {/* Main layout — ALL accessible without login */}
                        <Route path="/*" element={
                            <Layout>
                                <React.Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        {/* Public routes — no login required */}
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/upload" element={<UploadReport />} />
                                        <Route path="/templates" element={<DownloadTemplate />} />

                                        {/* Admin-only routes — login required */}
                                        <Route path="/admin/reports" element={
                                            <ProtectedRoute requiredRole="admin">
                                                <AdminReports />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/admin/templates" element={
                                            <ProtectedRoute requiredRole="admin">
                                                <AdminTemplates />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/admin" element={<Navigate to="/admin/reports" replace />} />
                                    </Routes>
                                </React.Suspense>
                            </Layout>
                        } />
                    </Routes>
                </React.Suspense>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
