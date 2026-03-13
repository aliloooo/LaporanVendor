import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-200 ${className}`}
            {...props}
        />
    );
};

export default Skeleton;

export const DashboardSkeleton = () => {
    return (
        <div className="space-y-10 pb-16">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-12 w-48 rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-3xl" />
                ))}
            </div>

            <Skeleton className="h-[400px] w-full rounded-3xl" />
            
            <div className="pt-12 border-t border-slate-200">
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-12 w-64 rounded-xl" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        </div>
    );
};

export const TableSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <th key={i} className="px-6 py-4">
                                    <Skeleton className="h-4 w-24 rounded" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[1, 2, 3, 4, 5].map((row) => (
                            <tr key={row}>
                                <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                                <td className="px-6 py-4"><Skeleton className="h-8 w-24 rounded-full" /></td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
