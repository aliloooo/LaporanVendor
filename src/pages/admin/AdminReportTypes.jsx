import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { 
    Loader2, ClipboardList, Plus, Search, Edit2, Trash2, 
    AlertCircle, CheckCircle2, X, Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '../../components/ui/Skeleton';

const PERIOD_TYPES = [
    { value: 'monthly', label: 'Bulanan (Standard)' },
    { value: 'bi_monthly', label: 'Dua Bulanan' },
    { value: 'semi_annual', label: 'Enam Bulanan' },
    { value: 'specific_date', label: 'Tanggal Spesifik' },
    { value: 'end_of_month', label: 'Akhir Bulan' },
];

const AdminReportTypes = () => {
    const [reportTypes, setReportTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        period_type: 'monthly',
        due_day: 5
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchReportTypes = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('report_types')
                .select('*')
                .order('name');
            if (error) throw error;
            setReportTypes(data || []);
        } catch (error) {
            toast.error('Gagal mengambil data jenis laporan: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportTypes();
    }, []);

    const handleOpenModal = (type = null) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name,
                period_type: type.period_type,
                due_day: type.due_day || 5
            });
        } else {
            setEditingType(null);
            setFormData({
                name: '',
                period_type: 'monthly',
                due_day: 5
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingType(null);
        setFormData({ name: '', period_type: 'monthly', due_day: 5 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Validate due_day if type is date-based
            const finalDueDay = formData.period_type === 'end_of_month' ? null : parseInt(formData.due_day);
            
            const payload = {
                name: formData.name,
                period_type: formData.period_type,
                due_day: finalDueDay
            };

            if (editingType) {
                const { error } = await supabase
                    .from('report_types')
                    .update(payload)
                    .eq('id', editingType.id);
                if (error) throw error;
                toast.success('Jenis laporan berhasil diperbarui');
            } else {
                const { error } = await supabase
                    .from('report_types')
                    .insert([payload]);
                if (error) throw error;
                toast.success('Jenis laporan berhasil ditambahkan');
            }
            fetchReportTypes();
            handleCloseModal();
        } catch (error) {
            toast.error('Gagal menyimpan jenis laporan: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus jenis laporan ini? Ini mungkin akan mempengaruhi monitoring kepatuhan.')) return;
        
        try {
            const { error } = await supabase
                .from('report_types')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Jenis laporan berhasil dihapus');
            fetchReportTypes();
        } catch (error) {
            toast.error('Gagal menghapus jenis laporan: ' + error.message);
        }
    };

    const filteredTypes = reportTypes.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kelola Jenis Laporan</h1>
                    <p className="text-slate-500 text-sm mt-1">Konfigurasi kategori dan jadwal pelaporan vendor.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Jenis Laporan
                </button>
            </div>

            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Cari jenis laporan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Nama Laporan</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Periode</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Batas Hari (Due Day)</th>
                                    <th className="px-6 py-4 text-center font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                            Tidak ada data jenis laporan ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTypes.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{t.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{t.id}</div>
                                            </td>
                                            <td className="px-6 py-4 capitalize text-slate-600">
                                                <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                                    {t.period_type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {t.due_day ? `Tanggal ${t.due_day}` : 'Akhir Bulan'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(t)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Jenis Laporan"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Jenis Laporan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{editingType ? 'Edit Jenis Laporan' : 'Tambah Jenis Laporan'}</h3>
                                <p className="text-xs text-slate-500 font-medium">Konfigurasi parameter pelaporan.</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white hover:shadow-sm transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Nama Laporan</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Laporan Keuangan Bulanan"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Periode Pelaporan</label>
                                    <select
                                        value={formData.period_type}
                                        onChange={(e) => setFormData({ ...formData, period_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-800"
                                    >
                                        {PERIOD_TYPES.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Batas Hari (Max Tanggal)</label>
                                    <input
                                        required={formData.period_type !== 'end_of_month'}
                                        disabled={formData.period_type === 'end_of_month'}
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={formData.due_day}
                                        onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-800 disabled:opacity-50 disabled:bg-slate-100"
                                    />
                                    {formData.period_type === 'end_of_month' ? (
                                        <p className="text-[10px] text-slate-400 mt-1 italic">* Otomatis diatur ke hari terakhir setiap bulan.</p>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 mt-1">* Tanggal maksimal laporan harus diinput (1-31).</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all font-sans"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:shadow-none"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingType ? 'Simpan Perubahan' : 'Tambah Jenis Laporan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReportTypes;
