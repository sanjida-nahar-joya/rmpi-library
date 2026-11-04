import { RefreshCw, ServerCrash } from 'lucide-react';

const ErrorState = ({ message, onRetry, compact = false }) => {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-10' : 'px-6 py-16'}`}
            role="alert"
        >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <ServerCrash className="size-7" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-stone-900">We couldn't load this</h3>
            <p className="mt-1.5 max-w-md text-sm text-stone-500">{message}</p>
            {onRetry && (
                <button type="button" onClick={onRetry} className="btn btn-secondary mt-5">
                    <RefreshCw className="size-4" /> Try again
                </button>
            )}
        </div>
    );
};

export default ErrorState;
