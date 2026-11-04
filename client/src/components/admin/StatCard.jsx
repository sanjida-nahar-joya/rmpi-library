import { formatNumber } from '../../utils/helpers';

const tones = {
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-orange-50 text-orange-700',
    violet: 'bg-violet-50 text-violet-700',
};

const StatCard = ({ label, value, caption, icon: Icon, tone = 'brand' }) => {
    return (
        <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-stone-600">{label}</p>
                <span className={`flex size-9 items-center justify-center rounded-lg ${tones[tone]}`}>
                    <Icon className="size-[18px]" />
                </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-stone-900">{formatNumber(value)}</p>
            {caption && <p className="mt-1 text-sm text-stone-500">{caption}</p>}
        </div>
    );
};

export default StatCard;
