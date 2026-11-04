import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { BookPlus, Eye, Library, Pencil, Search, Trash2, X } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BookCover from '../../components/BookCover';
import AvailabilityBadge from '../../components/AvailabilityBadge';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Loader';

const ManageBooks = () => {
    useTitle('Manage Books');
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const availability = searchParams.get('availability') || '';
    const page = Number(searchParams.get('page')) || 1;

    const [searchInput, setSearchInput] = useState(search);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const query = new URLSearchParams({ page, limit: 10, sort: 'newest' });
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    if (availability) query.set('availability', availability);

    const { data, loading, error, refetch } = useFetch(`/books?${query.toString()}`);
    const { data: categories } = useFetch('/categories');

    const updateParams = (changes) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, value);
            else next.delete(key);
        });
        if (!('page' in changes)) next.delete('page');
        setSearchParams(next);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateParams({ search: searchInput.trim() });
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearchParams({});
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await api.delete(`/books/${bookToDelete._id}`);
            toast.success(res.data.message);
            if (data.books.length === 1 && page > 1) updateParams({ page: String(page - 1) });
            else refetch();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setDeleting(false);
            setBookToDelete(null);
        }
    };

    const hasFilters = Boolean(search || category || availability);

    return (
        <>
            <AdminPageHeader
                title="Manage Books"
                description={data ? `${data.total} ${data.total === 1 ? 'book' : 'books'} in the catalog${hasFilters ? ' (filtered)' : ''}` : 'Search, edit and remove books'}
                action={
                    <Link to="/admin/books/new" className="btn btn-primary">
                        <BookPlus className="size-4" /> Add New Book
                    </Link>
                }
            />

            <div className="card">
                <div className="grid gap-3 border-b border-stone-100 p-4 md:grid-cols-[1fr_200px_180px_auto]">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search title, author, ISBN... (press Enter)"
                            className="input pl-10"
                            aria-label="Search books"
                        />
                    </form>
                    <select value={category} onChange={(e) => updateParams({ category: e.target.value })} className="input" aria-label="Filter by category">
                        <option value="">All categories</option>
                        {categories?.map((item) => (
                            <option key={item._id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <select value={availability} onChange={(e) => updateParams({ availability: e.target.value })} className="input" aria-label="Filter by availability">
                        <option value="">All availability</option>
                        <option value="available">Available</option>
                        <option value="limited">Limited Copies</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                    <button type="button" className="btn btn-secondary" onClick={clearFilters} disabled={!hasFilters && !searchInput}>
                        <X className="size-4" /> Clear
                    </button>
                </div>

                {loading && <RowsSkeleton rows={6} />}
                {!loading && error && <ErrorState message={error} onRetry={refetch} />}
                {!loading && !error && data?.books.length === 0 && (
                    <EmptyState
                        icon={Library}
                        title={hasFilters ? 'No books match these filters' : 'No books yet'}
                        message={hasFilters ? 'Try another search or clear the filters.' : 'Add your first book to start building the catalog.'}
                        action={
                            hasFilters ? (
                                <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                                    Clear filters
                                </button>
                            ) : (
                                <Link to="/admin/books/new" className="btn btn-primary">
                                    Add New Book
                                </Link>
                            )
                        }
                    />
                )}

                {!loading && !error && data?.books.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-sm">
                            <thead className="bg-stone-50 text-left text-xs text-stone-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Book</th>
                                    <th className="px-4 py-3 font-medium">Category</th>
                                    <th className="px-4 py-3 font-medium">ISBN</th>
                                    <th className="px-4 py-3 text-center font-medium">Available / Total</th>
                                    <th className="px-4 py-3 text-center font-medium">Issued</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {data.books.map((book) => (
                                    <tr key={book._id} className="transition hover:bg-stone-50/70">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <BookCover book={book} className="w-10 shrink-0 rounded-sm" />
                                                <div className="min-w-0">
                                                    <p className="max-w-[260px] truncate font-medium text-stone-900">{book.title}</p>
                                                    <p className="max-w-[260px] truncate text-xs text-stone-500">{book.author}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-stone-600">{book.category}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-stone-600">{book.isbn || '—'}</td>
                                        <td className="px-4 py-3 text-center text-stone-800 tabular-nums">
                                            {book.availableCopies} / {book.totalCopies}
                                        </td>
                                        <td className="px-4 py-3 text-center text-stone-800 tabular-nums">{book.issuedCopies}</td>
                                        <td className="px-4 py-3">
                                            <AvailabilityBadge availability={book.availability} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Link to={`/books/${book._id}`} target="_blank" className="rounded-md p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900" aria-label={`View ${book.title} on the website`} title="View on website">
                                                    <Eye className="size-4" />
                                                </Link>
                                                <Link to={`/admin/books/${book._id}/edit`} className="rounded-md p-2 text-stone-500 transition hover:bg-brand-50 hover:text-brand-700" aria-label={`Edit ${book.title}`} title="Edit">
                                                    <Pencil className="size-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setBookToDelete(book)}
                                                    disabled={book.issuedCopies > 0}
                                                    className="rounded-md p-2 text-stone-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-stone-500"
                                                    aria-label={`Delete ${book.title}`}
                                                    title={book.issuedCopies > 0 ? 'Return all issued copies before deleting' : 'Delete'}
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data && data.totalPages > 1 && !loading && (
                    <div className="border-t border-stone-100 p-4">
                        <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => updateParams({ page: String(p) })} />
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={Boolean(bookToDelete)}
                title="Delete this book?"
                message={
                    <>
                        <span className="font-semibold text-stone-900">{bookToDelete?.title}</span> will be permanently removed from
                        the catalog. Past issue records are kept. This cannot be undone.
                    </>
                }
                confirmLabel="Delete Book"
                danger
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setBookToDelete(null)}
            />
        </>
    );
};

export default ManageBooks;
