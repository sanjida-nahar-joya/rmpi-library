import { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { ClipboardList, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import useFetch from '../hooks/useFetch';
import useTitle from '../hooks/useTitle';
import PageHeader from '../components/PageHeader';
import BookCover from '../components/BookCover';
import RequestStatusBadge from '../components/RequestStatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { RowsSkeleton } from '../components/Loader';
import { formatDate, formatDateTime, formatLocalDate } from '../utils/helpers';

// One line that explains where the request stands
const RequestDetail = ({ request }) => {
    if (request.status === 'pending') {
        return <p className="text-sm text-amber-800">Waiting for the librarian to approve your request.</p>;
    }
    if (request.status === 'rejected') {
        return <p className="text-sm text-red-700">Rejected{request.note ? `: ${request.note}` : '.'}</p>;
    }
    if (request.status === 'cancelled') {
        return <p className="text-sm text-stone-500">You cancelled this request.</p>;
    }
    if (request.issue?.status === 'returned') {
        return <p className="text-sm text-stone-600">Returned on {formatLocalDate(request.issue.returnDate)}. Thank you!</p>;
    }
    if (request.issue) {
        return (
            <p className={`text-sm ${request.issue.isOverdue ? 'font-medium text-red-700' : 'text-emerald-800'}`}>
                Approved. Collect it from the library desk. Return by {formatDate(request.issue.dueDate)}.
                {request.issue.isOverdue && ' This book is overdue.'}
            </p>
        );
    }
    return <p className="text-sm text-emerald-800">Approved. Return by {formatDate(request.dueDate)}.</p>;
};

const MyRequests = () => {
    useTitle('My Requests');
    const { data: requests, loading, error, refetch } = useFetch('/requests/my');
    const [requestToCancel, setRequestToCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const res = await api.put(`/requests/${requestToCancel._id}/cancel`);
            toast.success(res.data.message);
            refetch();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setCancelling(false);
            setRequestToCancel(null);
        }
    };

    const pendingCount = requests?.filter((request) => request.status === 'pending').length || 0;

    return (
        <>
            <PageHeader
                eyebrow="My account"
                title="My Book Requests"
                description="Track the books you have requested. Approved books can be collected from the library desk."
            />

            <section className="container-page py-10">
                {requests?.length > 0 && (
                    <p className="mb-4 text-sm text-stone-600">
                        {requests.length} {requests.length === 1 ? 'request' : 'requests'} · {pendingCount} pending
                    </p>
                )}

                <div className="card overflow-hidden">
                    {loading && <RowsSkeleton rows={4} />}
                    {!loading && error && <ErrorState message={error} onRetry={refetch} />}
                    {!loading && !error && requests?.length === 0 && (
                        <EmptyState
                            icon={ClipboardList}
                            title="You haven't requested any books yet"
                            message="Find a book in the catalog and press “Request this Book” on its page."
                            action={
                                <Link to="/books" className="btn btn-primary">
                                    Browse Books
                                </Link>
                            }
                        />
                    )}

                    {!loading && !error && requests?.length > 0 && (
                        <ul className="divide-y divide-stone-100">
                            {requests.map((request) => (
                                <li key={request._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                                    <div className="flex min-w-0 flex-1 gap-4">
                                        <Link to={`/books/${request.bookId}`} className="shrink-0">
                                            <BookCover
                                                book={{
                                                    title: request.bookTitle,
                                                    author: request.bookAuthor,
                                                    category: request.bookCategory,
                                                    coverImage: request.bookCover,
                                                }}
                                                className="w-14 rounded-sm shadow-sm"
                                            />
                                        </Link>
                                        <div className="min-w-0">
                                            <Link to={`/books/${request.bookId}`} className="font-serif text-lg font-semibold text-stone-900 hover:text-brand-700">
                                                {request.bookTitle}
                                            </Link>
                                            <p className="text-sm text-stone-600">{request.bookAuthor}</p>
                                            <p className="mt-1 text-xs text-stone-500">Requested {formatDateTime(request.createdAt)}</p>
                                            <div className="mt-2">
                                                <RequestDetail request={request} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                        <RequestStatusBadge request={request} />
                                        {request.status === 'pending' && (
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRequestToCancel(request)}>
                                                <X className="size-3.5" /> Cancel request
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <ConfirmDialog
                open={Boolean(requestToCancel)}
                title="Cancel this request?"
                message={
                    <>
                        Your request for <span className="font-semibold text-stone-900">{requestToCancel?.bookTitle}</span> will be
                        cancelled. You can request it again later.
                    </>
                }
                confirmLabel="Cancel Request"
                cancelLabel="Keep Request"
                danger
                loading={cancelling}
                onConfirm={handleCancel}
                onCancel={() => setRequestToCancel(null)}
            />
        </>
    );
};

export default MyRequests;
