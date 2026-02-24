import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { getReports, deleteReport } from '../../services/adminService';
import {
    Loader2, FileText, Download, Trash2, CheckCircle2,
    AlertCircle, Clock, Search, Filter, LayoutDashboard,
    UserCircle, ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
    uploaded: { label: 'Uploaded', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2 },
    overdue: { label: 'Overdue', color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
    pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
};

const ConfirmModal = ({ title, message, onConfirm, onClose, loading }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Batal</button>
                <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />} Hapus
                </button>
            </div>
        </div>
    </div>
);

const AdminReports = () => {
    const [activeTab, setActiveTab] = useState('vendor'); // 'vendor' or 'admin'
    const [vendorUploads, setVendorUploads] = useState([]);
    const [adminReports, setAdminReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch Vendor Uploads
            const { data: vData, error: vError } = await supabase
                .from('report_uploads')
                .select(`
                    *,
                    vendors ( name ),
                    report_types ( name )
                `)
                .order('uploaded_at', { ascending: false });

            if (vError) throw vError;
            setVendorUploads(vData || []);

            // Fetch Admin Reports (via adminService)
            const aData = await getReports();
            setAdminReports(aData || []);

        } catch (e) {
            console.error('Error loading admin reports:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleDelete = async () => {
        if (!deleteItem) return;
        setDeleting(true);
        setError('');
        try {
            if (activeTab === 'vendor') {
                // Delete Vendor Upload
                let filePath = null;
                if (deleteItem.file_url) {
                    const marker = '/object/public/vendor-reports/';
                    const idx = deleteItem.file_url.indexOf(marker);
                    if (idx !== -1) {
                        filePath = deleteItem.file_url.substring(idx + marker.length).split('?')[0];
                    }
                }

                if (filePath) {
                    await supabase.storage.from('vendor-reports').remove([decodeURIComponent(filePath)]);
                }

                const { error: dbErr } = await supabase
                    .from('report_uploads')
                    .delete()
                    .eq('id', deleteItem.id);
                if (dbErr) throw dbErr;
            } else {
                // Delete Admin Report
                await deleteReport(deleteItem.id, deleteItem.file_path);
            }

            showToast('Laporan berhasil dihapus!');
            setDeleteItem(null);
            await loadData();
        } catch (e) {
            setError(`Gagal menghapus: ${e.message}`);
            setDeleteItem(null);
        } finally {
            setDeleting(false);
        }
    };

    // Filter Logic
    const filteredVendor = vendorUploads.filter(u => {
        const vendorName = u.vendors?.name || '';
        const reportName = u.report_types?.name || '';
        const matchSearch =
            vendorName.toLowerCase().includes(search.toLowerCase()) ||
            reportName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const filteredAdmin = adminReports.filter(r => {
        return r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="space-y-6">
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> {toast}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Report Management</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Kelola hasil submit vendor dan laporan internal admin.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => { setActiveTab('vendor'); setSearch(''); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'vendor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <UserCircle className="w-4 h-4" /> Laporan Vendor
                    </button>
                    <button
                        onClick={() => { setActiveTab('admin'); setSearch(''); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <ShieldCheck className="w-4 h-4" /> Laporan Admin
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder={activeTab === 'vendor' ? "Cari vendor atau jenis laporan..." : "Cari judul atau deskripsi..."}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                {activeTab === 'vendor' && (
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="all">Semua Status</option>
                        <option value="uploaded">Uploaded</option>
                        <option value="overdue">Overdue</option>
                        <option value="pending">Pending</option>
                    </select>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                {activeTab === 'vendor' ? (
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Vendor</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Jenis Laporan</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Bulan</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Upload At</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-3 text-center font-semibold text-slate-700">Aksi</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Judul Laporan</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Deskripsi</th>
                                        <th className="px-6 py-3 text-left font-semibold text-slate-700">Tanggal Upload</th>
                                        <th className="px-6 py-3 text-center font-semibold text-slate-700">Aksi</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* VENDOR TABLE */}
                                {activeTab === 'vendor' && (
                                    filteredVendor.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-24 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="w-12 h-12 opacity-10" />
                                                    <p>Belum ada laporan vendor{search ? ' yang sesuai pencarian.' : '.'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredVendor.map(u => {
                                            const cfg = STATUS_CONFIG[u.status] || STATUS_CONFIG.pending;
                                            const StatusIcon = cfg.icon;
                                            return (
                                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{u.vendors?.name || '—'}</td>
                                                    <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{u.report_types?.name || '—'}</td>
                                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{u.report_month ? format(new Date(u.report_month), 'MMM yyyy') : '—'}</td>
                                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{u.uploaded_at ? format(new Date(u.uploaded_at), 'dd/MM/yy HH:mm') : '—'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                                                            <StatusIcon className="w-3 h-3" /> {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {u.file_url && <a href={u.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Download className="w-4 h-4" /></a>}
                                                            <button onClick={() => setDeleteItem(u)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )
                                )}

                                {/* ADMIN TABLE */}
                                {activeTab === 'admin' && (
                                    filteredAdmin.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-24 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ShieldCheck className="w-12 h-12 opacity-10" />
                                                    <p>Belum ada laporan admin{search ? ' yang sesuai pencarian.' : '.'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdmin.map(r => (
                                            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{r.title}</td>
                                                <td className="px-6 py-4 text-slate-600 max-w-[300px] truncate">{r.description || '—'}</td>
                                                <td className="px-6 py-4 text-slate-500">{format(new Date(r.created_at), 'dd MMM yyyy')}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <a href={r.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Download className="w-4 h-4" /></a>
                                                        <button onClick={() => setDeleteItem(r)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {deleteItem && (
                <ConfirmModal
                    title="Hapus Laporan"
                    message={`Apakah Anda yakin ingin menghapus "${activeTab === 'vendor' ? (deleteItem.report_types?.name || 'laporan ini') : deleteItem.title}"?`}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteItem(null)}
                    loading={deleting}
                />
            )}
        </div>
    );
};

export default AdminReports;
