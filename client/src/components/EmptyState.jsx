import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, message, action, compact = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-10' : 'px-6 py-16'}`}>
            <span className="flex size-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
                <Icon className="size-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-stone-900">{title}</h3>
            {message && <p className="mt-1.5 max-w-md text-sm text-stone-500">{message}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
};

export default EmptyState;
