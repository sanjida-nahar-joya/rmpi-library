import { useState } from 'react';
import toast from 'react-hot-toast';
import { FolderOpen, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { RowsSkeleton, Spinner } from '../../components/Loader';
import { getCategoryStyle } from '../../utils/helpers';

const emptyForm = { name: '', description: '' };

const AdminCategories = () => {
    useTitle('Categories');
    const { data: categories, loading, error, refetch } = useFetch('/categories');
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const startEdit = (category) => {
        setEditing(category);
        setForm({ name: category.name, description: category.description || '' });
        setFormError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setFormError('Category name is required.');
            return;
        }

        setSaving(true);
        try {
            const res = editing ? await api.put(`/categories/${editing._id}`, form) : await api.post('/categories', form);
            toast.success(res.data.message);
            cancelEdit();
            refetch();
        } catch (err) {
            setFormError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await api.delete(`/categories/${categoryToDelete._id}`);
            toast.success(res.data.message);
            if (editing?._id === categoryToDelete._id) cancelEdit();
            refetch();
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setDeleting(false);
            setCategoryToDelete(null);
        }
    };

    return (
        <>
            <AdminPageHeader title="Categories" description="Organize books into subject categories." />

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <form onSubmit={handleSubmit} noValidate className="card self-start p-5 sm:p-6">
                    <h2 className="font-semibold text-stone-900">{editing ? 'Edit category' : 'Add a category'}</h2>
                    {editing && editing.bookCount > 0 && (
                        <p className="mt-1 text-xs text-stone-500">Renaming also updates the {editing.bookCount} books in this category.</p>
                    )}

                    <div className="mt-5 space-y-4">
                        <div>
                            <label htmlFor="name" className="label">
                                Name *
                            </label>
                            <input
                                id="name"
                                value={form.name}
                                onChange={(e) => {
                                    setForm({ ...form, name: e.target.value });
                                    setFormError('');
                                }}
                                className={`input ${formError ? 'input-error' : ''}`}
                                placeholder="e.g. কবিতা"
                                maxLength={60}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="label">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="input resize-y"
                                placeholder="A short description"
                                maxLength={300}
                            />
                        </div>
                        {formError && <p className="field-error">{formError}</p>}
                    </div>

                    <div className="mt-5 flex gap-2">
                        {editing && (
                            <button type="button" className="btn btn-secondary flex-1" onClick={cancelEdit}>
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                            {saving ? <Spinner className="size-4" /> : editing ? <Save className="size-4" /> : <Plus className="size-4" />}
                            {editing ? 'Save Changes' : 'Add Category'}
                        </button>
                    </div>
                </form>

                <div className="card self-start">
                    {loading && <RowsSkeleton rows={6} />}
                    {!loading && error && <ErrorState message={error} onRetry={refetch} />}
                    {!loading && !error && categories?.length === 0 && (
                        <EmptyState icon={FolderOpen} title="No categories yet" message="Add your first category using the form." />
                    )}
                    {!loading && !error && categories?.length > 0 && (
                        <ul className="divide-y divide-stone-100">
                            {categories.map((category) => {
                                const { color, icon: Icon } = getCategoryStyle(category.name);
                                return (
                                    <li key={category._id} className={`flex items-center gap-4 p-4 sm:px-5 ${editing?._id === category._id ? 'bg-brand-50/50' : ''}`}>
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: color }}>
                                            <Icon className="size-5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-stone-900">{category.name}</p>
                                            <p className="truncate text-sm text-stone-500">{category.description || 'No description'}</p>
                                        </div>
                                        <span className="hidden shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 sm:inline">
                                            {category.bookCount} {category.bookCount === 1 ? 'book' : 'books'}
                                        </span>
                                        <div className="flex shrink-0 gap-1">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(category)}
                                                className="rounded-md p-2 text-stone-500 transition hover:bg-brand-50 hover:text-brand-700"
                                                aria-label={`Edit ${category.name}`}
                                                title="Edit"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCategoryToDelete(category)}
                                                disabled={category.bookCount > 0}
                                                className="rounded-md p-2 text-stone-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-stone-500"
                                                aria-label={`Delete ${category.name}`}
                                                title={category.bookCount > 0 ? 'Move or delete its books before deleting' : 'Delete'}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={Boolean(categoryToDelete)}
                title="Delete this category?"
                message={
                    <>
                        The category <span className="font-semibold text-stone-900">{categoryToDelete?.name}</span> will be removed.
                    </>
                }
                confirmLabel="Delete Category"
                danger
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setCategoryToDelete(null)}
            />
        </>
    );
};

export default AdminCategories;
