import React, { useState, useEffect } from 'react';
import { getTemplates } from '../services/adminService';
import { FileSpreadsheet, FileText, File, Download, Search, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const FILE_TYPE_CONFIG = {
    excel: { label: 'Excel', icon: FileSpreadsheet, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
    word: { label: 'Word', icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
    pdf: { label: 'PDF', icon: File, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
};

const TemplateCard = ({ template }) => {
    const cfg = FILE_TYPE_CONFIG[template.file_type] || FILE_TYPE_CONFIG.pdf;
    const Icon = cfg.icon;

    const handleDownload = () => {
        // file_url is a public URL stored at upload time — no auth needed
        if (template.file_url) {
            window.open(template.file_url, '_blank');
        } else {
            alert('URL file tidak tersedia.');
        }
    };

    return (
        <div className={`bg-white rounded-xl border ${cfg.border} shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4`}>
            <div className="flex items-start gap-3">
                <div className={`p-3 ${cfg.bg} rounded-xl shrink-0`}>
                    <Icon className={`w-6 h-6 ${cfg.color}`} />
                </div>
                <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 leading-snug">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">{template.category}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400">
                    Update: {format(new Date(template.updated_at || template.created_at), 'dd MMM yyyy')}
                </p>
                <button
                    onClick={handleDownload}
                    className={`flex items-center gap-1.5 px-3 py-1.5 ${cfg.bg} ${cfg.color} border ${cfg.border} rounded-lg text-xs font-medium hover:opacity-80 transition-opacity`}
                >
                    <Download className="w-3.5 h-3.5" />
                    Download
                </button>
            </div>

        </div>
    );
};

const DownloadTemplate = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                setTemplates(await getTemplates());
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const categories = ['all', ...new Set(templates.map(t => t.category))];

    const filtered = templates.filter(t => {
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || t.file_type === filterType;
        const matchCat = filterCategory === 'all' || t.category === filterCategory;
        return matchSearch && matchType && matchCat;
    });

    const grouped = {
        excel: filtered.filter(t => t.file_type === 'excel'),
        word: filtered.filter(t => t.file_type === 'word'),
        pdf: filtered.filter(t => t.file_type === 'pdf'),
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Download Template</h1>
                <p className="text-slate-500 text-sm mt-1">Download template laporan yang tersedia untuk vendor.</p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari template..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="all">Semua Tipe</option>
                    <option value="excel">Excel</option>
                    <option value="word">Word</option>
                    <option value="pdf">PDF</option>
                </select>
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Semua Kategori' : c}</option>)}
                </select>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <File className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{search || filterType !== 'all' || filterCategory !== 'all' ? 'Tidak ada template yang sesuai filter.' : 'Belum ada template tersedia.'}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([type, items]) => {
                        if (items.length === 0) return null;
                        const cfg = FILE_TYPE_CONFIG[type];
                        const Icon = cfg.icon;
                        return (
                            <div key={type}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                                    <h2 className="text-lg font-semibold text-slate-800">{cfg.label}</h2>
                                    <span className="text-sm text-slate-400">({items.length})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {items.map(t => <TemplateCard key={t.id} template={t} />)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DownloadTemplate;
