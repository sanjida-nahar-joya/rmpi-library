import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Spinner } from './Loader';

const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    loading = false,
    icon: Icon = TriangleAlert,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === 'Escape' && !loading) onCancel();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, loading, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]" onClick={() => !loading && onCancel()} />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
                <div className="flex gap-4">
                    <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                            danger ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'
                        }`}
                    >
                        <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h2 id="confirm-title" className="text-base font-semibold text-stone-900">
                            {title}
                        </h2>
                        <div className="mt-1.5 text-sm text-stone-600">{message}</div>
                    </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading} autoFocus>
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading && <Spinner className="size-4" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
