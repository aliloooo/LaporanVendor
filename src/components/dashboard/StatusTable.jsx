import React from 'react';
import { getStatusColor, getStatusLabel } from '../../utils/statusCalculator';
import { format } from 'date-fns';

const StatusTable = ({ data }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Vendor</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Jenis Laporan</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Bulan</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Due Date</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Upload Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                    No reports found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {row.vendor_name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {row.report_type_name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {format(new Date(row.report_month), 'MMM yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(row.status)}`}>
                                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
                                            {getStatusLabel(row.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {row.due_date ? format(new Date(row.due_date), 'dd MMM yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-600">
                                        {row.uploaded_at ? format(new Date(row.uploaded_at), 'dd MMM yyyy HH:mm') : '-'}
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
