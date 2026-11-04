import { Ban, CircleCheck, CircleX, Clock, TriangleAlert } from 'lucide-react';

const getStyle = (request) => {
    if (request.status === 'pending') {
        return { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-800 ring-amber-600/25' };
    }
    if (request.status === 'rejected') {
        return { label: 'Rejected', icon: CircleX, className: 'bg-red-50 text-red-700 ring-red-600/20' };
    }
    if (request.status === 'cancelled') {
        return { label: 'Cancelled', icon: Ban, className: 'bg-stone-100 text-stone-600 ring-stone-500/20' };
    }
    if (request.issue?.status === 'returned') {
        return { label: 'Returned', icon: CircleCheck, className: 'bg-stone-100 text-stone-700 ring-stone-500/20' };
    }
    if (request.issue?.isOverdue) {
        return { label: 'Overdue', icon: TriangleAlert, className: 'bg-red-50 text-red-700 ring-red-600/20' };
    }
    return { label: 'Approved', icon: CircleCheck, className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' };
};

const RequestStatusBadge = ({ request }) => {
    const style = getStyle(request);
    const Icon = style.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${style.className}`}
        >
            <Icon className="size-3.5" />
            {style.label}
        </span>
    );
};

export default RequestStatusBadge;
