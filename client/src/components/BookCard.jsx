import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import BookCover from './BookCover';
import AvailabilityBadge from './AvailabilityBadge';

const BookCard = ({ book }) => {
    const detailsLink = `/books/${book._id}`;

    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-900/5">
            <Link
                to={detailsLink}
                className="block bg-linear-to-b from-stone-100 to-stone-50 px-6 pt-6 pb-5"
                tabIndex={-1}
                aria-hidden="true"
            >
                <BookCover
                    book={book}
                    className="mx-auto w-full max-w-[170px] shadow-[0_10px_24px_-8px_rgba(28,25,23,0.45)] transition duration-300 group-hover:scale-[1.03]"
                />
            </Link>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="line-clamp-1 text-xs font-medium text-brand-600">{book.category}</p>
                <h3 className="mt-1.5 line-clamp-2 font-serif text-[17px] leading-snug font-semibold text-stone-900">
                    <Link to={detailsLink} className="hover:text-brand-700">
                        {book.title}
                    </Link>
                </h3>
                <p className="mt-1 line-clamp-1 text-sm text-stone-600">{book.author}</p>
                {book.isbn && <p className="mt-1 text-xs text-stone-500">ISBN {book.isbn}</p>}

                <div className="mt-auto pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
                        <AvailabilityBadge availability={book.availability} />
                        <span className="text-xs text-stone-500">
                            {book.availableCopies} of {book.totalCopies} available
                        </span>
                    </div>
                    <Link to={detailsLink} className="btn btn-secondary mt-4 w-full">
                        View Details <ArrowRight className="size-4" />
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default BookCard;
