import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ClipboardList, LayoutDashboard, LogIn, LogOut, Menu, UserPlus, UserRound, X } from 'lucide-react';
import Logo from './Logo';
import UserMenu from './UserMenu';
import { useAuth } from '../context/AuthContext';

const links = [
    { to: '/', label: 'Home' },
    { to: '/books', label: 'Books' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { user, loading, isAdmin, isStudent, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setOpen(false);
        toast.success('You have been logged out.');
        navigate('/');
    };

    const linkClass = ({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive ? 'bg-brand-50 text-brand-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
        }`;

    const mobileItemClass = 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100';

    return (
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
            <div className="container-page flex h-16 items-center justify-between gap-4">
                <Logo />

                <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    {!loading && isAdmin && (
                        <Link to="/admin" className="btn btn-primary">
                            <LayoutDashboard className="size-4" /> Dashboard
                        </Link>
                    )}
                    {!loading && isStudent && <UserMenu user={user} onLogout={handleLogout} />}
                    {!loading && !user && (
                        <>
                            <Link to="/login" className="btn btn-secondary">
                                Student Login
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Register
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="btn btn-ghost p-2 md:hidden"
                    onClick={() => setOpen(!open)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                >
                    {open ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>

            {open && (
                <nav className="border-t border-stone-200 bg-white md:hidden" aria-label="Mobile navigation">
                    <div className="container-page flex flex-col gap-1 py-3">
                        {links.map((link) => (
                            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass} onClick={() => setOpen(false)}>
                                {link.label}
                            </NavLink>
                        ))}

                        <div className="mt-2 border-t border-stone-100 pt-3">
                            {isAdmin && (
                                <Link to="/admin" className="btn btn-primary w-full" onClick={() => setOpen(false)}>
                                    <LayoutDashboard className="size-4" /> Dashboard
                                </Link>
                            )}

                            {isStudent && (
                                <div className="space-y-1">
                                    <div className="px-3 pb-2">
                                        <p className="text-sm font-semibold text-stone-900">{user.name}</p>
                                        <p className="text-xs text-stone-500">{user.email}</p>
                                    </div>
                                    <Link to="/profile" className={mobileItemClass} onClick={() => setOpen(false)}>
                                        <UserRound className="size-4" /> Profile
                                    </Link>
                                    <Link to="/my-requests" className={mobileItemClass} onClick={() => setOpen(false)}>
                                        <ClipboardList className="size-4" /> My Requests
                                    </Link>
                                    <button type="button" onClick={handleLogout} className={`${mobileItemClass} w-full text-red-600 hover:bg-red-50`}>
                                        <LogOut className="size-4" /> Logout
                                    </button>
                                </div>
                            )}

                            {!user && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link to="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>
                                        <LogIn className="size-4" /> Student Login
                                    </Link>
                                    <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                                        <UserPlus className="size-4" /> Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Navbar;
