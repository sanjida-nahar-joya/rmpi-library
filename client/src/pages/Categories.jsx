import { Link } from 'react-router';
import { ArrowRight, FolderOpen } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useTitle from '../hooks/useTitle';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { getCategoryStyle } from '../utils/helpers';

const Categories = () => {
    useTitle('Categories');
    const { data: categories, loading, error, refetch } = useFetch('/categories');

    return (
        <>
            <PageHeader
                eyebrow="Categories"
                title="Browse by Category"
                description="Every book in the library belongs to a subject category. Choose one to see its books and their availability."
            />

            <section className="container-page py-10">
                {error && (
                    <div className="card">
                        <ErrorState message={error} onRetry={refetch} />
                    </div>
                )}

                {!error && !loading && categories?.length === 0 && (
                    <div className="card">
                        <EmptyState icon={FolderOpen} title="No categories yet" message="Categories will appear here once added." />
                    </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {loading &&
                        Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="card h-48 animate-pulse bg-stone-50" />
                        ))}

                    {categories?.map((category) => {
                        const { color, icon: Icon } = getCategoryStyle(category.name);
                        return (
                            <Link
                                key={category._id}
                                to={`/books?category=${encodeURIComponent(category.name)}`}
                                className="group card flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/5"
                            >
                                <div className="h-1.5" style={{ backgroundColor: color }} />
                                <div className="flex flex-1 flex-col p-6">
                                    <span
                                        className="flex size-12 items-center justify-center rounded-xl text-white"
                                        style={{ backgroundColor: color }}
                                    >
                                        <Icon className="size-6" />
                                    </span>
                                    <h2 className="mt-5 text-lg font-semibold text-stone-900">{category.name}</h2>
                                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-stone-600">
                                        {category.description || 'Browse the books in this category.'}
                                    </p>
                                    <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
                                        <span className="text-stone-600">
                                            <span className="font-semibold text-stone-900">{category.bookCount}</span>{' '}
                                            {category.bookCount === 1 ? 'book' : 'books'} ·{' '}
                                            <span className="font-semibold text-stone-900">{category.availableCopies}</span> copies
                                            available
                                        </span>
                                        <ArrowRight className="size-4 text-stone-400 transition group-hover:translate-x-1 group-hover:text-brand-700" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </>
    );
};

export default Categories;
