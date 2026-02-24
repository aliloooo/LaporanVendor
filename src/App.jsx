import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import DownloadTemplate from './pages/DownloadTemplate';
import AdminReports from './pages/admin/AdminReports';
import AdminTemplates from './pages/admin/AdminTemplates';

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
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
        }
    >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="font-medium text-sm">{label}</span>
    </NavLink>
);

const Layout = ({ children }) => {
    const { user, role, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    const location = useLocation();
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-slate-900 text-white flex flex-col shrink-0
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center md:justify-center">
                    <img
                        src={LogoImg}
                        alt="My CEM System"
                        className="h-20 md:h-24 w-auto object-contain brightness-0 invert"
                    />
                    {/* Mobile close button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>


                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
                    {/* Vendor Menu — always visible */}
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Menu</p>
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/upload" icon={UploadCloud} label="Upload Report" />
                    <NavItem to="/templates" icon={FileDown} label="Download Template" />

                    {/* Admin Menu — only when logged in as admin */}
                    {user && role === 'admin' && (
                        <>
                            <div className="pt-4 pb-1">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Admin Panel</p>
                            </div>
                            <NavItem to="/admin/reports" icon={FileText} label="Report Management" />
                            <NavItem to="/admin/templates" icon={FileSpreadsheet} label="Template Management" />
                        </>
                    )}
                </nav>

                {/* Footer: show user info or login button */}
                <div className="p-4 border-t border-slate-800">
                    {user ? (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                {user.email.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.email}</p>
                                <p className="text-xs text-slate-400 capitalize">{role || 'admin'}</p>
                            </div>
                            <button
                                onClick={signOut}
                                title="Logout"
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <NavLink
                            to="/login"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <LogIn className="w-5 h-5" />
                            <span className="text-sm font-medium">Admin Login</span>
                        </NavLink>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 shrink-0 shadow-sm z-30">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-1.5 -ml-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden md:flex bg-white border-b border-slate-200 h-16 items-center px-8 justify-between shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800">Reporting System</h2>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                        {user && role === 'admin' && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" /> Admin
                            </span>
                        )}
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4 md:p-8">
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
                <Routes>
                    {/* Public login page (admin only) */}
                    <Route path="/login" element={<Login />} />

                    {/* Main layout — ALL accessible without login */}
                    <Route path="/*" element={
                        <Layout>
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
                        </Layout>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
