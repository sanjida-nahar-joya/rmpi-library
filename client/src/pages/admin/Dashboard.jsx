import { Link } from 'react-router';
import { ArrowRight, BookCopy, BookOpenCheck, BookPlus, Inbox, Layers, Library, Pencil } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import { useAuth } from '../../context/AuthContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatCard from '../../components/admin/StatCard';
import CategoryChart from '../../components/admin/CategoryChart';
import InventoryStatus from '../../components/admin/InventoryStatus';
import IssueStatusBadge from '../../components/admin/IssueStatusBadge';
import BookCover from '../../components/BookCover';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Loader';
import { formatDate, formatLocalDate, formatNumber } from '../../utils/helpers';

const Panel = ({ title, description, link, linkLabel = 'View all', children }) => (
    <div className="card flex flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
            <div>
                <h2 className="font-semibold text-stone-900">{title}</h2>
                {description && <p className="mt-0.5 text-xs text-stone-500">{description}</p>}
            </div>
            {link && (
                <Link to={link} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900">
                    {linkLabel} <ArrowRight className="size-3.5" />
                </Link>
            )}
        </div>
        <div className="flex-1">{children}</div>
    </div>
);

const EmptyRow = ({ text }) => <p className="px-5 py-10 text-center text-sm text-stone-500">{text}</p>;

const BookRow = ({ book, detail }) => (
    <li className="flex items-center gap-3 px-5 py-3">
        <BookCover book={book} className="w-9 shrink-0 rounded-sm" />
        <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-stone-900">{book.title}</p>
            <p className="truncate text-xs text-stone-500">{detail}</p>
        </div>
        <Link
            to={`/admin/books/${book._id}/edit`}
            className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-brand-700"
            aria-label={`Edit ${book.title}`}
        >
            <Pencil className="size-4" />
        </Link>
    </li>
);

const Dashboard = () => {
    useTitle('Dashboard');
    const { user: admin } = useAuth();
    const stats = useFetch('/dashboard/stats');
    const activity = useFetch('/dashboard/recent-activities');

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const s = stats.data;
    const a = activity.data;

    return (
        <>
            <AdminPageHeader
                title={`Welcome back, ${admin?.name || 'Librarian'}`}
                description={today}
                action={
                    <>
                        <Link to="/admin/issues" className="btn btn-secondary">
                            <BookCopy className="size-4" /> Issue a book
                        </Link>
                        <Link to="/admin/books/new" className="btn btn-primary">
                            <BookPlus className="size-4" /> Add new book
                        </Link>
                    </>
                }
            />

            {a && a.pendingRequestCount > 0 && (
                <Link
                    to="/admin/requests"
                    className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:border-amber-300 sm:flex-row sm:items-center sm:justify-between"
                >
                    <span className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <Inbox className="size-5" />
                        </span>
                        <span>
                            <span className="block font-semibold text-amber-950">
                                {a.pendingRequestCount} pending book {a.pendingRequestCount === 1 ? 'request' : 'requests'}
                            </span>
                            <span className="block text-sm text-amber-800">Students are waiting for your approval.</span>
                        </span>
                    </span>
                    <span className="btn btn-primary btn-sm self-start sm:self-auto">
                        Review requests <ArrowRight className="size-3.5" />
                    </span>
                </Link>
            )}

            {stats.error && (
                <div className="card mb-6">
                    <ErrorState message={stats.error} onRetry={stats.refetch} compact />
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.loading &&
                    Array.from({ length: 4 }).map((_, index) => <div key={index} className="card h-[124px] animate-pulse bg-stone-50" />)}
                {s && !stats.loading && (
                    <>
                        <StatCard label="Total books" value={s.totalTitles} caption={`${formatNumber(s.totalCopies)} copies in total`} icon={Library} />
                        <StatCard label="Available books" value={s.availableCopies} caption="copies on the shelf" icon={BookOpenCheck} tone="green" />
                        <StatCard label="Issued books" value={s.issuedCopies} caption={`${s.overdueIssues} overdue`} icon={BookCopy} tone="orange" />
                        <StatCard label="Total categories" value={s.totalCategories} caption="subject areas" icon={Layers} tone="violet" />
                    </>
                )}
            </div>

            {s && !stats.loading && (
                <div className="mt-6 grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        <CategoryChart data={s.categoryDistribution} />
                    </div>
                    <div className="lg:col-span-2">
                        <InventoryStatus stats={s} />
                    </div>
                </div>
            )}

            {activity.error && (
                <div className="card mt-6">
                    <ErrorState message={activity.error} onRetry={activity.refetch} compact />
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Panel title="Recently issued" description="Latest books given to students" link="/admin/transactions?status=issued">
                    {activity.loading && <RowsSkeleton rows={4} />}
                    {a && a.recentIssued.length === 0 && <EmptyRow text="No books are issued right now." />}
                    {a && a.recentIssued.length > 0 && (
                        <ul className="divide-y divide-stone-100">
                            {a.recentIssued.map((issue) => (
                                <li key={issue._id} className="flex items-center gap-3 px-5 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-stone-900">{issue.bookTitle}</p>
                                        <p className="truncate text-xs text-stone-500">
                                            {issue.studentName} · Roll {issue.roll} · Due {formatDate(issue.dueDate)}
                                        </p>
                                    </div>
                                    <IssueStatusBadge issue={issue} />
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Recently returned" description="Latest books brought back" link="/admin/transactions?status=returned">
                    {activity.loading && <RowsSkeleton rows={4} />}
                    {a && a.recentReturned.length === 0 && <EmptyRow text="No books have been returned yet." />}
                    {a && a.recentReturned.length > 0 && (
                        <ul className="divide-y divide-stone-100">
                            {a.recentReturned.map((issue) => (
                                <li key={issue._id} className="flex items-center gap-3 px-5 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-stone-900">{issue.bookTitle}</p>
                                        <p className="truncate text-xs text-stone-500">
                                            {issue.studentName} · Roll {issue.roll}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-xs text-stone-500">Returned {formatLocalDate(issue.returnDate)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Panel title="Low stock books" description="Only 1 or 2 copies left" link="/admin/books?availability=limited">
                    {activity.loading && <RowsSkeleton rows={4} />}
                    {a && a.lowStockBooks.length === 0 && <EmptyRow text="No books are running low." />}
                    {a && a.lowStockBooks.length > 0 && (
                        <ul className="divide-y divide-stone-100">
                            {a.lowStockBooks.map((book) => (
                                <BookRow key={book._id} book={book} detail={`${book.availableCopies} of ${book.totalCopies} copies left`} />
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Unavailable books" description="All copies are issued" link="/admin/books?availability=unavailable">
                    {activity.loading && <RowsSkeleton rows={4} />}
                    {a && a.unavailableBooks.length === 0 && <EmptyRow text="Every book has at least one copy available." />}
                    {a && a.unavailableBooks.length > 0 && (
                        <ul className="divide-y divide-stone-100">
                            {a.unavailableBooks.map((book) => (
                                <BookRow key={book._id} book={book} detail={`0 of ${book.totalCopies} available · all issued`} />
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Recently added" description="Newest books in the catalog" link="/admin/books">
                    {activity.loading && <RowsSkeleton rows={4} />}
                    {a && a.recentBooks.length === 0 && <EmptyRow text="No books added yet." />}
                    {a && a.recentBooks.length > 0 && (
                        <ul className="divide-y divide-stone-100">
                            {a.recentBooks.map((book) => (
                                <BookRow key={book._id} book={book} detail={`${book.category} · added ${formatLocalDate(book.createdAt)}`} />
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </>
    );
};

export default Dashboard;
