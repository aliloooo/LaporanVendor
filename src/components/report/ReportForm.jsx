import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UploadCloud, FileType2, Loader2, CheckCircle2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

const ReportForm = ({ vendors, reportTypes, onSubmit, isSubmitting, success }) => {
    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
    const [fileError, setFileError] = useState("");
    const fileList = watch("file");

    const validateFile = (file) => {
        setFileError("");
        if (!file) {
            setFileError("File is required");
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFileError("File size exceeds 5MB limit");
            return false;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFileError("Invalid file type. Only PDF and Excel (.xlsx, .xls) are allowed");
            return false;
        }
        return true;
    };

    const handleFormSubmit = async (data) => {
        const file = data.file[0];
        if (!validateFile(file)) return;

        // Pass validated data up to parent
        await onSubmit({ ...data, file });
        if (success) reset();
    };

    if (success) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Successful</h3>
                <p className="text-slate-500 mb-6">Your report has been successfully submitted and recorded.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Upload Another Report
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="space-y-6">

                {/* Vendor Select */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Vendor</label>
                    <select
                        {...register("vendor_id", { required: "Vendor is required" })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    >
                        <option value="">-- Pilih Vendor --</option>
                        {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                    {errors.vendor_id && <p className="mt-1 text-sm text-red-600">{errors.vendor_id.message}</p>}
                </div>

                {/* Report Type Select */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Laporan</label>
                    <select
                        {...register("report_type_id", { required: "Report Type is required" })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    >
                        <option value="">-- Pilih Jenis Laporan --</option>
                        {reportTypes.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                        ))}
                    </select>
                    {errors.report_type_id && <p className="mt-1 text-sm text-red-600">{errors.report_type_id.message}</p>}
                </div>

                {/* Date Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Laporan</label>
                    <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        min={new Date().toISOString().split('T')[0]}
                        {...register("report_month", {
                            required: "Tanggal is required",
                            validate: (value) => {
                                const selectedDate = new Date(value);
                                const today = new Date();
                                // Reset time parts to strictly compare dates
                                today.setHours(0, 0, 0, 0);
                                selectedDate.setHours(0, 0, 0, 0);
                                return selectedDate >= today || "Tanggal laporan tidak boleh hari sebelumnya";
                            }
                        })}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                    {errors.report_month && <p className="mt-1 text-sm text-red-600">{errors.report_month.message}</p>}
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">File Laporan</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-blue-400 transition-colors bg-slate-50">
                        <div className="space-y-1 text-center">
                            {fileList && fileList.length > 0 ? (
                                <div className="flex flex-col items-center space-y-2">
                                    <FileType2 className="mx-auto h-12 w-12 text-blue-500" />
                                    <div className="text-sm text-slate-900 font-medium">{fileList[0].name}</div>
                                    <p className="text-xs text-slate-500">
                                        {(fileList[0].size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                    <div className="flex text-sm text-slate-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" {...register("file", { required: "File is required" })} type="file" className="sr-only" accept=".pdf, .xlsx, .xls" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500">PDF, XLSX up to 5MB</p>
                                </>
                            )}
                        </div>
                    </div>
                    {(errors.file || fileError) && (
                        <p className="mt-1 text-sm text-red-600">{fileError || errors.file?.message}</p>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Uploading Report...
                            </>
                        ) : (
                            "Submit Report"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ReportForm;
