import { supabase } from './supabaseClient';
import { determineStatus, calculateDueDate } from '../utils/dateHelper';

export const uploadReport = async (data) => {
    try {
        const { vendor_id, report_type_id, report_month, file } = data;

        // Fetch report_type to calculate due date
        const { data: reportTypeData, error: rtError } = await supabase
            .from('report_types')
            .select('*')
            .eq('id', report_type_id)
            .single();

        if (rtError) throw rtError;

        // Fetch vendor name for folder structure
        const { data: vendorData, error: vendorError } = await supabase
            .from('vendors')
            .select('name')
            .eq('id', vendor_id)
            .single();

        if (vendorError) throw vendorError;

        // 1. Upload to Storage
        const fileExt = file.name.split('.').pop();
        const safeVendorName = vendorData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const [year, month] = report_month.split('-');

        // e.g: vendor-reports/pt_foo/2024/02/timestamp-filename.pdf
        const filePath = `${safeVendorName}/${year}/${month}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;

        const { data: storageData, error: storageError } = await supabase.storage
            .from('vendor-reports')
            .upload(filePath, file);

        if (storageError) throw storageError;

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from('vendor-reports')
            .getPublicUrl(filePath);

        const fileUrl = publicUrlData.publicUrl;

        // 3. Calculate status and insert to DB
        // We know it's uploaded now, so isUploaded is true. 
        // We calculate due date using our util
        const dueDate = calculateDueDate(report_month, reportTypeData);
        const status = determineStatus(true, dueDate);

        const { error: insertError } = await supabase
            .from('report_uploads')
            .insert([{
                vendor_id,
                report_type_id,
                report_month: report_month,
                file_url: fileUrl,
                file_name: file.name,
                status: status
            }]);

        if (insertError) throw insertError;

        return { success: true };
    } catch (error) {
        console.error("Error during upload:", error);
        throw error;
    }
};

export const getFormOptions = async () => {
    try {
        const { data: vendors, error: vendorsError } = await supabase
            .from('vendors')
            .select('id, name')
            .order('name');

        if (vendorsError) throw vendorsError;

        const { data: reportTypes, error: typesError } = await supabase
            .from('report_types')
            .select('id, name')
            .order('id');

        if (typesError) throw typesError;

        return { vendors, reportTypes };
    } catch (error) {
        console.error("Error fetching form options:", error);
        throw error;
    }
};
