import { Loader2 } from 'lucide-react';

export const Spinner = ({ className = 'size-5' }) => <Loader2 className={`animate-spin ${className}`} />;

export const PageLoader = ({ text = 'Loading...' }) => (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-stone-500" role="status">
        <Spinner className="size-8 text-brand-600" />
        <p className="text-sm">{text}</p>
    </div>
);

export const BookGridSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <div className="bg-stone-100 px-6 pt-6 pb-5">
                    <div className="mx-auto aspect-[2/3] w-full max-w-[170px] rounded-md bg-stone-200" />
                </div>
                <div className="space-y-2.5 p-5">
                    <div className="h-3 w-1/3 rounded bg-stone-200" />
                    <div className="h-4 w-4/5 rounded bg-stone-200" />
                    <div className="h-3 w-1/2 rounded bg-stone-200" />
                    <div className="h-9 w-full rounded-lg bg-stone-100" />
                </div>
            </div>
        ))}
    </div>
);

export const RowsSkeleton = ({ rows = 5 }) => (
    <div className="space-y-3 p-5" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg bg-stone-100" />
        ))}
    </div>
);
