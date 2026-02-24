import { endOfMonth, isAfter, setDate, addMonths, getDate } from 'date-fns';

/**
 * Calculates the correct due date based on the report configuration and the report month.
 * 
 * @param {Date|string} reportMonth The month the report is intended for
 * @param {object} reportType The report type object from database
 * @returns {Date} The calculated due date
 */
export const calculateDueDate = (reportMonth, reportType) => {
    const baseDate = new Date(reportMonth);
    let dueDate = new Date(baseDate);

    switch (reportType.period_type) {
        case 'specific_date':
            // Cap the due_day to the maximum days in that month (e.g. 30 in Feb -> 28/29)
            const lastDayOfMonth = getDate(endOfMonth(dueDate));
            const targetDay = Math.min(reportType.due_day, lastDayOfMonth);
            dueDate = setDate(dueDate, targetDay);
            break;
        case 'end_of_month':
        case 'monthly':
            // End of the current month
            dueDate = endOfMonth(baseDate);
            break;
        case 'bi_monthly':
            // Assuming end of the next month
            dueDate = endOfMonth(addMonths(baseDate, 1));
            break;
        case 'semi_annual':
            // Assuming 6 months from the report month
            dueDate = endOfMonth(addMonths(baseDate, 5));
            break;
        default:
            dueDate = endOfMonth(baseDate);
    }

    return dueDate;
};

/**
 * Determines the status of a report.
 * 
 * @param {boolean} isUploaded Has the report been uploaded?
 * @param {Date|string} dueDate The calculated due date
 * @returns {string} "uploaded", "pending", or "overdue"
 */
/**
 * Determines the status of a report.
 * 
 * Business Rules:
 * 1. Not uploaded → always 'pending' (regardless of due date)
 * 2. Uploaded before or on due date → 'uploaded'
 * 3. Uploaded after due date → 'overdue'
 *
 * @param {boolean} isUploaded  Has the report been uploaded?
 * @param {Date|string} dueDate The calculated due date
 * @param {Date|string} [uploadedAt] When the report was uploaded (defaults to now if not provided)
 * @returns {string} "uploaded", "pending", or "overdue"
 */
export const determineStatus = (isUploaded, dueDate, uploadedAt = null) => {
    // Rule 1: if not uploaded, always pending
    if (!isUploaded) return "pending";

    // Rule 2 & 3: compare the UPLOAD timestamp to dueDate
    const uploadTime = uploadedAt ? new Date(uploadedAt) : new Date();
    if (isAfter(uploadTime, new Date(dueDate))) {
        return "overdue";
    }

    return "uploaded";
};

