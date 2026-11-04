import { BookOpen, CircleCheck, Clock } from 'lucide-react';

const IssueStatusBadge = ({ issue }) => {
    const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset';

    if (issue.status === 'returned') {
        return (
            <span className={`${base} bg-stone-100 text-stone-700 ring-stone-500/20`}>
                <CircleCheck className="size-3.5" /> Returned
            </span>
        );
    }

    if (issue.isOverdue) {
        return (
            <span className={`${base} bg-red-50 text-red-700 ring-red-600/20`}>
                <Clock className="size-3.5" /> Overdue
            </span>
        );
    }

    return (
        <span className={`${base} bg-blue-50 text-blue-700 ring-blue-600/20`}>
            <BookOpen className="size-3.5" /> Issued
        </span>
    );
};

export default IssueStatusBadge;
