import { Link } from 'react-router';
import { ArrowRight, CircleCheck, CircleX, Clock, TriangleAlert } from 'lucide-react';

// One whole split into parts, e.g. available vs issued copies
const SegmentedBar = ({ title, parts }) => {
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    const share = (value) => (total ? Math.round((value / total) * 100) : 0);
    const description = parts.map((part) => `${part.label} ${part.value} (${share(part.value)}%)`).join(', ');

    return (
        <div>
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-stone-700">{title}</p>
                <p className="text-xs text-stone-500">{total} total</p>
            </div>

            <div className="mt-2 flex h-7 gap-[2px]" role="img" aria-label={`${title}: ${description}`}>
                {total === 0 && <div className="w-full rounded-[4px] bg-stone-100" />}
                {parts
                    .filter((part) => part.value > 0)
                    .map((part) => (
                        <div
                            key={part.label}
                            title={`${part.label}: ${part.value} (${share(part.value)}%)`}
                            className="flex min-w-0 items-center rounded-[4px] px-2 text-xs font-semibold"
                            style={{ flexGrow: part.value, flexBasis: 0, backgroundColor: part.color, color: part.textColor || '#ffffff' }}
                        >
                            {share(part.value) >= 14 && `${share(part.value)}%`}
                        </div>
                    ))}
            </div>

            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
                {parts.map((part) => (
                    <li key={part.label} className="flex items-center gap-1.5">
                        {part.icon ? (
                            <part.icon className="size-3.5" style={{ color: part.color }} />
                        ) : (
                            <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: part.color }} />
                        )}
                        {part.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const InventoryStatus = ({ stats }) => {
    const availableTitles = stats.totalTitles - stats.lowStockTitles - stats.unavailableTitles;

    return (
        <div className="card flex h-full flex-col p-5 sm:p-6">
            <h2 className="font-semibold text-stone-900">Inventory status</h2>
            <p className="mt-0.5 text-sm text-stone-500">How the collection is shared out right now</p>

            <div className="mt-6 space-y-7">
                <SegmentedBar
                    title="Copies: available vs issued"
                    parts={[
                        { label: 'Available', value: stats.availableCopies, color: '#2a78d6' },
                        { label: 'Issued', value: stats.issuedCopies, color: '#eb6834' },
                    ]}
                />
                <SegmentedBar
                    title="Titles by availability"
                    parts={[
                        { label: 'Available', value: availableTitles, color: '#0ca30c', icon: CircleCheck },
                        { label: 'Limited copies', value: stats.lowStockTitles, color: '#fab219', textColor: '#0b0b0b', icon: TriangleAlert },
                        { label: 'Unavailable', value: stats.unavailableTitles, color: '#d03b3b', icon: CircleX },
                    ]}
                />
            </div>

            <div className="mt-auto pt-6">
                <Link
                    to="/admin/transactions?status=overdue"
                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3.5 transition hover:border-stone-300 hover:bg-stone-50"
                >
                    <span className="flex items-center gap-3">
                        <span
                            className={`flex size-9 items-center justify-center rounded-lg ${
                                stats.overdueIssues > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                            }`}
                        >
                            <Clock className="size-[18px]" />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold text-stone-900">
                                {stats.overdueIssues} overdue {stats.overdueIssues === 1 ? 'return' : 'returns'}
                            </span>
                            <span className="block text-xs text-stone-500">out of {stats.activeIssues} active issues</span>
                        </span>
                    </span>
                    <ArrowRight className="size-4 text-stone-400" />
                </Link>
            </div>
        </div>
    );
};

export default InventoryStatus;
