import { useRef, useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { ImageUp, Save, Star } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import BookCover from '../BookCover';
import { Spinner } from '../Loader';

const emptyBook = {
    title: '',
    author: '',
    category: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    language: 'Bangla',
    description: '',
    coverImage: '',
    totalCopies: 1,
    featured: false,
};

// Keep only the fields the form edits
const pickFields = (book) => {
    const values = { ...emptyBook };
    Object.keys(emptyBook).forEach((key) => {
        if (book?.[key] !== undefined && book[key] !== null) values[key] = book[key];
    });
    return values;
};

const Field = ({ label, htmlFor, error, hint, children, className = '' }) => (
    <div className={className}>
        <label htmlFor={htmlFor} className="label">
            {label}
        </label>
        {children}
        {error ? <p className="field-error">{error}</p> : hint && <p className="mt-1.5 text-xs text-stone-500">{hint}</p>}
    </div>
);

const BookForm = ({ initialValues, issuedCopies = 0, submitLabel, onSubmit }) => {
    const [form, setForm] = useState(() => pickFields(initialValues));
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef(null);
    const { data: categories, loading: categoriesLoading } = useFetch('/categories');
    const currentYear = new Date().getFullYear();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const validate = () => {
        const newErrors = {};
        const isbn = String(form.isbn).replace(/[-\s]/g, '');
        const year = Number(form.publicationYear);
        const copies = Number(form.totalCopies);

        if (!form.title.trim()) newErrors.title = 'Book title is required.';
        if (!form.author.trim()) newErrors.author = 'Author name is required.';
        if (!form.category) newErrors.category = 'Please choose a category.';
        if (isbn && !/^(\d{9}[\dXx]|\d{13})$/.test(isbn)) newErrors.isbn = 'ISBN must be 10 or 13 digits.';
        if (form.publicationYear !== '' && (!Number.isInteger(year) || year < 1000 || year > currentYear)) {
            newErrors.publicationYear = `Enter a year between 1000 and ${currentYear}.`;
        }
        if (form.coverImage && !/^https?:\/\/\S+$/i.test(form.coverImage)) {
            newErrors.coverImage = 'Enter a valid image URL starting with http:// or https://';
        }
        if (!Number.isInteger(copies) || copies < 1 || copies > 1000) {
            newErrors.totalCopies = 'Enter a whole number between 1 and 1000.';
        } else if (copies < issuedCopies) {
            newErrors.totalCopies = `Cannot be less than the ${issuedCopies} copies currently issued.`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Please choose a JPG, PNG or WEBP image.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be smaller than 2 MB.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);
        try {
            const res = await api.post('/upload', formData);
            setForm((current) => ({ ...current, coverImage: res.data.data.url }));
            setErrors((current) => ({ ...current, coverImage: '' }));
            toast.success('Cover image uploaded.');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the highlighted fields.');
            return;
        }

        setSaving(true);
        const success = await onSubmit({
            ...form,
            totalCopies: Number(form.totalCopies),
            publicationYear: form.publicationYear === '' ? null : Number(form.publicationYear),
        });
        if (!success) setSaving(false);
    };

    const inputClass = (name) => `input ${errors[name] ? 'input-error' : ''}`;
    const totalCopies = Number(form.totalCopies) || 0;

    return (
        <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="space-y-6">
                <div className="card p-5 sm:p-6">
                    <h2 className="font-semibold text-stone-900">Basic information</h2>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <Field label="Book title *" htmlFor="title" error={errors.title} className="sm:col-span-2">
                            <input id="title" name="title" value={form.title} onChange={handleChange} className={inputClass('title')} placeholder="e.g. পথের পাঁচালী" />
                        </Field>
                        <Field label="Author *" htmlFor="author" error={errors.author}>
                            <input id="author" name="author" value={form.author} onChange={handleChange} className={inputClass('author')} placeholder="Author name" />
                        </Field>
                        <Field label="Category *" htmlFor="category" error={errors.category}>
                            <select id="category" name="category" value={form.category} onChange={handleChange} className={inputClass('category')}>
                                <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                                {categories?.map((category) => (
                                    <option key={category._id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="ISBN" htmlFor="isbn" error={errors.isbn} hint="10 or 13 digits. Leave blank if unknown.">
                            <input id="isbn" name="isbn" value={form.isbn} onChange={handleChange} className={inputClass('isbn')} placeholder="978-0-00-000000-0" />
                        </Field>
                        <Field label="Language" htmlFor="language">
                            <input id="language" name="language" list="language-options" value={form.language} onChange={handleChange} className="input" placeholder="e.g. Bangla" />
                            <datalist id="language-options">
                                <option value="Bangla" />
                                <option value="English" />
                            </datalist>
                        </Field>
                    </div>
                </div>

                <div className="card p-5 sm:p-6">
                    <h2 className="font-semibold text-stone-900">Publication details</h2>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <Field label="Publisher" htmlFor="publisher" hint="Leave blank if not known.">
                            <input id="publisher" name="publisher" value={form.publisher} onChange={handleChange} className="input" placeholder="Publisher name" />
                        </Field>
                        <Field label="Publication year" htmlFor="publicationYear" error={errors.publicationYear}>
                            <input id="publicationYear" name="publicationYear" type="number" min="1000" max={currentYear} value={form.publicationYear} onChange={handleChange} className={inputClass('publicationYear')} placeholder="e.g. 2019" />
                        </Field>
                        <Field label="Description" htmlFor="description" className="sm:col-span-2">
                            <textarea id="description" name="description" rows={5} value={form.description} onChange={handleChange} className="input resize-y" placeholder="A short summary of the book" />
                        </Field>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="card p-5 sm:p-6">
                    <h2 className="font-semibold text-stone-900">Cover image</h2>
                    <div className="mt-4 rounded-xl bg-stone-100 p-5">
                        <BookCover book={form} className="mx-auto w-36 shadow-lg" />
                    </div>
                    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
                    <button type="button" onClick={() => fileInput.current.click()} disabled={uploading} className="btn btn-secondary mt-4 w-full">
                        {uploading ? <Spinner className="size-4" /> : <ImageUp className="size-4" />}
                        {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
                    </button>
                    <Field label="Or paste an image URL" htmlFor="coverImage" error={errors.coverImage} className="mt-4">
                        <input id="coverImage" name="coverImage" value={form.coverImage} onChange={handleChange} className={inputClass('coverImage')} placeholder="https://..." />
                    </Field>
                    <p className="mt-2 text-xs text-stone-500">Without an image, a cover with the title and author is shown.</p>
                </div>

                <div className="card p-5 sm:p-6">
                    <h2 className="font-semibold text-stone-900">Inventory</h2>
                    <Field label="Total copies *" htmlFor="totalCopies" error={errors.totalCopies} className="mt-4">
                        <input id="totalCopies" name="totalCopies" type="number" min={Math.max(issuedCopies, 1)} max="1000" value={form.totalCopies} onChange={handleChange} className={inputClass('totalCopies')} />
                    </Field>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
                        <div className="rounded-lg bg-stone-50 p-3">
                            <dt className="text-xs text-stone-500">Issued now</dt>
                            <dd className="mt-0.5 text-lg font-semibold text-stone-900">{issuedCopies}</dd>
                        </div>
                        <div className="rounded-lg bg-stone-50 p-3">
                            <dt className="text-xs text-stone-500">Available after save</dt>
                            <dd className="mt-0.5 text-lg font-semibold text-stone-900">{Math.max(totalCopies - issuedCopies, 0)}</dd>
                        </div>
                    </dl>
                    <p className="mt-3 text-xs text-stone-500">
                        Available copies are calculated automatically: total copies minus issued copies.
                    </p>

                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3.5 transition hover:bg-stone-50">
                        <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="mt-0.5 size-4 accent-brand-800" />
                        <span>
                            <span className="flex items-center gap-1.5 text-sm font-medium text-stone-900">
                                <Star className="size-4 text-amber-500" /> Featured book
                            </span>
                            <span className="mt-0.5 block text-xs text-stone-500">Show this book in the home page Featured section.</span>
                        </span>
                    </label>
                </div>

                <div className="flex gap-3">
                    <Link to="/admin/books" className="btn btn-secondary flex-1">
                        Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary flex-1" disabled={saving || uploading}>
                        {saving ? <Spinner className="size-4" /> : <Save className="size-4" />}
                        {saving ? 'Saving...' : submitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default BookForm;
