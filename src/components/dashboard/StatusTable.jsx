import React from 'react';
import { getStatusColor, getStatusLabel } from '../../utils/statusCalculator';
import { format } from 'date-fns';

const StatusTable = ({ data }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Vendor</th>
                            <th scope="col" className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Jenis Laporan</th>
                            <th scope="col" className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Bulan Laporan</th>
                            <th scope="col" className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status Compliance</th>
                            <th scope="col" className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Batas Waktu</th>
                            <th scope="col" className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right text-nowrap">Waktu Unggah</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <p className="font-medium">Belum ada data laporan yang tersedia.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4.5 font-bold text-slate-800">
                                        {row.vendor_name}
                                    </td>
                                    <td className="px-6 py-4.5 text-slate-600 font-medium">
                                        {row.report_type_name}
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-bold ring-1 ring-slate-200">
                                            {format(new Date(row.report_month), 'MMM yyyy')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm transition-all duration-200 ring-1 ${getStatusColor(row.status)}`}>
                                            <span className="mr-2 h-2 w-2 rounded-full bg-current animate-pulse"></span>
                                            {getStatusLabel(row.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4.5 text-slate-500 font-medium">
                                        {row.due_date ? (
                                            <span className="flex items-center gap-1.5">
                                                {format(new Date(row.due_date), 'dd MMM yyyy')}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4.5 text-right">
                                        <span className="text-slate-400 text-xs font-semibold tabular-nums">
                                            {row.uploaded_at ? format(new Date(row.uploaded_at), 'dd/MM/yy HH:mm') : '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StatusTable;
