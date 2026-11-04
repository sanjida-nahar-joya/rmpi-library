import { Link } from 'react-router';
import { BookX } from 'lucide-react';
import useTitle from '../hooks/useTitle';

const NotFound = () => {
    useTitle('Page Not Found');

    return (
        <section className="container-page flex flex-col items-center py-24 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <BookX className="size-8" />
            </span>
            <p className="eyebrow mt-6">Error 404</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">This page is not on our shelves</h1>
            <p className="mt-3 max-w-md text-stone-600">The page you are looking for does not exist or may have been moved.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/" className="btn btn-primary">
                    Go to Home
                </Link>
                <Link to="/books" className="btn btn-secondary">
                    Browse Books
                </Link>
            </div>
        </section>
    );
};

export default NotFound;
