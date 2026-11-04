import { Link } from 'react-router';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { CONTACT } from '../utils/helpers';

const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/books', label: 'Book Catalog' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
];

const Footer = () => {
    return (
        <footer className="mt-20 bg-brand-950 text-brand-100">
            <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                    <Logo light />
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200">
                        A digital library management platform that makes book discovery and inventory management easier for
                        the students and library staff of Rajshahi Mohila Polytechnic Institute.
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-white">Quick Links</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {quickLinks.map((link) => (
                            <li key={link.to}>
                                <Link to={link.to} className="text-brand-200 transition hover:text-white">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link to="/login" className="text-brand-200 transition hover:text-white">
                                Student Login
                            </Link>
                        </li>
                        <li>
                            <Link to="/register" className="text-brand-200 transition hover:text-white">
                                Create Student Account
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-white">Contact</h3>
                    <ul className="mt-4 space-y-3 text-sm text-brand-200">
                        <li className="flex gap-2.5">
                            <Phone className="mt-0.5 size-4 shrink-0" />
                            <span>{CONTACT.phone}</span>
                        </li>
                        <li className="flex gap-2.5">
                            <Mail className="mt-0.5 size-4 shrink-0" />
                            <a href={`mailto:${CONTACT.email}`} className="transition hover:text-white">
                                {CONTACT.email}
                            </a>
                        </li>
                        <li className="flex gap-2.5">
                            <MapPin className="mt-0.5 size-4 shrink-0" />
                            <span>{CONTACT.location}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="container-page flex flex-col gap-2 py-5 text-xs text-brand-300 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} RMPI Library, Rajshahi Mohila Polytechnic Institute. All rights reserved.</p>
                    <p>Book copy counts shown are sample data for demonstration.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
