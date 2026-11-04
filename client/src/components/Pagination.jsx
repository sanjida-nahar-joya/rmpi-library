import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onChange }) => {
    if (!totalPages || totalPages <= 1) return null;

    // Show first, last and the pages around the current one
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
        else if (pages[pages.length - 1] !== '...') pages.push('...');
    }

    const pageButton = 'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition';

    return (
        <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
            <button
                type="button"
                className="btn btn-ghost px-2.5 py-2"
                onClick={() => onChange(page - 1)}
                disabled={page <= 1}
            >
                <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Previous</span>
            </button>

            {pages.map((p, index) =>
                p === '...' ? (
                    <span key={`dots-${index}`} className="px-1 text-stone-400">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={`${pageButton} ${
                            p === page ? 'bg-brand-800 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                type="button"
                className="btn btn-ghost px-2.5 py-2"
                onClick={() => onChange(page + 1)}
                disabled={page >= totalPages}
            >
                <span className="hidden sm:inline">Next</span> <ChevronRight className="size-4" />
            </button>
        </nav>
    );
};

export default Pagination;
