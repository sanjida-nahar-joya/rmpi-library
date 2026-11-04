import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, ClipboardList, LogOut, UserRound } from 'lucide-react';

// Profile button with a dropdown for logged in students
const UserMenu = ({ user, onLogout }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Close the menu when clicking outside it or pressing Escape
    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    const itemClass = 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-100';

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pr-3 pl-1 shadow-xs transition hover:border-stone-300"
            >
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-800 text-sm font-semibold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate text-sm font-medium text-stone-800">{user.name?.split(' ')[0]}</span>
                <ChevronDown className={`size-4 text-stone-500 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
                    <div className="border-b border-stone-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-stone-900">{user.name}</p>
                        <p className="truncate text-xs text-stone-500">{user.email}</p>
                        <p className="mt-1 truncate text-xs text-stone-500">
                            Roll {user.roll} · {user.department}
                        </p>
                    </div>
                    <div className="p-1.5">
                        <Link role="menuitem" to="/profile" onClick={() => setOpen(false)} className={itemClass}>
                            <UserRound className="size-4" /> Profile
                        </Link>
                        <Link role="menuitem" to="/my-requests" onClick={() => setOpen(false)} className={itemClass}>
                            <ClipboardList className="size-4" /> My Requests
                        </Link>
                    </div>
                    <div className="border-t border-stone-100 p-1.5">
                        <button
                            role="menuitem"
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                onLogout();
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                        >
                            <LogOut className="size-4" /> Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
