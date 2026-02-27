import React, { useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle, Minus } from 'lucide-react';
import { calculateDueDate, determineStatus } from '../../utils/dateHelper';

const MONTHS = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'May' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dec' }
];

const StatusIcon = ({ status }) => {
    switch (status) {
        case 'uploaded': return <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" title="Uploaded" />;
        case 'pending': return <Clock className="w-5 h-5 text-yellow-500 mx-auto" title="Pending" />;
        case 'overdue': return <AlertCircle className="w-5 h-5 text-red-500 mx-auto" title="Overdue" />;
        default: return <Minus className="w-4 h-4 text-slate-300 mx-auto" title="Not Uploaded" />;
    }
};

const ReportMatrixTable = React.memo(({ vendors, reportTypes, uploadLookup, year }) => {
    const today = new Date();

    // Pre-calculate month-specific data to avoid redundant work in the loop
    const monthData = useMemo(() => {
        return MONTHS.map(m => {
            const reportMonth = new Date(year, m.value - 1, 1);
            const monthPrefix = `${year}-${String(m.value).padStart(2, '0')}`;
            const isFuture = reportMonth > today;

            // Map due dates for each report type in this month
            const dueDates = new Map();
            reportTypes.forEach(rt => {
                dueDates.set(rt.id, calculateDueDate(reportMonth, rt));
            });

            return { value: m.value, reportMonth, monthPrefix, isFuture, dueDates };
        });
    }, [year, reportTypes]);

    // Helper to find upload for a specific vendor, report type and month
    const getUploadStatus = (vendorId, reportTypeId, mData) => {
        // 1. Optimized lookup: O(1)
        const lookupKey = `${vendorId}_${reportTypeId}_${mData.monthPrefix}`;
        const upload = uploadLookup?.get(lookupKey);

        if (upload) {
            const dueDate = mData.dueDates.get(reportTypeId);
            return determineStatus(true, dueDate, upload.uploaded_at);
        }

        // 2. No record found: 'pending' for past/current, null for future
        return mData.isFuture ? null : 'pending';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-4 py-3 font-semibold text-slate-700 min-w-[250px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                                Jenis Laporan
                            </th>
                            {MONTHS.map(m => (
                                <th key={m.value} scope="col" className="px-2 py-3 font-semibold text-slate-700 text-center min-w-[60px]">
                                    {m.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {vendors.length === 0 ? (
                            <tr>
                                <td colSpan="13" className="px-6 py-8 text-center text-slate-500">
                                    Tidak ada data vendor.
                                </td>
                            </tr>
                        ) : (
                            vendors.map((vendor) => (
                                <React.Fragment key={vendor.id}>
                                    {/* Vendor Header Row */}
                                    <tr className="bg-blue-50/50">
                                        <td colSpan="13" className="px-4 py-2 font-bold text-slate-900 sticky left-0 bg-blue-50/50">
                                            {vendor.name}
                                        </td>
                                    </tr>

                                    {/* Report Types Rows for this Vendor */}
                                    {reportTypes.map(rt => (
                                        <tr key={`${vendor.id}-${rt.id}`} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-2.5 text-slate-600 text-xs font-medium sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100">
                                                <div className="flex flex-col">
                                                    <span>{rt.name}</span>
                                                    <span className="text-[10px] text-slate-400 capitalize">{rt.period_type.replace('_', ' ')}</span>
                                                </div>
                                            </td>
                                            {monthData.map(mData => {
                                                const status = getUploadStatus(vendor.id, rt.id, mData);
                                                return (
                                                    <td key={`${vendor.id}-${rt.id}-${mData.value}`} className="px-2 py-2.5 text-center border-l border-slate-100">
                                                        <StatusIcon status={status} />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export default ReportMatrixTable;
