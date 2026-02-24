import { supabase } from './supabaseClient';
import { endOfMonth, isAfter, setDate, addMonths, getDate } from 'date-fns';

export const getDashboardData = async (year = new Date().getFullYear()) => {
    try {
        // Fetch vendors
        const { data: vendors, error: vendorsError } = await supabase
            .from('vendors')
            .select('id, name')
            .order('name');

        if (vendorsError) throw vendorsError;

        // Fetch report types
        const { data: reportTypes, error: typesError } = await supabase
            .from('report_types')
            .select('*')
            .order('id');

        if (typesError) throw typesError;

        // Fetch uploads, filtered by year
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const { data: uploads, error: uploadsError } = await supabase
            .from('report_uploads')
            .select('*')
            .gte('report_month', startDate)
            .lte('report_month', endDate);

        if (uploadsError) throw uploadsError;

        const summary = {
            totalVendors: vendors.length,
            totalReports: reportTypes.length * vendors.length,
            uploaded: uploads.filter(d => d.status === 'uploaded').length,
            pending: uploads.filter(d => d.status === 'pending').length,
            overdue: uploads.filter(d => d.status === 'overdue').length,
        };

        // Extract available years from uploads since the beginning of time
        // Optimization: if we just need available years we could do a distinct query, 
        // but for now we fetch all uploads to find distinct years 
        // We really should just get all years that exist.
        const { data: allUploadsForYears, error: allYearsError } = await supabase
            .from('report_uploads')
            .select('report_month');

        if (allYearsError) throw allYearsError;

        const availableYearsSet = new Set(
            allUploadsForYears.map(u => parseInt(u.report_month.split('-')[0]))
        );
        availableYearsSet.add(new Date().getFullYear());
        const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);

        return { uploads, summary, vendors, reportTypes, year, availableYears };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};
