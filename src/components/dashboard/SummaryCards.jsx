import React from 'react';
import { Users, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const SummaryCard = ({ title, count, icon: Icon, colorClass, bgColorClass, iconColorClass }) => (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center space-x-5 transition-all duration-300 hover:shadow-md hover:border-blue-100">
        <div className={`p-4 rounded-xl ${bgColorClass} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className={`w-7 h-7 ${iconColorClass}`} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className={`text-3xl font-bold tracking-tight ${colorClass}`}>{count}</p>
        </div>
    </div>
);

const SummaryCards = ({ summary }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
                title="Total Laporan"
                count={summary.totalReports}
                icon={FileText}
                colorClass="text-slate-900"
                bgColorClass="bg-blue-50"
                iconColorClass="text-blue-600"
            />
            <SummaryCard
                title="Terkirim"
                count={summary.uploaded}
                icon={CheckCircle2}
                colorClass="text-green-600"
                bgColorClass="bg-green-50"
                iconColorClass="text-green-600"
            />
            <SummaryCard
                title="Tertunda"
                count={summary.pending}
                icon={Clock}
                colorClass="text-yellow-600"
                bgColorClass="bg-yellow-50"
                iconColorClass="text-yellow-600"
            />
            <SummaryCard
                title="Terlambat"
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
