import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BookCopy, Inbox, RotateCcw, Search, SearchX } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import IssueStatusBadge from '../../components/admin/IssueStatusBadge';
import BookCover from '../../components/BookCover';
import AvailabilityBadge from '../../components/AvailabilityBadge';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import StudentFields from '../../components/StudentFields';
import { RowsSkeleton, Spinner } from '../../components/Loader';
import { addDays, formatDate, formatStudentClass, toInputDate, validateStudentForm } from '../../utils/helpers';

const emptyStudent = { name: '', roll: '', phone: '', department: '', semester: '', shift: '' };

const IssueReturn = () => {
    useTitle('Issue & Return');

    const [bookQuery, setBookQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [form, setForm] = useState({ ...emptyStudent, issueDate: toInputDate(), dueDate: toInputDate(addDays(14)) });
    const [errors, setErrors] = useState({});
    const [issuing, setIssuing] = useState(false);

    const [issueSearchInput, setIssueSearchInput] = useState('');
    const [issueSearch, setIssueSearch] = useState('');
    const [page, setPage] = useState(1);
    const [issueToReturn, setIssueToReturn] = useState(null);
    const [returning, setReturning] = useState(false);

    // Wait until the librarian stops typing before searching books
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(bookQuery.trim()), 300);
        return () => clearTimeout(timer);
    }, [bookQuery]);

    const booksUrl = `/books?sort=title&limit=50${debouncedQuery ? `&search=${encodeURIComponent(debouncedQuery)}` : ''}`;
    const books = useFetch(booksUrl);
    const { data: studentOptions } = useFetch('/students/options');

    const issuesQuery = new URLSearchParams({ status: 'issued', page, limit: 8 });
    if (issueSearch) issuesQuery.set('search', issueSearch);
    const issues = useFetch(`/issues?${issuesQuery.toString()}`);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = validateStudentForm(form);
        if (!selectedBook) newErrors.book = 'Please select a book to issue.';
        else if (selectedBook.availableCopies < 1) newErrors.book = 'This book has no available copies.';
        if (!form.issueDate) newErrors.issueDate = 'Issue date is required.';
        if (!form.dueDate) newErrors.dueDate = 'Due date is required.';
        else if (form.issueDate && form.dueDate < form.issueDate) newErrors.dueDate = 'Due date cannot be before the issue date.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleIssue = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIssuing(true);
        try {
            const { name, ...rest } = form;
            const res = await api.post('/issues', { bookId: selectedBook._id, studentName: name, ...rest });
            toast.success(res.data.message);
            setSelectedBook(null);
            setForm({ ...form, ...emptyStudent });
            books.refetch();
            issues.refetch();
        } catch (err) {
            toast.error(getErrorMessage(err));
            books.refetch();
        } finally {
            setIssuing(false);
        }
    };

    const handleReturn = async () => {
        setReturning(true);
        try {
            const res = await api.put(`/issues/${issueToReturn._id}/return`);
            toast.success(res.data.message);
            if (issues.data.issues.length === 1 && page > 1) setPage(page - 1);
            else issues.refetch();
            books.refetch();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setReturning(false);
            setIssueToReturn(null);
        }
    };

    const handleIssueSearch = (e) => {
        e.preventDefault();
        setIssueSearch(issueSearchInput.trim());
        setPage(1);
    };

    const inputClass = (name) => `input ${errors[name] ? 'input-error' : ''}`;

    return (
        <>
            <AdminPageHeader
                title="Issue & Return"
                description="Issue books to students and record returns. Inventory updates automatically."
            />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
                <form onSubmit={handleIssue} noValidate className="card self-start p-5 sm:p-6">
                    <h2 className="flex items-center gap-2 font-semibold text-stone-900">
                        <BookCopy className="size-5 text-brand-700" /> Issue a book
                    </h2>

                    <div className="mt-5">
                        <label htmlFor="book-search" className="label">
                            Select book *
                        </label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone-400" />
                            <input
                                id="book-search"
                                type="search"
                                value={bookQuery}
                                onChange={(e) => setBookQuery(e.target.value)}
                                placeholder="Search by title, author or ISBN"
                                className="input pl-10"
                            />
                        </div>

                        <div className={`mt-2 max-h-72 overflow-y-auto rounded-lg border ${errors.book ? 'border-red-400' : 'border-stone-200'}`}>
                            {books.loading && <RowsSkeleton rows={4} />}
                            {!books.loading && books.error && <ErrorState message={books.error} onRetry={books.refetch} compact />}
                            {!books.loading && !books.error && books.data?.books.length === 0 && (
                                <EmptyState icon={SearchX} title="No books found" message="Try a different search." compact />
                            )}
                            {!books.loading && !books.error && books.data?.books.length > 0 && (
                                <ul className="divide-y divide-stone-100">
                                    {books.data.books.map((book) => {
                                        const isSelected = selectedBook?._id === book._id;
                                        const isUnavailable = book.availableCopies < 1;
                                        return (
                                            <li key={book._id}>
                                                <button
                                                    type="button"
                                                    disabled={isUnavailable}
                                                    onClick={() => {
                                                        setSelectedBook(book);
                                                        setErrors({ ...errors, book: '' });
                                                    }}
                                                    aria-pressed={isSelected}
                                                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        isSelected ? 'bg-brand-50 ring-1 ring-brand-300 ring-inset' : 'hover:bg-stone-50'
                                                    }`}
                                                >
                                                    <BookCover book={book} className="w-8 shrink-0 rounded-sm" />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-medium text-stone-900">{book.title}</span>
                                                        <span className="block truncate text-xs text-stone-500">{book.author}</span>
                                                    </span>
                                                    <span
                                                        className={`shrink-0 text-xs font-semibold ${
                                                            isUnavailable
                                                                ? 'text-red-600'
                                                                : book.availability === 'limited'
                                                                  ? 'text-amber-700'
                                                                  : 'text-emerald-700'
                                                        }`}
                                                    >
                                                        {isUnavailable ? 'Unavailable' : `${book.availableCopies} available`}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                        {errors.book && <p className="field-error">{errors.book}</p>}
                        {books.data?.total > books.data?.books.length && (
                            <p className="mt-1.5 text-xs text-stone-500">
                                Showing {books.data.books.length} of {books.data.total} books. Search to find others.
                            </p>
                        )}
                    </div>

                    {selectedBook && (
                        <div className="mt-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50/60 p-3">
                            <BookCover book={selectedBook} className="w-10 shrink-0 rounded-sm" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-stone-900">{selectedBook.title}</p>
                                <p className="text-xs text-stone-600">
                                    {selectedBook.availableCopies} of {selectedBook.totalCopies} copies available
                                </p>
                            </div>
                            <AvailabilityBadge availability={selectedBook.availability} />
                        </div>
                    )}

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <StudentFields values={form} errors={errors} onChange={handleChange} options={studentOptions} />
                        <div>
                            <label htmlFor="issueDate" className="label">
                                Issue date *
                            </label>
                            <input id="issueDate" name="issueDate" type="date" value={form.issueDate} onChange={handleChange} className={inputClass('issueDate')} />
                            {errors.issueDate && <p className="field-error">{errors.issueDate}</p>}
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="label">
                                Due date *
                            </label>
                            <input id="dueDate" name="dueDate" type="date" min={form.issueDate} value={form.dueDate} onChange={handleChange} className={inputClass('dueDate')} />
                            {errors.dueDate && <p className="field-error">{errors.dueDate}</p>}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-6 w-full py-3" disabled={issuing}>
                        {issuing ? <Spinner className="size-4" /> : <BookCopy className="size-4" />}
                        {issuing ? 'Issuing...' : 'Issue Book'}
                    </button>
                </form>

                <div className="card self-start">
                    <div className="border-b border-stone-100 p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="flex items-center gap-2 font-semibold text-stone-900">
                                <RotateCcw className="size-5 text-brand-700" /> Currently issued books
                            </h2>
                            {issues.data && <p className="text-sm text-stone-500">{issues.data.total} active</p>}
                        </div>
                        <form onSubmit={handleIssueSearch} className="relative mt-4">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone-400" />
                            <input
                                type="search"
                                value={issueSearchInput}
                                onChange={(e) => setIssueSearchInput(e.target.value)}
                                placeholder="Search name, roll, phone or book (press Enter)"
                                className="input pl-10"
                                aria-label="Search issued books"
                            />
                        </form>
                    </div>

                    {issues.loading && <RowsSkeleton rows={5} />}
                    {!issues.loading && issues.error && <ErrorState message={issues.error} onRetry={issues.refetch} compact />}
                    {!issues.loading && !issues.error && issues.data?.issues.length === 0 && (
                        <EmptyState
                            icon={Inbox}
                            title={issueSearch ? 'No matching issued books' : 'No books are issued right now'}
                            message={issueSearch ? 'Try another name, ID or title.' : 'Books you issue will appear here until they are returned.'}
                            compact
                        />
                    )}
                    {!issues.loading && !issues.error && issues.data?.issues.length > 0 && (
                        <ul className="divide-y divide-stone-100">
                            {issues.data.issues.map((issue) => (
                                <li key={issue._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-stone-900">{issue.bookTitle}</p>
                                        <p className="mt-0.5 truncate text-sm text-stone-600">
                                            {issue.studentName} · Roll {issue.roll} · {issue.phone}
                                        </p>
                                        <p className="truncate text-xs text-stone-500">{formatStudentClass(issue)}</p>
                                        <p className={`mt-1 text-xs ${issue.isOverdue ? 'font-medium text-red-600' : 'text-stone-500'}`}>
                                            Issued {formatDate(issue.issueDate)} · Due {formatDate(issue.dueDate)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <IssueStatusBadge issue={issue} />
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIssueToReturn(issue)}>
                                            <RotateCcw className="size-3.5" /> Return
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {issues.data && issues.data.totalPages > 1 && !issues.loading && (
                        <div className="border-t border-stone-100 p-4">
                            <Pagination page={issues.data.page} totalPages={issues.data.totalPages} onChange={setPage} />
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={Boolean(issueToReturn)}
                title="Mark this book as returned?"
                message={
                    <>
                        <span className="font-semibold text-stone-900">{issueToReturn?.bookTitle}</span> returned by{' '}
                        {issueToReturn?.studentName} (Roll {issueToReturn?.roll}). One copy will be added back to the shelf.
                    </>
                }
                confirmLabel="Confirm Return"
                loading={returning}
                onConfirm={handleReturn}
                onCancel={() => setIssueToReturn(null)}
            />
        </>
    );
};

export default IssueReturn;
