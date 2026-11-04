import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCheck, Mail, Reply, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Loader';
import { formatDateTime } from '../../utils/helpers';

const Messages = () => {
    useTitle('Contact Messages');
    const { data: messages, loading, error, refetch } = useFetch('/contact');
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const unreadCount = messages?.filter((message) => !message.isRead).length || 0;

    const markAsRead = async (id) => {
        try {
            await api.patch(`/contact/${id}/read`);
            refetch();
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await api.delete(`/contact/${messageToDelete._id}`);
            toast.success(res.data.message);
            refetch();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setDeleting(false);
            setMessageToDelete(null);
        }
    };

    return (
        <>
            <AdminPageHeader
                title="Contact Messages"
                description={messages ? `${messages.length} messages · ${unreadCount} unread` : 'Messages sent from the contact page'}
            />

            {loading && (
                <div className="card">
                    <RowsSkeleton rows={4} />
                </div>
            )}
            {!loading && error && (
                <div className="card">
                    <ErrorState message={error} onRetry={refetch} />
                </div>
            )}
            {!loading && !error && messages?.length === 0 && (
                <div className="card">
                    <EmptyState icon={Mail} title="No messages yet" message="Messages sent from the website's contact form will appear here." />
                </div>
            )}

            {!loading && !error && messages?.length > 0 && (
                <ul className="space-y-4">
                    {messages.map((message) => (
                        <li key={message._id} className={`card p-5 ${message.isRead ? '' : 'border-brand-200 ring-1 ring-brand-100'}`}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {!message.isRead && <span className="size-2 rounded-full bg-brand-600" aria-label="Unread" />}
                                        <h2 className="font-semibold text-stone-900">{message.subject}</h2>
                                    </div>
                                    <p className="mt-1 text-sm text-stone-600">
                                        {message.name} ·{' '}
                                        <a href={`mailto:${message.email}`} className="text-brand-700 hover:underline">
                                            {message.email}
                                        </a>
                                    </p>
                                </div>
                                <p className="shrink-0 text-xs text-stone-500">{formatDateTime(message.createdAt)}</p>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-stone-700">{message.message}</p>

                            <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                                <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="btn btn-secondary btn-sm">
                                    <Reply className="size-3.5" /> Reply by email
                                </a>
                                {!message.isRead && (
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => markAsRead(message._id)}>
                                        <CheckCheck className="size-3.5" /> Mark as read
                                    </button>
                                )}
                                <button type="button" className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setMessageToDelete(message)}>
                                    <Trash2 className="size-3.5" /> Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmDialog
                open={Boolean(messageToDelete)}
                title="Delete this message?"
                message={`The message from ${messageToDelete?.name} will be permanently deleted.`}
                confirmLabel="Delete Message"
                danger
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setMessageToDelete(null)}
            />
        </>
    );
};

export default Messages;
