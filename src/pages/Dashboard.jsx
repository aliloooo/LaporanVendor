import React, { useEffect, useState, useMemo } from 'react';
import { getDashboardData } from '../services/reportService';
import SummaryCards from '../components/dashboard/SummaryCards';
import ReportMatrixTable from '../components/dashboard/ReportMatrixTable';
import ExecutiveSummaryTable from '../components/dashboard/ExecutiveSummaryTable';
import { calculateDueDate, determineStatus } from '../utils/dateHelper';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
    const [uploads, setUploads] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [reportTypes, setReportTypes] = useState([]);
    const [summary, setSummary] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [summaryMonth, setSummaryMonth] = useState('all');
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const result = await getDashboardData(year);
                setUploads(result.uploads);
                setVendors(result.vendors);
                setReportTypes(result.reportTypes);

                if (result.vendors.length > 0 && !selectedVendorId) {
                    setSelectedVendorId(result.vendors[0].id);
                }

                setAvailableYears(result.availableYears || [year]);
                setSummary(result.summary);
                setYear(result.year);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [year]);

    // Aggregate statistics for all vendors concurrently
    const stats = useMemo(() => {
        if (loading || vendors.length === 0 || reportTypes.length === 0) return { global: null, perVendor: [] };

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;

        // Optimization: Pre-index uploads by vendor and report type for O(1) lookup
        // Map key format: "vendorId_reportTypeId_monthPrefix"
        const uploadLookup = new Map();
        uploads.forEach(u => {
            if (u.report_month) {
                const monthPrefix = u.report_month.substring(0, 7); // "YYYY-MM"
                const key = `${u.vendor_id}_${u.report_type_id}_${monthPrefix}`;
                uploadLookup.set(key, u);
            }
        });

        const perVendor = vendors.map(vendor => {
            let uploaded = 0;
            let pending = 0;
            let overdue = 0;

            reportTypes.forEach(rt => {
                for (let m = 1; m <= 12; m++) {
                    const monthPrefix = `${year}-${String(m).padStart(2, '0')}`;
                    const reportMonth = new Date(year, m - 1, 1);

                    // Skip if a specific summary month is targeted
                    if (summaryMonth !== 'all' && m !== parseInt(summaryMonth, 10)) {
                        continue;
                    }

                    // Skip future months
                    if (year > currentYear || (year === currentYear && m > currentMonth)) {
                        continue;
                    }

                    // Optimized lookup: O(1) instead of O(U)
                    const lookupKey = `${vendor.id}_${rt.id}_${monthPrefix}`;
                    const upload = uploadLookup.get(lookupKey);

                    if (upload) {
                        const dueDate = calculateDueDate(reportMonth, rt);
                        const liveStatus = determineStatus(true, dueDate, upload.uploaded_at);
                        if (liveStatus === 'uploaded') uploaded++;
                        else if (liveStatus === 'overdue') overdue++;
                    } else {
                        pending++;
                    }
                }
            });

            return {
                id: vendor.id,
                name: vendor.name,
                uploaded,
                overdue,
                pending,
                totalReports: uploaded + overdue + pending
            };
        });

        const global = {
            totalReports: perVendor.reduce((acc, v) => acc + (v.uploaded + v.overdue), 0),
            uploaded: perVendor.reduce((acc, v) => acc + v.uploaded, 0),
            pending: perVendor.reduce((acc, v) => acc + v.pending, 0),
            overdue: perVendor.reduce((acc, v) => acc + v.overdue, 0),
        };

        return { global, perVendor };
    }, [uploads, vendors, reportTypes, year, loading, summaryMonth]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    // Filter logic for selected vendor matrix
    const filteredVendors = vendors.filter(v => v.id === selectedVendorId);

    return (
        <div className="space-y-10 pb-16">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col space-y-2 border-l-4 border-blue-600 pl-6 py-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Monitoring</h1>
                    <p className="text-slate-500 font-medium">Ringkasan eksekutif dan matriks kepatuhan laporan vendor.</p>
                </div>

                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3">Periode</label>
                    <select
                        value={year}
                        onChange={(e) => {
                            setLoading(true);
                            setYear(Number(e.target.value));
                        }}
                        className="rounded-xl border-none px-4 py-2 bg-slate-50 text-slate-800 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-slate-100"
                    >
                        {availableYears.map(y => (
                            <option key={y} value={y}>Tahun {y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Global Summary Cards */}
            {stats.global && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <SummaryCards summary={stats.global} />
                </div>
            )}

            {/* Executive Summary Table - All Vendors */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <ExecutiveSummaryTable
                        vendorStats={stats.perVendor}
                        onSelectVendor={setSelectedVendorId}
                        selectedVendorId={selectedVendorId}
                        summaryMonth={summaryMonth}
                        setSummaryMonth={setSummaryMonth}
                    />
                </div>
            </div>

            {/* Detailed Matrix - Selected Vendor */}
            <div className="pt-12 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex flex-col space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Matriks Detail Laporan</h2>
                        <p className="text-sm text-slate-500 font-medium">
                            Menampilkan rincian bulanan untuk: <span className="font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-md">{filteredVendors[0]?.name}</span>
                        </p>
                    </div>

                    <div className="flex flex-col space-y-2 min-w-[280px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Filter Berdasarkan Vendor</label>
                        <select
                            value={selectedVendorId}
                            onChange={(e) => setSelectedVendorId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm cursor-pointer hover:border-blue-300"
                        >
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <ReportMatrixTable
                    vendors={filteredVendors}
                    reportTypes={reportTypes}
                    uploads={uploads}
                    year={year}
                />
            </div>
        </div>
    );
};

export default Dashboard;
