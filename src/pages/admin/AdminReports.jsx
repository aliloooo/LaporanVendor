import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import {
    Loader2, FileText, Download, Trash2, CheckCircle2,
    AlertCircle, Clock, Search, LayoutDashboard,
    UserCircle, ShieldCheck, FileX, BarChart3, PieChart as PieIcon,
    ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import { TableSkeleton } from '../../components/ui/Skeleton';

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

// Custom hook for UI performance
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const AdminReports = () => {
    const [vendorUploads, setVendorUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteFileItem, setDeleteFileItem] = useState(null);
    const [deletingFile, setDeletingFile] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [pendingDeletions, setPendingDeletions] = useState([]);

    // Advanced Interactivity States
    const debouncedSearch = useDebounce(search, 300);
    const [sortConfig, setSortConfig] = useState({ key: 'uploaded_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

        } catch (e) {
            console.error('Error loading admin reports:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleUpdateStatus = async (reportId, newStatus) => {
        setUpdatingStatusId(reportId);
        try {
            const { error: err } = await supabase
                .from('report_uploads')
                .update({ status: newStatus })
                .eq('id', reportId);

            if (err) throw err;
            toast.success('Status berhasil diperbarui!');
            await loadData();
        } catch (e) {
            setError(`Gagal memperbarui status: ${e.message}`);
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleDownloadAll = async () => {
        if (filteredVendor.length === 0) return;
        setDownloadingAll(true);
        try {
            for (const report of filteredVendor) {
                if (report.file_url) {
                    const link = document.createElement('a');
                    link.href = report.file_url;
                    link.download = `${report.vendors?.name || 'Report'}-${report.report_types?.name || 'File'}`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            toast.success('Semua laporan sedang diunduh.');
        } catch (e) {
            setError(`Gagal mengunduh: ${e.message}`);
        } finally {
            setDownloadingAll(false);
        }
    };

    const handleInitiateDelete = (item) => {
        setPendingDeletions(prev => [...prev, item.id]);
        let isUndone = false;
        
        toast('Laporan dipindah ke tempat sampah', {
            action: {
                label: 'Undo',
                onClick: () => {
                    isUndone = true;
                    setPendingDeletions(prev => prev.filter(id => id !== item.id));
                    toast.success('Laporan dikembalikan');
                }
            },
            duration: 5000,
            onDismiss: () => {
                if (!isUndone) executeActualDelete(item);
            },
            onAutoClose: () => {
                if (!isUndone) executeActualDelete(item);
            }
        });
    };

    const executeActualDelete = async (item) => {
        try {
            let filePath = null;
            if (item.file_url) {
                const marker = '/object/public/vendor-reports/';
                const idx = item.file_url.indexOf(marker);
                if (idx !== -1) {
                    filePath = item.file_url.substring(idx + marker.length).split('?')[0];
                }
            }

            if (filePath) {
                await supabase.storage.from('vendor-reports').remove([decodeURIComponent(filePath)]);
            }

            const { error: dbErr } = await supabase
                .from('report_uploads')
                .delete()
                .eq('id', item.id);
            if (dbErr) throw dbErr;

            setVendorUploads(prev => prev.filter(u => u.id !== item.id));
            setPendingDeletions(prev => prev.filter(id => id !== item.id));
        } catch (e) {
            console.error(e);
            toast.error(`Gagal menghapus permanen: ${e.message}`);
            setPendingDeletions(prev => prev.filter(id => id !== item.id));
            loadData();
        }
    };

    const handleDeleteFile = async () => {
        if (!deleteFileItem) return;
        setDeletingFile(true);
        setError('');
        try {
            // Extract file path from URL
            let filePath = null;
            if (deleteFileItem.file_url) {
                const marker = '/object/public/vendor-reports/';
                const idx = deleteFileItem.file_url.indexOf(marker);
                if (idx !== -1) {
                    filePath = deleteFileItem.file_url.substring(idx + marker.length).split('?')[0];
                }
            }

            // 1. Delete from Storage if path exists
            if (filePath) {
                const { error: storageErr } = await supabase.storage
                    .from('vendor-reports')
                    .remove([decodeURIComponent(filePath)]);
                if (storageErr) throw storageErr;
            }

            // 2. Update DB: set file_url and file_name to null (using "" for NOT NULL constraint)
            const { error: dbErr } = await supabase
                .from('report_uploads')
                .update({
                    file_url: "",
                    file_name: ""
                })
                .eq('id', deleteFileItem.id);

            if (dbErr) throw dbErr;

            toast.success('File berhasil dihapus dari storage!');
            setDeleteFileItem(null);
            await loadData();
        } catch (e) {
            console.error('Error deleting file:', e);
            setError(`Gagal menghapus file: ${e.message}`);
        } finally {
            setDeletingFile(false);
        }
    };

    // Filter Logic
    const filteredVendor = vendorUploads.filter(u => {
        if (pendingDeletions.includes(u.id)) return false;
        
        const vendorName = u.vendors?.name || '';
        const reportName = u.report_types?.name || '';
        const matchSearch =
            vendorName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            reportName.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Sorting Logic
    const sortedVendor = React.useMemo(() => {
        let sortableItems = [...filteredVendor];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested relations for sorting
                if (sortConfig.key === 'vendor_name') {
                    aValue = a.vendors?.name?.toLowerCase() || '';
                    bValue = b.vendors?.name?.toLowerCase() || '';
                } else if (sortConfig.key === 'report_name') {
                    aValue = a.report_types?.name?.toLowerCase() || '';
                    bValue = b.report_types?.name?.toLowerCase() || '';
                } else if (sortConfig.key === 'report_month' || sortConfig.key === 'uploaded_at') {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredVendor, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedVendor.length / itemsPerPage);
    const paginatedVendor = sortedVendor.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 on active filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-40 group-hover:opacity-100" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline-block ml-1" /> : <ArrowDown className="w-3 h-3 inline-block ml-1" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Vendor Reports</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Kelola hasil submit laporan dari seluruh vendor.
                    </p>
                </div>

                {filteredVendor.length > 0 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${showAnalytics
                                ? 'bg-slate-800 text-white shadow-slate-200 hover:bg-slate-900'
                                : 'bg-white text-slate-700 border border-slate-200 shadow-slate-100 hover:bg-slate-50'
                                }`}
                        >
                            {showAnalytics ? <PieIcon className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                        </button>
                        <button
                            onClick={handleDownloadAll}
                            disabled={downloadingAll}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-60 disabled:shadow-none"
                        >
                            {downloadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Download All ({filteredVendor.length})
                        </button>
                    </div>
                )}
            </div>

            {showAnalytics && <AdminAnalytics currentYear={new Date().getFullYear()} />}

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari vendor atau jenis laporan..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
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
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {loading ? (
                <div className="py-8">
                    <TableSkeleton />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSort('vendor_name')}>
                                        Vendor <SortIcon columnKey="vendor_name" />
                                    </th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSort('report_name')}>
                                        Jenis Laporan <SortIcon columnKey="report_name" />
                                    </th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSort('report_month')}>
                                        Bulan <SortIcon columnKey="report_month" />
                                    </th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSort('uploaded_at')}>
                                        Upload At <SortIcon columnKey="uploaded_at" />
                                    </th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSort('status')}>
                                        Status <SortIcon columnKey="status" />
                                    </th>
                                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedVendor.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-24 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-12 h-12 opacity-10" />
                                                <p>Belum ada laporan vendor{debouncedSearch ? ' yang sesuai pencarian.' : '.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedVendor.map(u => {
                                        const cfg = STATUS_CONFIG[u.status] || STATUS_CONFIG.pending;
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{u.vendors?.name || '—'}</td>
                                                <td className="px-6 py-4 text-slate-600 truncate max-w-[150px]">{u.report_types?.name || '—'}</td>
                                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{u.report_month ? format(new Date(u.report_month), 'MMM yyyy') : '—'}</td>
                                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{u.uploaded_at ? format(new Date(u.uploaded_at), 'dd/MM/yy HH:mm') : '—'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="relative group/status">
                                                        <select
                                                            value={u.status}
                                                            disabled={updatingStatusId === u.id}
                                                            onChange={(e) => handleUpdateStatus(u.id, e.target.value)}
                                                            className={`
                                                                appearance-none cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-0 focus:ring-2 focus:ring-blue-500 outline-none transition-all
                                                                ${cfg.bg} ${cfg.color}
                                                            `}
                                                        >
                                                            <option value="uploaded">Uploaded</option>
                                                            <option value="overdue">Overdue</option>
                                                            <option value="pending">Pending</option>
                                                        </select>
                                                        {updatingStatusId === u.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin absolute right-1 top-1/2 -translate-y-1/2 opacity-50" />
                                                        ) : (
                                                            <StatusIcon className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {u.file_url ? (
                                                            <>
                                                                <a href={u.file_url} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Download File"><Download className="w-4 h-4" /></a>
                                                                <button onClick={() => setDeleteFileItem(u)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Hapus File Saja (Keep Record)"><FileX className="w-4 h-4" /></button>
                                                            </>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-md">Empty</span>
                                                        )}
                                                        <button onClick={() => handleInitiateDelete(u)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Hapus Seluruh Data"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
                            <div className="text-sm text-slate-500">
                                Menampilkan <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, sortedVendor.length)}</span> dari <span className="font-semibold text-slate-700">{sortedVendor.length}</span> laporan
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-semibold text-slate-700 px-4">
                                    Halaman {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {deleteFileItem && (
                <ConfirmModal
                    title="Hapus File Saja"
                    message={`Apakah Anda yakin ingin menghapus file "${deleteFileItem.file_name || 'ini'}"? Record laporan akan tetap ada namun file di storage akan dihapus untuk menghemat ruang.`}
                    onConfirm={handleDeleteFile}
                    onClose={() => setDeleteFileItem(null)}
                    loading={deletingFile}
                />
            )}
        </div>
    );
};

export default AdminReports;
