import React, { useState, useEffect } from 'react';
import ReportForm from '../components/report/ReportForm';
import { getFormOptions, uploadReport } from '../services/uploadService';
import { Loader2, AlertCircle } from 'lucide-react';

const UploadReport = () => {
    const [vendors, setVendors] = useState([]);
    const [reportTypes, setReportTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const { vendors, reportTypes } = await getFormOptions();
                setVendors(vendors);
                setReportTypes(reportTypes);
            } catch (err) {
                setError("Gagal memuat data master. Silakan refresh halaman.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOptions();
    }, []);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await uploadReport(formData);
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Terjadi kesalahan saat mengunggah laporan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p>Memuat formulir...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Laporan Rutin</h1>
                <p className="text-slate-500">Silakan lengkapi form di bawah ini dan lampirkan dokumen laporan (PDF/Excel maks 5MB).</p>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <ReportForm
                vendors={vendors}
                reportTypes={reportTypes}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                success={success}
            />
        </div>
    );
};

export default UploadReport;
