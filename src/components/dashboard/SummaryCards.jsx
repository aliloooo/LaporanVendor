import React from 'react';
import { Users, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const SummaryCard = ({ title, count, icon: Icon, colorClass, bgColorClass, iconColorClass }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${bgColorClass}`}>
            <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${colorClass}`}>{count}</p>
        </div>
    </div>
);

const SummaryCards = ({ summary }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
                title="Total Report (Mo)"
                count={summary.totalReports}
                icon={FileText}
                colorClass="text-slate-800"
                bgColorClass="bg-indigo-50"
                iconColorClass="text-indigo-600"
            />
            <SummaryCard
                title="Sudah Upload"
                count={summary.uploaded}
                icon={CheckCircle2}
                colorClass="text-green-600"
                bgColorClass="bg-green-50"
                iconColorClass="text-green-600"
            />
            <SummaryCard
                title="Belum Upload"
                count={summary.pending}
                icon={Clock}
                colorClass="text-yellow-600"
                bgColorClass="bg-yellow-50"
                iconColorClass="text-yellow-600"
            />
            <SummaryCard
                title="Overdue"
                count={summary.overdue}
                icon={AlertCircle}
                colorClass="text-red-600"
                bgColorClass="bg-red-50"
                iconColorClass="text-red-600"
            />
        </div>
    );
};

export default SummaryCards;
