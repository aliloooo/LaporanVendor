export const getStatusColor = (status) => {
    switch (status) {
        case 'uploaded': return 'bg-green-100 text-green-700 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

export const getStatusLabel = (status) => {
    switch (status) {
        case 'uploaded': return 'Uploaded';
        case 'pending': return 'Pending';
        case 'overdue': return 'Overdue';
        default: return 'Unknown';
    }
};
