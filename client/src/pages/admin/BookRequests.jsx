import { useState } from 'react';
import { useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { Check, CircleCheck, Inbox, Search, X } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BookCover from '../../components/BookCover';
import AvailabilityBadge from '../../components/AvailabilityBadge';
import RequestStatusBadge from '../../components/RequestStatusBadge';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Loader';
import { addDays, formatDate, formatDateTime, formatStudentClass, toInputDate } from '../../utils/helpers';

const tabs = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'all', label: 'All' },
];

const BookRequests = () => {
    useTitle('Book Requests');
    const [searchParams, setSearchParams] = useSearchParams();
    const status = searchParams.get('status') || 'pending';
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page')) || 1;
    const [searchInput, setSearchInput] = useState(search);

    const [requestToApprove, setRequestToApprove] = useState(null);
    const [dueDate, setDueDate] = useState(toInputDate(addDays(14)));
    const [requestToReject, setRequestToReject] = useState(null);
    const [note, setNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const query = new URLSearchParams({ page, limit: 10 });
    if (status !== 'all') query.set('status', status);
    if (search) query.set('search', search);
    const { data, loading, error, refetch } = useFetch(`/requests?${query.toString()}`);

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

    // Reload the list, or go back a page if the last item on this page was handled
    const reloadList = () => {
        if (data.requests.length === 1 && page > 1) updateParams({ page: String(page - 1) });
        else refetch();
    };

    const openApprove = (request) => {
        setDueDate(toInputDate(addDays(14)));
        setRequestToApprove(request);
    };

    const openReject = (request) => {
        setNote('');
        setRequestToReject(request);
    };

    const handleApprove = async () => {
        if (!dueDate) {
            toast.error('Please choose a due date.');
            return;
        }
        setProcessing(true);
        try {
            const res = await api.put(`/requests/${requestToApprove._id}/approve`, { dueDate });
            toast.success(res.data.message);
            setRequestToApprove(null);
            reloadList();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        setProcessing(true);
        try {
            const res = await api.put(`/requests/${requestToReject._id}/reject`, { note });
            toast.success(res.data.message);
            setRequestToReject(null);
            reloadList();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <AdminPageHeader
                title="Book Requests"
                description="Approve a request to issue the book automatically, or reject it with a reason."
            />

            <div className="card">
                <div className="flex flex-col gap-3 border-b border-stone-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-1 overflow-x-auto rounded-lg bg-stone-100 p-1" role="tablist" aria-label="Filter by status">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                role="tab"
                                aria-selected={status === tab.value}
                                onClick={() => updateParams({ status: tab.value === 'pending' ? '' : tab.value })}
                                className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                                    status === tab.value ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                {tab.label}
                                {tab.value === 'pending' && data?.pendingCount > 0 && (
                                    <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">{data.pendingCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSearch} className="relative w-full lg:max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search student, roll, phone or book (press Enter)"
                            className="input pl-10"
                            aria-label="Search requests"
                        />
                    </form>
                </div>

                {loading && <RowsSkeleton rows={5} />}
                {!loading && error && <ErrorState message={error} onRetry={refetch} />}
                {!loading && !error && data?.requests.length === 0 && (
                    <EmptyState
                        icon={Inbox}
                        title={status === 'pending' ? 'No pending requests' : 'No requests found'}
                        message={
                            search
                                ? 'Try another name, roll, phone or book title.'
                                : status === 'pending'
                                  ? 'New book requests from students will appear here.'
                                  : 'Requests with this status will appear here.'
                        }
                    />
                )}

                {!loading && !error && data?.requests.length > 0 && (
                    <ul className="divide-y divide-stone-100">
                        {data.requests.map((request) => (
                            <li
                                key={request._id}
                                className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center"
                            >
                                <div className="flex min-w-0 gap-3">
                                    <BookCover
                                        book={{
                                            title: request.bookTitle,
                                            author: request.bookAuthor,
                                            category: request.bookCategory,
                                            coverImage: request.bookCover,
                                        }}
                                        className="w-11 shrink-0 rounded-sm"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-stone-900">{request.bookTitle}</p>
                                        <p className="truncate text-xs text-stone-500">{request.bookAuthor}</p>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                            {request.book ? (
                                                <>
                                                    <AvailabilityBadge availability={request.book.availability} />
                                                    <span className="text-xs text-stone-500">
                                                        {request.book.availableCopies} of {request.book.totalCopies} on the shelf
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xs font-medium text-red-600">Book removed from catalog</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="min-w-0 text-sm">
                                    <p className="font-medium text-stone-900">{request.studentName}</p>
                                    <p className="text-xs text-stone-500">
                                        Roll {request.roll} ·{' '}
                                        <a href={`tel:${request.phone}`} className="hover:text-brand-700">
                                            {request.phone}
                                        </a>
                                    </p>
                                    <p className="text-xs text-stone-500">{formatStudentClass(request)}</p>
                                    <p className="mt-1 text-xs text-stone-400">Requested {formatDateTime(request.createdAt)}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                    {request.status === 'pending' ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => openApprove(request)}
                                                disabled={!request.book || request.book.availableCopies < 1}
                                                title={!request.book || request.book.availableCopies < 1 ? 'No copies available right now' : 'Approve and issue'}
                                            >
                                                <Check className="size-3.5" /> Approve
                                            </button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => openReject(request)}>
                                                <X className="size-3.5" /> Reject
                                            </button>
                                        </>
                                    ) : (
                                        <div className="lg:text-right">
                                            <RequestStatusBadge request={request} />
                                            {request.status === 'approved' && (
                                                <p className="mt-1 text-xs text-stone-500">Due {formatDate(request.dueDate)}</p>
                                            )}
                                            {request.status === 'rejected' && request.note && (
                                                <p className="mt-1 max-w-[220px] text-xs text-stone-500">{request.note}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {data && data.totalPages > 1 && !loading && (
                    <div className="border-t border-stone-100 p-4">
                        <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => updateParams({ page: String(p) })} />
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={Boolean(requestToApprove)}
                icon={CircleCheck}
                title="Approve and issue this book?"
                message={
                    <>
                        <p>
                            <span className="font-semibold text-stone-900">{requestToApprove?.bookTitle}</span> will be issued to{' '}
                            {requestToApprove?.studentName} (Roll {requestToApprove?.roll}). One copy will be taken from the shelf.
                        </p>
                        <label htmlFor="approve-due-date" className="label mt-4">
                            Due date
                        </label>
                        <input
                            id="approve-due-date"
                            type="date"
                            min={toInputDate()}
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="input"
                        />
                    </>
                }
                confirmLabel="Approve & Issue"
                loading={processing}
                onConfirm={handleApprove}
                onCancel={() => setRequestToApprove(null)}
            />

            <ConfirmDialog
                open={Boolean(requestToReject)}
                title="Reject this request?"
                message={
                    <>
                        <p>
                            The request from {requestToReject?.studentName} for{' '}
                            <span className="font-semibold text-stone-900">{requestToReject?.bookTitle}</span> will be rejected.
                        </p>
                        <label htmlFor="reject-note" className="label mt-4">
                            Reason <span className="font-normal text-stone-400">(optional, shown to the student)</span>
                        </label>
                        <textarea
                            id="reject-note"
                            rows={3}
                            maxLength={300}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="input resize-y"
                            placeholder="e.g. Please collect your previous book first."
                        />
                    </>
                }
                confirmLabel="Reject Request"
                danger
                loading={processing}
                onConfirm={handleReject}
                onCancel={() => setRequestToReject(null)}
            />
        </>
    );
};

export default BookRequests;
