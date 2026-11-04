import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import {
    ArrowLeftRight,
    BookPlus,
    ExternalLink,
    History,
    Inbox,
    LayoutDashboard,
    Library,
    LogOut,
    Mail,
    Menu,
    Tags,
    Users,
    X,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const menu = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/books', label: 'Manage Books', icon: Library, end: true },
    { to: '/admin/books/new', label: 'Add New Book', icon: BookPlus, end: true },
    { to: '/admin/requests', label: 'Book Requests', icon: Inbox },
    { to: '/admin/issues', label: 'Issue & Return', icon: ArrowLeftRight },
    { to: '/admin/transactions', label: 'Transactions', icon: History },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/messages', label: 'Contact Messages', icon: Mail },
];

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user: admin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('You have been logged out.');
        navigate('/admin/login');
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive ? 'bg-white/10 text-white' : 'text-brand-200 hover:bg-white/5 hover:text-white'
        }`;

    return (
        <div className="min-h-screen bg-stone-100/70">
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-stone-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-950 transition-transform duration-200 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
                    <Logo light showTagline={false} to="/admin" />
                    <button
                        type="button"
                        className="rounded-md p-1.5 text-brand-200 hover:bg-white/10 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
                    <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-brand-400 uppercase">Library</p>
                    {menu.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={linkClass}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon className="size-[18px]" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-3">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-200 transition hover:bg-white/5 hover:text-white"
                    >
                        <LogOut className="size-[18px]" />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-stone-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="btn btn-ghost -ml-2 p-2 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="size-6" />
                    </button>
                    <Link to="/" className="hidden items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-brand-700 sm:flex">
                        <ExternalLink className="size-4" /> View website
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="text-right leading-tight">
                            <p className="text-sm font-semibold text-stone-900">{admin?.name}</p>
                            <p className="text-xs text-stone-500 capitalize">{admin?.role}</p>
                        </div>
                        <span className="flex size-9 items-center justify-center rounded-full bg-brand-800 text-sm font-semibold text-white">
                            {admin?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
