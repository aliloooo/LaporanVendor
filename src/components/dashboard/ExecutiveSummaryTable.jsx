import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, AlertCircle, Clock, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportMatrixTable from './ReportMatrixTable';

const ExecutiveSummaryTable = React.memo(({ vendorStats, onSelectVendor, selectedVendorId, summaryMonth, setSummaryMonth, reportTypes, uploadLookup, year }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'compliance', direction: 'desc' });

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStats = useMemo(() => {
        let sortableItems = [...vendorStats];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                
                if (sortConfig.key === 'compliance') {
                    aValue = a.totalReports > 0 ? ((a.uploaded + a.overdue) / a.totalReports) * 100 : 0;
                    bValue = b.totalReports > 0 ? ((b.uploaded + b.overdue) / b.totalReports) * 100 : 0;
                } else if (sortConfig.key === 'name') {
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [vendorStats, sortConfig]);

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-40 group-hover:opacity-100" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline-block ml-1" /> : <ArrowDown className="w-3 h-3 inline-block ml-1" />;
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4">
                <div>
                    <h3 className="font-semibold text-slate-800 text-lg">Ringkasan Kepatuhan Vendor</h3>
                    <span className="text-sm text-slate-500">{vendorStats.length} Total Vendor</span>
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Bulan:</label>
                    <select
                        value={summaryMonth}
                        onChange={(e) => setSummaryMonth(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-colors hover:border-blue-300"
                    >
                        <option value="all">Semua Bulan</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                            const date = new Date(2000, m - 1);
                            return (
                                <option key={m} value={m}>
                                    {date.toLocaleString('id-ID', { month: 'long' })}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider select-none">
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 group transition-colors" onClick={() => handleSort('name')}>
                                Nama Vendor <SortIcon columnKey="name" />
                            </th>
                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-100 group transition-colors" onClick={() => handleSort('compliance')}>
                                Persentase <SortIcon columnKey="compliance" />
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 group transition-colors" onClick={() => handleSort('uploaded')}>
                                Uploaded <SortIcon columnKey="uploaded" />
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 group transition-colors" onClick={() => handleSort('overdue')}>
                                Overdue <SortIcon columnKey="overdue" />
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 group transition-colors" onClick={() => handleSort('pending')}>
                                Pending <SortIcon columnKey="pending" />
                            </th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedStats.map((stat) => {
                            const compliance = stat.totalReports > 0
                                ? Math.round(((stat.uploaded + stat.overdue) / stat.totalReports) * 100)
                                : 0;

                            const isSelected = stat.id === selectedVendorId;

                            return (
                                <React.Fragment key={stat.id}>
                                    <tr
                                        className={`group hover:bg-blue-50/40 transition-colors duration-200 ${isSelected ? 'bg-blue-50/60 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-900">{stat.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="flex-1 min-w-[60px] h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px] group-hover:h-2.5 transition-all">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${compliance >= 90 ? 'bg-green-500' : compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${compliance}%` }}
                                                    />
                                                </div>
                                                <span className="font-semibold text-slate-700 whitespace-nowrap">{compliance}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-green-600 font-medium">
                                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                {stat.uploaded}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-red-600 font-medium">
                                                <AlertCircle className="w-4 h-4 mr-1.5" />
                                                {stat.overdue}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-yellow-600 font-medium">
                                                <Clock className="w-4 h-4 mr-1.5" />
                                                {stat.pending}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onSelectVendor(stat.id)}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${isSelected
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {isSelected ? 'Tutup Matriks' : 'Detail'}
                                                {isSelected ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                                            </button>
                                        </td>
                                    </tr>
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="bg-slate-50 border-b-2 border-slate-200"
                                            >
                                                <td colSpan={6} className="p-0">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: "auto" }}
                                                        exit={{ height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-6 md:p-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=')]">
                                                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                                                <div className="mb-6 flex flex-col space-y-1 border-b border-slate-100 pb-4">
                                                                    <h4 className="text-lg font-bold text-slate-900 tracking-tight">Matriks Detail Laporan</h4>
                                                                    <p className="text-sm text-slate-500">Rincian bulanan untuk: <span className="font-bold text-blue-600">{stat.name}</span></p>
                                                                </div>
                                                                <ReportMatrixTable
                                                                    vendors={[{id: stat.id, name: stat.name}]}
                                                                    reportTypes={reportTypes}
                                                                    uploadLookup={uploadLookup}
                                                                    year={year}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {vendorStats.length === 0 && (
                <div className="p-10 text-center text-slate-500 italic">
                    Belum ada data statistik untuk tahun ini.
                </div>
            )}
        </div>
    );
});

export default ExecutiveSummaryTable;
