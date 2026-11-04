import { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ defaultValue = '', onSearch, placeholder = 'Search by book title, author, or ISBN...', large = false }) => {
    const [value, setValue] = useState(defaultValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(value.trim());
    };

    const handleClear = () => {
        setValue('');
        onSearch('');
    };

    return (
        <form onSubmit={handleSubmit} role="search" className="relative flex w-full items-center">
            <Search
                className={`pointer-events-none absolute text-stone-400 ${large ? 'left-4 size-5' : 'left-3.5 size-4'}`}
            />
            <input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                aria-label="Search books"
                className={`w-full rounded-xl border border-stone-300 bg-white text-stone-900 shadow-sm transition placeholder:text-stone-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none [&::-webkit-search-cancel-button]:hidden ${
                    large ? 'py-4 pr-36 pl-12 text-base' : 'py-3 pr-28 pl-10 text-sm'
                }`}
            />
            <div className="absolute right-2 flex items-center gap-1">
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                        aria-label="Clear search"
                    >
                        <X className="size-4" />
                    </button>
                )}
                <button type="submit" className={`btn btn-primary ${large ? 'px-5 py-2.5' : 'px-4 py-2'}`}>
                    Search
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
