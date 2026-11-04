import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { History, Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import IssueStatusBadge from '../../components/admin/IssueStatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Loader';
import { formatDate, formatLocalDate, formatStudentClass } from '../../utils/helpers';

const tabs = [
    { value: '', label: 'All' },
    { value: 'issued', label: 'Issued' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'returned', label: 'Returned' },
];

const Transactions = () => {
    useTitle('Transactions');
    const [searchParams, setSearchParams] = useSearchParams();
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = Number(searchParams.get('page')) || 1;
    const [searchInput, setSearchInput] = useState(search);

    const query = new URLSearchParams({ page, limit: 12 });
    if (status) query.set('status', status);
    if (search) query.set('search', search);
    const { data, loading, error, refetch } = useFetch(`/issues?${query.toString()}`);

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

    return (
        <>
            <AdminPageHeader title="Transactions" description="Complete history of every book issue and return." />

            <div className="card">
                <div className="flex flex-col gap-3 border-b border-stone-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-1 overflow-x-auto rounded-lg bg-stone-100 p-1" role="tablist" aria-label="Filter by status">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                role="tab"
                                aria-selected={status === tab.value}
                                onClick={() => updateParams({ status: tab.value })}
                                className={`rounded-md px-4 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                                    status === tab.value ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSearch} className="relative w-full lg:max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search name, roll, phone or book (press Enter)"
                            className="input pl-10"
                            aria-label="Search transactions"
                        />
                    </form>
                </div>

                {loading && <RowsSkeleton rows={8} />}
                {!loading && error && <ErrorState message={error} onRetry={refetch} />}
                {!loading && !error && data?.issues.length === 0 && (
                    <EmptyState
                        icon={History}
                        title="No transactions found"
                        message={search ? 'Try another name, roll, phone or book title.' : 'Issue and return records will appear here.'}
                    />
                )}

                {!loading && !error && data?.issues.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-sm">
                            <thead className="bg-stone-50 text-left text-xs text-stone-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Book</th>
                                    <th className="px-4 py-3 font-medium">Student</th>
                                    <th className="px-4 py-3 font-medium">Issue date</th>
                                    <th className="px-4 py-3 font-medium">Due date</th>
                                    <th className="px-4 py-3 font-medium">Returned</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {data.issues.map((issue) => (
                                    <tr key={issue._id} className="transition hover:bg-stone-50/70">
                                        <td className="px-4 py-3">
                                            <p className="max-w-[240px] truncate font-medium text-stone-900">{issue.bookTitle}</p>
                                            <p className="max-w-[240px] truncate text-xs text-stone-500">{issue.bookAuthor}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-stone-800">{issue.studentName}</p>
                                            <p className="text-xs text-stone-500">
                                                Roll {issue.roll} · {issue.phone}
                                            </p>
                                            <p className="text-xs text-stone-500">{formatStudentClass(issue)}</p>
                                        </td>
                                        <td className="px-4 py-3 text-stone-700">{formatDate(issue.issueDate)}</td>
                                        <td className={`px-4 py-3 ${issue.isOverdue ? 'font-medium text-red-600' : 'text-stone-700'}`}>
                                            {formatDate(issue.dueDate)}
                                        </td>
                                        <td className="px-4 py-3 text-stone-700">{formatLocalDate(issue.returnDate)}</td>
                                        <td className="px-4 py-3">
                                            <IssueStatusBadge issue={issue} />
                                            {issue.requestId && <p className="mt-1 text-[11px] text-stone-400">From student request</p>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data && data.totalPages > 1 && !loading && (
                    <div className="flex flex-col items-center gap-3 border-t border-stone-100 p-4 sm:flex-row sm:justify-between">
                        <p className="text-sm text-stone-500">{data.total} records</p>
                        <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => updateParams({ page: String(p) })} />
                    </div>
                )}
            </div>
        </>
    );
};

export default Transactions;
