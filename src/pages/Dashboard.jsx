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

        const perVendor = vendors.map(vendor => {
            let uploaded = 0;
            let pending = 0;
            let overdue = 0;

            reportTypes.forEach(rt => {
                for (let m = 1; m <= 12; m++) {
                    const reportMonthStr = `${year}-${String(m).padStart(2, '0')}-01`;
                    const reportMonth = new Date(year, m - 1, 1);

                    // Skip if a specific summary month is targeted
                    if (summaryMonth !== 'all' && m !== parseInt(summaryMonth, 10)) {
                        continue;
                    }

                    // Skip future months
                    if (year > currentYear || (year === currentYear && m > currentMonth)) {
                        continue;
                    }

                    const upload = uploads.find(u =>
                        u.vendor_id === vendor.id &&
                        u.report_type_id === rt.id &&
                        u.report_month.startsWith(`${year}-${String(m).padStart(2, '0')}`)
                    );

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
                totalReports: uploaded + overdue + pending // Total expected reports so far
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
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-l-4 border-blue-600 pl-4">Dashboard Monitoring</h1>
                    <p className="text-slate-500 pl-4">Executive summary and detailed compliance matrix for all vendors.</p>
                </div>

                <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Periode Monitoring</label>
                    <select
                        value={year}
                        onChange={(e) => {
                            setLoading(true);
                            setYear(Number(e.target.value));
                        }}
                        className="rounded-xl border border-slate-200 px-4 py-2 bg-white text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold transition-all hover:border-blue-300"
                    >
                        {availableYears.map(y => (
                            <option key={y} value={y}>Tahun {y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Global Summary Cards */}
            {stats.global && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <SummaryCards summary={stats.global} />
                </div>
            )}

            {/* Executive Summary Table - All Vendors */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <ExecutiveSummaryTable
                    vendorStats={stats.perVendor}
                    onSelectVendor={setSelectedVendorId}
                    selectedVendorId={selectedVendorId}
                    summaryMonth={summaryMonth}
                    setSummaryMonth={setSummaryMonth}
                />
            </div>

            {/* Detailed Matrix - Selected Vendor */}
            <div className="pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Matriks Detail Laporan</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Melihat rincian bulanan untuk: <span className="font-semibold text-blue-600">{filteredVendors[0]?.name}</span>
                        </p>
                    </div>

                    <div className="flex flex-col space-y-1 min-w-[200px]">
                        <label className="text-xs font-semibold text-slate-500 uppercase px-1">Ganti Vendor Matriks</label>
                        <select
                            value={selectedVendorId}
                            onChange={(e) => setSelectedVendorId(e.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
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
