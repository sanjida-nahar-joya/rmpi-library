import { useSearchParams } from 'react-router';
import { SearchX, X } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useTitle from '../hooks/useTitle';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { BookGridSkeleton } from '../components/Loader';

const PAGE_SIZE = 12;

const availabilityOptions = [
    { value: '', label: 'All availability' },
    { value: 'available', label: 'Available' },
    { value: 'limited', label: 'Limited Copies' },
    { value: 'unavailable', label: 'Unavailable' },
];

const sortOptions = [
    { value: 'newest', label: 'Recently added' },
    { value: 'title', label: 'Title (A–Z)' },
    { value: 'title-desc', label: 'Title (Z–A)' },
    { value: 'oldest', label: 'Oldest first' },
];

const FilterSelect = ({ id, label, value, onChange, options }) => (
    <div>
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-stone-500">
            {label}
        </label>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="input py-2.5">
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

const Books = () => {
    useTitle('Book Catalog');
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const availability = searchParams.get('availability') || '';
    const author = searchParams.get('author') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = Number(searchParams.get('page')) || 1;

    const query = new URLSearchParams({ page, limit: PAGE_SIZE, sort });
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    if (availability) query.set('availability', availability);
    if (author) query.set('author', author);

    const { data, loading, error, refetch } = useFetch(`/books?${query.toString()}`);
    const { data: categories } = useFetch('/categories');
    const { data: authors } = useFetch('/books/authors');

    // Changing any filter takes the user back to page 1
    const updateParams = (changes) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, value);
            else next.delete(key);
        });
        if (!('page' in changes)) next.delete('page');
        setSearchParams(next);
    };

    const changePage = (newPage) => {
        updateParams({ page: String(newPage) });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasFilters = Boolean(search || category || availability || author || sort !== 'newest');
    const clearFilters = () => setSearchParams({});

    const start = data ? (data.page - 1) * PAGE_SIZE + 1 : 0;
    const end = data ? Math.min(data.page * PAGE_SIZE, data.total) : 0;

    return (
        <>
            <PageHeader
                eyebrow="Book catalog"
                title="Explore the Collection"
                description="Search every book in RMPI Library and check how many copies are on the shelf right now."
            >
                <div className="max-w-2xl">
                    <SearchBar key={search} defaultValue={search} onSearch={(text) => updateParams({ search: text })} />
                </div>
            </PageHeader>

            <section className="container-page py-8">
                <div className="card grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
                    <FilterSelect
                        id="category"
                        label="Category"
                        value={category}
                        onChange={(value) => updateParams({ category: value })}
                        options={[
                            { value: '', label: 'All categories' },
                            ...(categories || []).map((item) => ({ value: item.name, label: item.name })),
                        ]}
                    />
                    <FilterSelect
                        id="availability"
                        label="Availability"
                        value={availability}
                        onChange={(value) => updateParams({ availability: value })}
                        options={availabilityOptions}
                    />
                    <FilterSelect
                        id="author"
                        label="Author"
                        value={author}
                        onChange={(value) => updateParams({ author: value })}
                        options={[
                            { value: '', label: 'All authors' },
                            ...(authors || []).map((name) => ({ value: name, label: name })),
                        ]}
                    />
                    <FilterSelect
                        id="sort"
                        label="Sort by"
                        value={sort}
                        onChange={(value) => updateParams({ sort: value === 'newest' ? '' : value })}
                        options={sortOptions}
                    />
                    <button
                        type="button"
                        onClick={clearFilters}
                        disabled={!hasFilters}
                        className="btn btn-secondary sm:col-span-2 lg:col-span-1"
                    >
                        <X className="size-4" /> Clear Filters
                    </button>
                </div>

                <div className="mt-8 mb-5 flex min-h-6 flex-wrap items-center justify-between gap-2 text-sm text-stone-600">
                    {data && !loading && (
                        <p>
                            {data.total > 0 ? (
                                <>
                                    Showing <span className="font-semibold text-stone-900">{start}–{end}</span> of{' '}
                                    <span className="font-semibold text-stone-900">{data.total}</span> books
                                </>
                            ) : (
                                'No books found'
                            )}
                            {search && (
                                <>
                                    {' '}
                                    for "<span className="font-semibold text-stone-900">{search}</span>"
                                </>
                            )}
                        </p>
                    )}
                </div>

                {loading && <BookGridSkeleton count={8} />}

                {!loading && error && (
                    <div className="card">
                        <ErrorState message={error} onRetry={refetch} />
                    </div>
                )}

                {!loading && !error && data?.books.length === 0 && (
                    <div className="card">
                        <EmptyState
                            icon={SearchX}
                            title="No books match your search"
                            message="Try a different title, author or ISBN, or remove some filters to see more books."
                            action={
                                hasFilters && (
                                    <button type="button" onClick={clearFilters} className="btn btn-primary">
                                        Clear all filters
                                    </button>
                                )
                            }
                        />
                    </div>
                )}

                {!loading && !error && data?.books.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                            {data.books.map((book) => (
                                <BookCard key={book._id} book={book} />
                            ))}
                        </div>
                        <div className="mt-10">
                            <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} />
                        </div>
                    </>
                )}
            </section>
        </>
    );
};

export default Books;
