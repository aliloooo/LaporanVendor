import React, { useEffect, useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, PieChart, Pie
} from 'recharts';
import { getDashboardData } from '../../services/reportService';
import { Loader2, TrendingUp, Award, AlertTriangle, BarChart3, PieChart as PieIcon, X } from 'lucide-react';

const AdminAnalytics = ({ currentYear = new Date().getFullYear() }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(currentYear);
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await getDashboardData(year);
                setData(result);
            } catch (error) {
                console.error("Error fetching analytics data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year]);

    const chartData = useMemo(() => {
        if (!data) return [];

        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];

        return months.map((month, index) => {
            const monthStr = `${year}-${String(index + 1).padStart(2, '0')}`;
            const monthlyUploads = data.uploads.filter(u => u.report_month && u.report_month.startsWith(monthStr));

            return {
                name: month,
                index,
                uploaded: monthlyUploads.filter(u => u.status === 'uploaded').length,
                overdue: monthlyUploads.filter(u => u.status === 'overdue').length,
                pending: monthlyUploads.filter(u => u.status === 'pending').length,
            };
        });
    }, [data, year]);

    const handleBarClick = (data, index) => {
        if (data && typeof data.index === 'number') {
            setSelectedMonthIndex(data.index === selectedMonthIndex ? null : data.index);
        }
    };

    const vendorPerformance = useMemo(() => {
        if (!data) return [];

        return data.vendors.map(vendor => {
            let vendorUploads = data.uploads.filter(u => u.vendor_id === vendor.id);

            // Filter contextually by month if selected
            if (selectedMonthIndex !== null) {
                const monthStr = `${year}-${String(selectedMonthIndex + 1).padStart(2, '0')}`;
                vendorUploads = vendorUploads.filter(u => u.report_month && u.report_month.startsWith(monthStr));
            }

            const uploadedCount = vendorUploads.filter(u => u.status === 'uploaded').length;
            
            // Adjust expected total based on drill-down state
            const expectedMonths = selectedMonthIndex !== null ? 1 : 12;
            const totalExpected = data.reportTypes.length * expectedMonths;
            const score = totalExpected > 0 ? (uploadedCount / totalExpected) * 100 : 0;

            return {
                name: vendor.name,
                uploaded: uploadedCount,
                overdue: vendorUploads.filter(u => u.status === 'overdue').length,
                pending: vendorUploads.filter(u => u.status === 'pending').length,
                score: Math.round(score)
            };
        }).sort((a, b) => b.score - a.score);
    }, [data, year, selectedMonthIndex]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const topVendors = vendorPerformance.slice(0, 5);
    const bottomVendors = [...vendorPerformance].reverse().slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Monthly Trend Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Tren Kepatuhan Bulanan</h3>
                            <p className="text-xs text-slate-500 font-medium">Data pengunggahan laporan tahun {year}</p>
                        </div>
                    </div>
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="text-xs font-bold text-slate-600 bg-slate-50 border-none rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {data?.availableYears?.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                            <Bar 
                                dataKey="uploaded" 
                                name="Uploaded" 
                                stackId="a" 
                                fill="#22c55e" 
                                radius={[0, 0, 0, 0]} 
                                barSize={32} 
                                onClick={handleBarClick}
                                cursor="pointer"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-uploaded-${index}`} 
                                        fill={selectedMonthIndex === null || selectedMonthIndex === index ? '#22c55e' : '#86efac'} 
                                    />
                                ))}
                            </Bar>
                            <Bar 
                                dataKey="overdue" 
                                name="Overdue" 
                                stackId="a" 
                                fill="#ef4444" 
                                radius={[0, 0, 0, 0]} 
                                barSize={32} 
                                onClick={handleBarClick}
                                cursor="pointer"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-overdue-${index}`} 
                                        fill={selectedMonthIndex === null || selectedMonthIndex === index ? '#ef4444' : '#fca5a5'} 
                                    />
                                ))}
                            </Bar>
                            <Bar 
                                dataKey="pending" 
                                name="Pending" 
                                stackId="a" 
                                fill="#eab308" 
                                radius={[4, 4, 0, 0]} 
                                barSize={32} 
                                onClick={handleBarClick}
                                cursor="pointer"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-pending-${index}`} 
                                        fill={selectedMonthIndex === null || selectedMonthIndex === index ? '#eab308' : '#fde047'} 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {selectedMonthIndex !== null && (
                    <div className="mt-4 flex items-center justify-between bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-in fade-in">
                        <p className="text-sm font-bold text-blue-700">
                            Menampilkan data vendor untuk bulan: {chartData[selectedMonthIndex]?.name} {year}
                        </p>
                        <button 
                            onClick={() => setSelectedMonthIndex(null)}
                            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Vendor Ranking Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Performers */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Award className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Top 5 Vendor Terpatuh</h3>
                    </div>
                    <div className="space-y-4 flex-1">
                        {topVendors.map((v, i) => (
                            <div key={v.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 transition-transform hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        i === 1 ? 'bg-slate-200 text-slate-700' :
                                            i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-slate-400'
                                        }`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{v.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${v.score}%` }} />
                                    </div>
                                    <span className="text-xs font-black text-green-600 whitespace-nowrap">{v.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Needs Improvement */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Vendor Perlu Perhatian</h3>
                    </div>
                    <div className="space-y-4 flex-1">
                        {bottomVendors.map((v, i) => (
                            <div key={v.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 transition-transform hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white font-bold text-sm text-slate-400">
                                        #{vendorPerformance.length - i}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{v.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `${v.score}%` }} />
                                    </div>
                                    <span className="text-xs font-black text-red-600 whitespace-nowrap">{v.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
