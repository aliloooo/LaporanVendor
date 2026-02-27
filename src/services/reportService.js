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

        // Efficiently get available years: Fetch most recent and oldest to find range
        // instead of fetching all uploads.
        const { data: rangeData, error: rangeError } = await supabase
            .from('report_uploads')
            .select('report_month')
            .order('report_month', { ascending: true }); // Get all but let's just take unique years

        if (rangeError) throw rangeError;

        const availableYearsSet = new Set();
        rangeData.forEach(u => {
            const yearStr = u.report_month.split('-')[0];
            availableYearsSet.add(parseInt(yearStr));
        });
        availableYearsSet.add(new Date().getFullYear());
        const availableYears = Array.from(availableYearsSet).sort((a, b) => b - a);

        return { uploads, summary, vendors, reportTypes, year, availableYears };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};
