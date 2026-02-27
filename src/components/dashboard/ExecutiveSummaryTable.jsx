import React from 'react';
import { ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const ExecutiveSummaryTable = React.memo(({ vendorStats, onSelectVendor, selectedVendorId, summaryMonth, setSummaryMonth }) => {
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
                        <tr className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                            <th className="px-6 py-4">Nama Vendor</th>
                            <th className="px-6 py-4 text-center">Persentase</th>
                            <th className="px-6 py-4">Uploaded</th>
                            <th className="px-6 py-4">Overdue</th>
                            <th className="px-6 py-4">Pending</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vendorStats.map((stat) => {
                            const compliance = stat.totalReports > 0
                                ? Math.round((stat.uploaded / stat.totalReports) * 100)
                                : 0;

                            const isSelected = stat.id === selectedVendorId;

                            return (
                                <tr
                                    key={stat.id}
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
                                                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                                                }`}
                                        >
                                            {isSelected ? 'Melihat Matriks' : 'Detail'}
                                            {!isSelected && <ChevronRight className="w-4 h-4 ml-1" />}
                                        </button>
                                    </td>
                                </tr>
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
