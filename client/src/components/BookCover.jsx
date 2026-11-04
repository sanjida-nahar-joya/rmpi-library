import { useState } from 'react';
import { getCategoryStyle } from '../utils/helpers';

// Shown when a book has no cover image or the image fails to load
const GeneratedCover = ({ book }) => {
    const { color } = getCategoryStyle(book.category);

    return (
        <div
            className="relative flex h-full w-full flex-col justify-between p-[11%] text-center text-white"
            style={{ backgroundColor: color }}
        >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[8%] bg-linear-to-r from-black/35 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute inset-[5%] rounded-[3px] border border-white/25" />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-black/20" />

            <p className="relative text-[4.4cqw] font-semibold tracking-[0.25em] text-white/70 uppercase">RMPI Library</p>

            <div className="relative">
                <p className="line-clamp-4 font-serif text-[10cqw] leading-tight font-semibold">{book.title || 'Untitled'}</p>
                <div className="mx-auto my-[7cqw] h-px w-[22%] bg-white/50" />
                <p className="line-clamp-2 text-[6cqw] leading-snug text-white/85">{book.author}</p>
            </div>

            <p className="relative line-clamp-1 text-[4.6cqw] text-white/65">{book.category}</p>
        </div>
    );
};

const BookCover = ({ book, className = '' }) => {
    const [failedUrl, setFailedUrl] = useState('');
    const showImage = book.coverImage && failedUrl !== book.coverImage;

    return (
        <div className={`@container relative aspect-[2/3] overflow-hidden rounded-md bg-stone-200 ${className}`}>
            {showImage ? (
                <img
                    src={book.coverImage}
                    alt={`Cover of ${book.title}`}
                    loading="lazy"
                    onError={() => setFailedUrl(book.coverImage)}
                    className="h-full w-full object-cover"
                />
            ) : (
                <GeneratedCover book={book} />
            )}
        </div>
    );
};

export default BookCover;
