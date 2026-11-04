import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react';

const badges = {
    available: {
        label: 'Available',
        icon: CircleCheck,
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    },
    limited: {
        label: 'Limited Copies',
        icon: TriangleAlert,
        className: 'bg-amber-50 text-amber-800 ring-amber-600/25',
    },
    unavailable: {
        label: 'Unavailable',
        icon: CircleX,
        className: 'bg-red-50 text-red-700 ring-red-600/20',
    },
};

const AvailabilityBadge = ({ availability, large = false }) => {
    const badge = badges[availability] || badges.unavailable;
    const Icon = badge.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ring-1 ring-inset ${
                badge.className
            } ${large ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}`}
        >
            <Icon className={large ? 'size-4' : 'size-3.5'} />
            {badge.label}
        </span>
    );
};

export default AvailabilityBadge;
