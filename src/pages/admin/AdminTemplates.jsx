import React, { useState, useEffect } from 'react';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../services/adminService';
import { Loader2, Plus, Trash2, Pencil, Download, FileSpreadsheet, FileText, File, X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const MAX_SIZE = 10 * 1024 * 1024;

const FILE_TYPE_CONFIG = {
    excel: { label: 'Excel', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50', accept: '.xlsx' },
    word: { label: 'Word', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', accept: '.docx' },
    pdf: { label: 'PDF', icon: File, color: 'text-red-600', bg: 'bg-red-50', accept: '.pdf' },
};

const CATEGORIES = ['Financial', 'Operational', 'SLA', 'Compliance', 'Maintenance', 'HSE', 'General'];

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const ConfirmModal = ({ message, onConfirm, onClose, loading }) => (
    <Modal title="Konfirmasi Hapus" onClose={onClose}>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Batal</button>
            <button onClick={onConfirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Hapus
            </button>
        </div>
    </Modal>
);

const TemplateRow = ({ t, onEdit, onDelete }) => {
    const cfg = FILE_TYPE_CONFIG[t.file_type] || FILE_TYPE_CONFIG.pdf;
    const Icon = cfg.icon;
    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 ${cfg.bg} rounded-lg`}><Icon className={`w-4 h-4 ${cfg.color}`} /></div>
                    <div>
                        <p className="font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.category}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                </span>
            </td>
            <td className="px-6 py-4 text-slate-500 text-sm">{format(new Date(t.updated_at || t.created_at), 'dd MMM yyyy')}</td>
            <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    <a href={t.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                    </a>
                    <button onClick={() => onEdit(t)} className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(t)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const AdminTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', category: CATEGORIES[0], file_type: 'excel', file: null });

    const load = async () => {
        try { setTemplates(await getTemplates()); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.file) return setError('File wajib dipilih');
        if (form.file.size > MAX_SIZE) return setError('File maks 10MB');
        const expectedExt = FILE_TYPE_CONFIG[form.file_type].accept;
        if (!form.file.name.endsWith(expectedExt)) return setError(`Tipe file harus ${expectedExt} untuk kategori ${form.file_type}`);
        setSubmitting(true);
        try {
            await createTemplate(form);
            showToast('Template berhasil diupload!');
            setShowUpload(false);
            setForm({ name: '', category: CATEGORIES[0], file_type: 'excel', file: null });
            await load();
        } catch (e) { setError(e.message); }
        finally { setSubmitting(false); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateTemplate(editItem.id, { name: editItem.name, category: editItem.category });
            showToast('Template berhasil diupdate!');
            setEditItem(null);
            await load();
        } catch (e) { setError(e.message); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await deleteTemplate(deleteItem.id, deleteItem.file_path);
            showToast('Template berhasil dihapus!');
            setDeleteItem(null);
            await load();
        } catch (e) { setError(e.message); }
        finally { setSubmitting(false); }
    };

    const grouped = {
        excel: templates.filter(t => t.file_type === 'excel'),
        word: templates.filter(t => t.file_type === 'word'),
        pdf: templates.filter(t => t.file_type === 'pdf'),
    };

    return (
        <div className="space-y-6">
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> {toast}
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Template Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Upload &amp; kelola template laporan yang bisa didownload vendor.</p>
                </div>
                <button onClick={() => { setShowUpload(true); setError(''); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                    <Plus className="w-5 h-5" /> Upload Template
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700">{error}</div>}

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Nama Template</th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Tipe</th>
                                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Terakhir Update</th>
                                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {templates.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Belum ada template. Mulai upload template pertama Anda.</td></tr>
                                ) : templates.map(t => (
                                    <TemplateRow key={t.id} t={t} onEdit={(t) => { setEditItem(t); setError(''); }} onDelete={(t) => { setDeleteItem(t); setError(''); }} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <Modal title="Upload Template Baru" onClose={() => setShowUpload(false)}>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Template * (harus unik)</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., SLA Report Template" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori *</label>
                                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe File *</label>
                                <select value={form.file_type} onChange={e => setForm(f => ({ ...f, file_type: e.target.value, file: null }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="excel">Excel (.xlsx)</option>
                                    <option value="word">Word (.docx)</option>
                                    <option value="pdf">PDF (.pdf)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">File ({FILE_TYPE_CONFIG[form.file_type].accept}, maks 10MB) *</label>
                            <input type="file" accept={FILE_TYPE_CONFIG[form.file_type].accept} onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} required className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Batal</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Upload
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Modal */}
            {editItem && (
                <Modal title="Edit Template" onClose={() => setEditItem(null)}>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Template *</label>
                            <input value={editItem.name} onChange={e => setEditItem(i => ({ ...i, name: e.target.value }))} required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori *</label>
                            <select value={editItem.category} onChange={e => setEditItem(i => ({ ...i, category: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Batal</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {deleteItem && (
                <ConfirmModal
                    message={`Hapus template "${deleteItem.name}"? File di storage juga akan dihapus.`}
                    onConfirm={handleDelete}
                    onClose={() => setDeleteItem(null)}
                    loading={submitting}
                />
            )}
        </div>
    );
};

export default AdminTemplates;
