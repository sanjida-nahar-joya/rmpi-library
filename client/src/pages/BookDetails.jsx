import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    BookPlus,
    BookX,
    ChevronRight,
    CircleCheck,
    CircleX,
    Clock,
    Info,
    TriangleAlert,
} from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import useTitle from '../hooks/useTitle';
import BookCover from '../components/BookCover';
import BookCard from '../components/BookCard';
import AvailabilityBadge from '../components/AvailabilityBadge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { PageLoader, Spinner } from '../components/Loader';
import { formatDate, formatDateTime } from '../utils/helpers';

// Shows the right "borrow" option for visitors, students and librarians
const RequestSection = ({ book }) => {
    const { user, isAdmin, isStudent } = useAuth();
    const location = useLocation();
    const myRequests = useFetch(isStudent ? '/requests/my' : null);
    const [sending, setSending] = useState(false);

    const handleRequest = async () => {
        setSending(true);
        try {
            const res = await api.post('/requests', { bookId: book._id });
            toast.success(res.data.message);
            myRequests.refetch();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSending(false);
        }
    };

    const box = 'mt-6 rounded-xl border p-5';

    if (isAdmin) {
        return (
            <div className={`${box} flex gap-3 border-brand-100 bg-brand-50/60 text-sm text-brand-900`}>
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>
                    You are logged in as library staff. Issue this book from the{' '}
                    <Link to="/admin/issues" className="font-semibold underline">
                        Issue & Return
                    </Link>{' '}
                    page.
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`${box} border-stone-200 bg-white`}>
                <h2 className="font-semibold text-stone-900">Want to borrow this book?</h2>
                <p className="mt-1 text-sm text-stone-600">
                    Log in with your student account to send a request. Once the librarian approves it, collect the book from the
                    library desk.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
                        Log in to request
                    </Link>
                    <Link to="/register" state={{ from: location.pathname }} className="btn btn-secondary">
                        Create account
                    </Link>
                </div>
            </div>
        );
    }

    if (myRequests.loading) return <div className={`${box} h-28 animate-pulse border-stone-200 bg-stone-50`} />;

    const requestsForBook = (myRequests.data || []).filter((request) => request.bookId === book._id);
    const pending = requestsForBook.find((request) => request.status === 'pending');
    const borrowed = requestsForBook.find((request) => request.status === 'approved' && request.issue?.status === 'issued');

    if (borrowed) {
        return (
            <div className={`${box} flex gap-3 border-emerald-200 bg-emerald-50 text-emerald-900`}>
                <CircleCheck className="mt-0.5 size-5 shrink-0" />
                <div>
                    <p className="font-semibold">You have borrowed this book.</p>
                    <p className="mt-0.5 text-sm">Please return it by {formatDate(borrowed.issue.dueDate)}.</p>
                </div>
            </div>
        );
    }

    if (pending) {
        return (
            <div className={`${box} flex gap-3 border-amber-200 bg-amber-50 text-amber-900`}>
                <Clock className="mt-0.5 size-5 shrink-0" />
                <div>
                    <p className="font-semibold">Request sent. Waiting for approval.</p>
                    <p className="mt-0.5 text-sm">
                        You requested this book on {formatDateTime(pending.createdAt)}.{' '}
                        <Link to="/my-requests" className="font-semibold underline">
                            View my requests
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    if (book.availableCopies < 1) {
        return (
            <div className={`${box} flex gap-3 border-stone-200 bg-stone-50 text-sm text-stone-700`}>
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>All copies are issued right now. You can request this book as soon as a copy is returned.</p>
            </div>
        );
    }

    return (
        <div className={`${box} border-stone-200 bg-white`}>
            <h2 className="font-semibold text-stone-900">Borrow this book</h2>
            <p className="mt-1 text-sm text-stone-600">
                Send a request to the librarian. Once approved, collect the book from the library desk.
            </p>
            <button type="button" className="btn btn-primary mt-4" onClick={handleRequest} disabled={sending}>
                {sending ? <Spinner className="size-4" /> : <BookPlus className="size-4" />}
                {sending ? 'Sending request...' : 'Request this Book'}
            </button>
        </div>
    );
};

const statusBox = {
    available: {
        icon: CircleCheck,
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        title: 'This book is currently available in the library.',
    },
    limited: {
        icon: TriangleAlert,
        className: 'border-amber-200 bg-amber-50 text-amber-900',
        title: 'This book is currently available in the library.',
    },
    unavailable: {
        icon: CircleX,
        className: 'border-red-200 bg-red-50 text-red-800',
        title: 'Currently unavailable. All copies are issued.',
    },
};

const BookDetails = () => {
    const { id } = useParams();
    const { data: book, loading, error, status, refetch } = useFetch(`/books/${id}`);
    const relatedUrl = book ? `/books?category=${encodeURIComponent(book.category)}&limit=5&sort=title` : null;
    const { data: related } = useFetch(relatedUrl);
    useTitle(book && !loading ? book.title : 'Book Details');

    if (loading) return <PageLoader text="Loading book details..." />;

    if (error) {
        return (
            <div className="container-page py-16">
                <div className="card">
                    {status === 404 ? (
                        <EmptyState
                            icon={BookX}
                            title="Book not found"
                            message="This book may have been removed from the catalog, or the link is incorrect."
                            action={
                                <Link to="/books" className="btn btn-primary">
                                    Back to catalog
                                </Link>
                            }
                        />
                    ) : (
                        <ErrorState message={error} onRetry={refetch} />
                    )}
                </div>
            </div>
        );
    }

    const box = statusBox[book.availability] || statusBox.unavailable;
    const relatedBooks = (related?.books || []).filter((item) => item._id !== book._id).slice(0, 4);

    const details = [
        { label: 'ISBN', value: book.isbn },
        { label: 'Publisher', value: book.publisher },
        { label: 'Publication year', value: book.publicationYear },
        { label: 'Language', value: book.language },
        { label: 'Category', value: book.category },
    ];

    return (
        <>
            <div className="border-b border-stone-200 bg-white">
                <nav className="container-page flex items-center gap-1.5 py-3 text-sm text-stone-500" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-brand-700">
                        Home
                    </Link>
                    <ChevronRight className="size-4 shrink-0" />
                    <Link to="/books" className="hover:text-brand-700">
                        Books
                    </Link>
                    <ChevronRight className="size-4 shrink-0" />
                    <span className="truncate text-stone-800">{book.title}</span>
                </nav>
            </div>

            <section className="container-page py-10 lg:py-14">
                <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-14">
                    <div>
                        <div className="rounded-3xl bg-linear-to-b from-stone-200/70 to-stone-100 p-8 lg:sticky lg:top-24">
                            <BookCover
                                book={book}
                                className="mx-auto w-full max-w-[260px] shadow-[0_24px_40px_-12px_rgba(28,25,23,0.5)]"
                            />
                        </div>
                    </div>

                    <div>
                        <Link
                            to={`/books?category=${encodeURIComponent(book.category)}`}
                            className="text-sm font-medium text-brand-600 hover:text-brand-800"
                        >
                            {book.category}
                        </Link>
                        <h1 className="mt-2 font-serif text-3xl leading-tight font-semibold text-stone-900 sm:text-4xl">
                            {book.title}
                        </h1>
                        <p className="mt-2 text-lg text-stone-600">
                            by <span className="font-medium text-stone-800">{book.author}</span>
                        </p>

                        <div className="mt-5">
                            <AvailabilityBadge availability={book.availability} large />
                        </div>

                        <div className={`mt-6 flex gap-3 rounded-xl border p-4 ${box.className}`}>
                            <box.icon className="mt-0.5 size-5 shrink-0" />
                            <div>
                                <p className="font-semibold">{box.title}</p>
                                <p className="mt-0.5 text-sm opacity-90">
                                    {book.availability === 'unavailable'
                                        ? 'Please check again later. Availability updates as soon as a copy is returned.'
                                        : book.availability === 'limited'
                                          ? `Limited copies: only ${book.availableCopies} of ${book.totalCopies} left on the shelf.`
                                          : `${book.availableCopies} of ${book.totalCopies} copies are on the shelf.`}
                                </p>
                            </div>
                        </div>

                        <RequestSection book={book} />

                        <div className="mt-6 grid grid-cols-3 gap-3">
                            {[
                                { label: 'Total copies', value: book.totalCopies },
                                { label: 'Available', value: book.availableCopies },
                                { label: 'Issued', value: book.issuedCopies },
                            ].map((item) => (
                                <div key={item.label} className="card p-4 text-center">
                                    <p className="text-2xl font-semibold text-stone-900">{item.value}</p>
                                    <p className="mt-0.5 text-xs text-stone-500 sm:text-sm">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="card mt-6">
                            <h2 className="border-b border-stone-100 px-5 py-4 font-semibold text-stone-900">Book information</h2>
                            <dl className="divide-y divide-stone-100">
                                {details.map((item) => (
                                    <div key={item.label} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3 text-sm">
                                        <dt className="text-stone-500">{item.label}</dt>
                                        <dd className={item.value ? 'font-medium text-stone-900' : 'text-stone-400'}>
                                            {item.value || 'Not specified'}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="mt-6">
                            <h2 className="font-semibold text-stone-900">Description</h2>
                            <p className="mt-2 leading-relaxed text-stone-700">
                                {book.description || 'No description has been added for this book yet.'}
                            </p>
                        </div>

                        <Link to="/books" className="btn btn-ghost mt-6 -ml-3">
                            <ArrowLeft className="size-4" /> Back to catalog
                        </Link>
                    </div>
                </div>
            </section>

            {relatedBooks.length > 0 && (
                <section className="container-page border-t border-stone-200 pt-14">
                    <h2 className="font-serif text-2xl font-semibold text-stone-900">Related Books</h2>
                    <p className="mt-1 text-stone-600">More from {book.category}</p>
                    <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                        {relatedBooks.map((item) => (
                            <BookCard key={item._id} book={item} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
};

export default BookDetails;
