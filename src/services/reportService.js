import { supabase } from './supabaseClient';
import { endOfMonth, isAfter, setDate, addMonths, getDate } from 'date-fns';

export const getDashboardData = async (year = new Date().getFullYear()) => {
    try {
        // Fetch vendors, report types, and uploads in parallel for better performance
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const [vendorsRes, typesRes, uploadsRes, rangeRes] = await Promise.all([
            supabase.from('vendors').select('id, name').order('name'),
            supabase.from('report_types').select('*').order('id'),
            supabase.from('report_uploads').select('*').gte('report_month', startDate).lte('report_month', endDate),
            supabase.from('report_uploads').select('report_month').order('report_month', { ascending: true })
        ]);

        if (vendorsRes.error) throw vendorsRes.error;
        if (typesRes.error) throw typesRes.error;
        if (uploadsRes.error) throw uploadsRes.error;
        if (rangeRes.error) throw rangeRes.error;

        const vendors = vendorsRes.data;
        const reportTypes = typesRes.data;
        const uploads = uploadsRes.data;
        const rangeData = rangeRes.data;

        const summary = {
            totalVendors: vendors.length,
            totalReports: reportTypes.length * vendors.length,
            uploaded: uploads.filter(d => d.status === 'uploaded').length,
            pending: uploads.filter(d => d.status === 'pending').length,
            overdue: uploads.filter(d => d.status === 'overdue').length,
        };

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
