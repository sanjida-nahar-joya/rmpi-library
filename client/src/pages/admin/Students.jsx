import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Users, X } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton } from '../../components/Loader';
import { formatLocalDate } from '../../utils/helpers';

const Students = () => {
    useTitle('Students');
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const page = Number(searchParams.get('page')) || 1;
    const [searchInput, setSearchInput] = useState(search);

    const query = new URLSearchParams({ page, limit: 12 });
    if (search) query.set('search', search);
    if (department) query.set('department', department);
    const { data, loading, error, refetch } = useFetch(`/students?${query.toString()}`);
    const { data: options } = useFetch('/students/options');

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

    const hasFilters = Boolean(search || department);

    return (
        <>
            <AdminPageHeader
                title="Students"
                description={
                    data
                        ? `${data.total} registered ${data.total === 1 ? 'student' : 'students'}${hasFilters ? ' (filtered)' : ''}`
                        : 'All registered student accounts'
                }
            />

            <div className="card">
                <div className="grid gap-3 border-b border-stone-100 p-4 md:grid-cols-[1fr_260px_auto]">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search name, roll, phone or email (press Enter)"
                            className="input pl-10"
                            aria-label="Search students"
                        />
                    </form>
                    <select
                        value={department}
                        onChange={(e) => updateParams({ department: e.target.value })}
                        className="input"
                        aria-label="Filter by department"
                    >
                        <option value="">All departments</option>
                        {options?.departments.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <button type="button" className="btn btn-secondary" onClick={clearFilters} disabled={!hasFilters && !searchInput}>
                        <X className="size-4" /> Clear
                    </button>
                </div>

                {loading && <RowsSkeleton rows={6} />}
                {!loading && error && <ErrorState message={error} onRetry={refetch} />}
                {!loading && !error && data?.students.length === 0 && (
                    <EmptyState
                        icon={Users}
                        title={hasFilters ? 'No students match your search' : 'No students yet'}
                        message={
                            hasFilters
                                ? 'Try another name, roll, phone or email.'
                                : 'Students appear here after they register on the website.'
                        }
                    />
                )}

                {!loading && !error && data?.students.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead className="bg-stone-50 text-left text-xs text-stone-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Student</th>
                                    <th className="px-4 py-3 font-medium">Roll</th>
                                    <th className="px-4 py-3 font-medium">Department</th>
                                    <th className="px-4 py-3 font-medium">Semester</th>
                                    <th className="px-4 py-3 font-medium">Shift</th>
                                    <th className="px-4 py-3 font-medium">Phone</th>
                                    <th className="px-4 py-3 font-medium">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {data.students.map((student) => (
                                    <tr key={student._id} className="transition hover:bg-stone-50/70">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="max-w-[240px] truncate font-medium text-stone-900">{student.name}</p>
                                                    <p className="max-w-[240px] truncate text-xs text-stone-500">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-stone-700">{student.roll}</td>
                                        <td className="px-4 py-3 text-stone-700">{student.department}</td>
                                        <td className="px-4 py-3 text-stone-700">{student.semester}</td>
                                        <td className="px-4 py-3 text-stone-700">{student.shift}</td>
                                        <td className="px-4 py-3 text-stone-700">{student.phone}</td>
                                        <td className="px-4 py-3 text-stone-600">{formatLocalDate(student.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data && data.totalPages > 1 && !loading && (
                    <div className="flex flex-col items-center gap-3 border-t border-stone-100 p-4 sm:flex-row sm:justify-between">
                        <p className="text-sm text-stone-500">{data.total} students</p>
                        <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => updateParams({ page: String(p) })} />
                    </div>
                )}
            </div>
        </>
    );
};

export default Students;
