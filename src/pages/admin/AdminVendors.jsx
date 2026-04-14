import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { 
    Loader2, Building2, Plus, Search, Edit2, Trash2, 
    AlertCircle, CheckCircle2, X 
} from 'lucide-react';
import { toast } from 'sonner';
import { TableSkeleton } from '../../components/ui/Skeleton';

const AdminVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('name');
            if (error) throw error;
            setVendors(data || []);
        } catch (error) {
            toast.error('Gagal mengambil data vendor: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleOpenModal = (vendor = null) => {
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({ name: vendor.name });
        } else {
            setEditingVendor(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVendor(null);
        setFormData({ name: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingVendor) {
                const { error } = await supabase
                    .from('vendors')
                    .update({ name: formData.name })
                    .eq('id', editingVendor.id);
                if (error) throw error;
                toast.success('Vendor berhasil diperbarui');
            } else {
                const { error } = await supabase
                    .from('vendors')
                    .insert([{ name: formData.name }]);
                if (error) throw error;
                toast.success('Vendor berhasil ditambahkan');
            }
            fetchVendors();
            handleCloseModal();
        } catch (error) {
            toast.error('Gagal menyimpan vendor: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus vendor ini? Ini mungkin akan mempengaruhi data laporan yang terkait.')) return;
        
        try {
            const { error } = await supabase
                .from('vendors')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Vendor berhasil dihapus');
            fetchVendors();
        } catch (error) {
            toast.error('Gagal menghapus vendor: ' + error.message);
        }
    };

    const filteredVendors = vendors.filter(v => 
        v.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kelola Vendor</h1>
                    <p className="text-slate-500 text-sm mt-1">Daftar vendor yang aktif dalam sistem.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Vendor Baru
                </button>
            </div>

            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Cari nama vendor..."
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
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Nama Vendor</th>
                                    <th className="px-6 py-4 text-left font-semibold text-slate-700">ID</th>
                                    <th className="px-6 py-4 text-center font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredVendors.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                            Tidak ada data vendor ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVendors.map((v) => (
                                        <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{v.name}</td>
                                            <td className="px-6 py-4 text-slate-400 text-[10px] font-mono">{v.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(v)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Vendor"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(v.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Vendor"
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
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{editingVendor ? 'Edit Vendor' : 'Tambah Vendor Baru'}</h3>
                                <p className="text-xs text-slate-500 font-medium">Input informasi vendor secara detail.</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white hover:shadow-sm transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Nama Vendor</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: PT. Bringin Inti Teknologi"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-semibold text-slate-800"
                                />
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
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingVendor ? 'Simpan Perubahan' : 'Tambah Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
