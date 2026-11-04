import { Link, useNavigate } from 'react-router';
import {
    ArrowRight,
    BookCopy,
    BookOpenCheck,
    GraduationCap,
    Layers,
    Library,
    LibraryBig,
    RefreshCw,
    Search,
    Sparkles,
} from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useTitle from '../hooks/useTitle';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import BookCard from '../components/BookCard';
import BookCover from '../components/BookCover';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { BookGridSkeleton } from '../components/Loader';
import { formatNumber, getCategoryStyle } from '../utils/helpers';

const suggestions = ['Himu', 'Raymond Murphy', 'রবীন্দ্রনাথ', 'মুক্তিযুদ্ধ'];

const benefits = [
    {
        icon: Search,
        title: 'Easy Book Discovery',
        text: 'Search the whole collection by title, author, ISBN or category and find the right book in seconds.',
    },
    {
        icon: Layers,
        title: 'Organized Book Collection',
        text: 'Every book is sorted into clear subject categories, from Bangla literature to science and technology.',
    },
    {
        icon: RefreshCw,
        title: 'Real-Time Availability',
        text: 'Copy counts update as soon as a book is issued or returned, so you can check before you visit.',
    },
    {
        icon: GraduationCap,
        title: 'Student-Friendly Access',
        text: 'Browse freely from any phone or computer, and create a student account to request books online.',
    },
];

const HeroVisual = ({ books, loading, availableCopies }) => {
    const picks = (books || []).slice(0, 3);
    const positions = [
        'w-[36%] -rotate-[7deg] translate-x-[18%] translate-y-[6%]',
        'z-10 w-[42%]',
        'w-[36%] rotate-[7deg] -translate-x-[18%] translate-y-[6%]',
    ];

    return (
        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-brand-900">
                <div className="absolute -top-24 -right-16 size-72 rounded-full bg-brand-700/40 blur-3xl" />
                <div className="absolute -bottom-24 -left-16 size-72 rounded-full bg-brand-500/20 blur-3xl" />
            </div>

            <div className="relative flex min-h-[340px] items-end justify-center px-6 pt-12 pb-16 sm:min-h-[400px]">
                {loading &&
                    positions.map((position, index) => (
                        <div key={index} className={`${position} aspect-[2/3] shrink-0 animate-pulse rounded-md bg-white/10`} />
                    ))}

                {!loading && picks.length === 0 && (
                    <div className="mb-10 flex flex-col items-center text-center text-brand-100">
                        <LibraryBig className="size-16 text-brand-300" />
                        <p className="mt-3 font-serif text-xl text-white">Your library, online</p>
                    </div>
                )}

                {!loading &&
                    picks.map((book, index) => (
                        <Link
                            key={book._id}
                            to={`/books/${book._id}`}
                            className={`${positions[index]} shrink-0 transition duration-300 hover:-translate-y-3`}
                            aria-label={book.title}
                        >
                            <BookCover book={book} className="shadow-2xl shadow-black/50 ring-1 ring-white/10" />
                        </Link>
                    ))}

                <div className="absolute inset-x-8 bottom-12 h-2 rounded-full bg-black/30 blur-[2px]" />
            </div>

            {availableCopies !== undefined && (
                <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-lg sm:-left-6">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <BookOpenCheck className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs text-stone-500">On the shelf right now</p>
                        <p className="text-sm font-semibold text-stone-900">{formatNumber(availableCopies)} copies available</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatsSection = ({ data: stats, loading, error, refetch }) => {
    if (error) {
        return (
            <div className="card">
                <ErrorState message={error} onRetry={refetch} compact />
            </div>
        );
    }

    const items = stats
        ? [
              { label: 'Total Books', value: stats.totalTitles, caption: `${formatNumber(stats.totalCopies)} copies in total`, icon: Library },
              { label: 'Available Books', value: stats.availableCopies, caption: 'copies on the shelf', icon: BookOpenCheck },
              { label: 'Currently Issued', value: stats.issuedCopies, caption: 'copies borrowed by students', icon: BookCopy },
              { label: 'Total Categories', value: stats.totalCategories, caption: 'subject areas', icon: Layers },
          ]
        : [];

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {loading &&
                Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="card h-[132px] animate-pulse bg-stone-50" />
                ))}
            {!loading &&
                items.map((item) => (
                    <div key={item.label} className="card p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-stone-600">{item.label}</p>
                            <span className="hidden size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:flex">
                                <item.icon className="size-[18px]" />
                            </span>
                        </div>
                        <p className="mt-2 text-3xl font-semibold text-stone-900 sm:text-4xl">{formatNumber(item.value)}</p>
                        <p className="mt-1 text-xs text-stone-500 sm:text-sm">{item.caption}</p>
                    </div>
                ))}
        </div>
    );
};

const BookSection = ({ data, loading, error, refetch, count, emptyText }) => {
    if (loading) return <BookGridSkeleton count={count} />;
    if (error) return <ErrorState message={error} onRetry={refetch} />;
    if (!data?.books.length) return <EmptyState title="No books yet" message={emptyText} />;

    return (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {data.books.map((book) => (
                <BookCard key={book._id} book={book} />
            ))}
        </div>
    );
};

const Home = () => {
    useTitle('');
    const navigate = useNavigate();
    const featured = useFetch('/books?featured=true&limit=8');
    const recent = useFetch('/books?sort=newest&limit=4');
    const stats = useFetch('/dashboard/stats');
    const categories = useFetch('/categories');

    const handleSearch = (text) => {
        navigate(text ? `/books?search=${encodeURIComponent(text)}` : '/books');
    };

    return (
        <>
            <section className="border-b border-stone-200 bg-linear-to-b from-white via-white to-paper">
                <div className="container-page grid items-center gap-14 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-24">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                            <Sparkles className="size-3.5" /> Rajshahi Mohila Polytechnic Institute Library
                        </p>
                        <h1 className="mt-6 font-serif text-4xl leading-[1.08] font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.6rem]">
                            Discover Knowledge, <span className="text-brand-700">Explore New Worlds.</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
                            Explore the RMPI Library collection and discover books that inspire learning, creativity, and
                            knowledge.
                        </p>

                        <div className="mt-8 max-w-xl">
                            <SearchBar large onSearch={handleSearch} />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-stone-500">Try:</span>
                            {suggestions.map((text) => (
                                <button
                                    key={text}
                                    type="button"
                                    onClick={() => handleSearch(text)}
                                    className="rounded-full border border-stone-200 bg-white px-3 py-1 text-stone-600 transition hover:border-brand-300 hover:text-brand-700"
                                >
                                    {text}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/books" className="btn btn-primary px-5 py-3">
                                Browse Books <ArrowRight className="size-4" />
                            </Link>
                            <Link to="/categories" className="btn btn-secondary px-5 py-3">
                                View Categories
                            </Link>
                        </div>
                    </div>

                    <HeroVisual
                        books={featured.data?.books}
                        loading={featured.loading}
                        availableCopies={stats.data?.availableCopies}
                    />
                </div>
            </section>

            <section className="container-page pt-14">
                <StatsSection {...stats} />
            </section>

            <section className="container-page pt-20">
                <SectionHeader
                    eyebrow="Featured collection"
                    title="Featured Books"
                    description="Selected titles from our shelves, from Bangla classics to essential study guides."
                    action={
                        <Link to="/books" className="btn btn-secondary">
                            View all books <ArrowRight className="size-4" />
                        </Link>
                    }
                />
                <BookSection {...featured} count={8} emptyText="Featured books will appear here." />
            </section>

            <section className="mt-20 border-y border-stone-200 bg-white py-16">
                <div className="container-page">
                    <SectionHeader
                        eyebrow="Browse by subject"
                        title="Browse Categories"
                        description="Find books faster by exploring the subject you are interested in."
                        action={
                            <Link to="/categories" className="btn btn-secondary">
                                All categories <ArrowRight className="size-4" />
                            </Link>
                        }
                    />
                    {categories.error && <ErrorState message={categories.error} onRetry={categories.refetch} compact />}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {categories.loading &&
                            Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="h-20 animate-pulse rounded-2xl bg-stone-100" />
                            ))}
                        {categories.data?.map((category) => {
                            const { color, icon: Icon } = getCategoryStyle(category.name);
                            return (
                                <Link
                                    key={category._id}
                                    to={`/books?category=${encodeURIComponent(category.name)}`}
                                    className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
                                >
                                    <span
                                        className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white"
                                        style={{ backgroundColor: color }}
                                    >
                                        <Icon className="size-6" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-semibold text-stone-900">{category.name}</span>
                                        <span className="text-sm text-stone-500">
                                            {category.bookCount} {category.bookCount === 1 ? 'book' : 'books'}
                                        </span>
                                    </span>
                                    <ArrowRight className="size-4 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="container-page pt-20">
                <SectionHeader
                    eyebrow="Why RMPI Library?"
                    title="A simpler way to use your library"
                    description="Built for students who want to find books quickly and for staff who keep the collection in order."
                />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit) => (
                        <div key={benefit.title} className="card p-6">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-900 text-white">
                                <benefit.icon className="size-5" />
                            </span>
                            <h3 className="mt-5 font-semibold text-stone-900">{benefit.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-stone-600">{benefit.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container-page pt-20">
                <SectionHeader
                    eyebrow="New on the shelf"
                    title="Recently Added Books"
                    description="The latest additions to the RMPI Library catalog."
                    action={
                        <Link to="/books?sort=newest" className="btn btn-secondary">
                            See more <ArrowRight className="size-4" />
                        </Link>
                    }
                />
                <BookSection {...recent} count={4} emptyText="Newly added books will appear here." />
            </section>

            <section className="container-page pt-20">
                <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-900 px-6 py-10 sm:px-10 md:flex-row md:items-center">
                    <div>
                        <h2 className="font-serif text-2xl font-semibold text-white sm:text-3xl">Looking for a specific book?</h2>
                        <p className="mt-2 max-w-xl text-brand-200">
                            Search the full catalog to check availability, or send a message to the library.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/books" className="btn bg-white px-5 py-3 text-brand-900 hover:bg-brand-50">
                            Search Catalog
                        </Link>
                        <Link to="/contact" className="btn border border-white/30 px-5 py-3 text-white hover:bg-white/10">
                            Contact Library
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
