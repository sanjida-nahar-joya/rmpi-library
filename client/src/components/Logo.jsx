import { Link } from 'react-router';
import { LibraryBig } from 'lucide-react';

const Logo = ({ light = false, showTagline = true, to = '/' }) => {
    return (
        <Link to={to} className="flex items-center gap-2.5" aria-label="RMPI Library home">
            <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                    light ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-brand-900 text-white'
                }`}
            >
                <LibraryBig className="size-5" />
            </span>
            <span className="leading-tight">
                <span className={`block font-serif text-lg font-semibold ${light ? 'text-white' : 'text-brand-950'}`}>
                    RMPI Library
                </span>
                {showTagline && (
                    <span className={`hidden text-[11px] sm:block ${light ? 'text-brand-200' : 'text-stone-500'}`}>
                        Rajshahi Mohila Polytechnic Institute
                    </span>
                )}
            </span>
        </Link>
    );
};

export default Logo;
