import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';

// Two-column layout shared by the login and register pages
const AuthLayout = ({ panelTitle, panelText, points = [], wide = false, children }) => {
    return (
        <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="relative hidden overflow-hidden bg-brand-950 p-12 lg:flex lg:flex-col lg:justify-between">
                <div className="absolute -top-32 -right-32 size-96 rounded-full bg-brand-700/30 blur-3xl" />
                <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-brand-500/20 blur-3xl" />
                <div className="relative">
                    <Logo light />
                </div>
                <div className="relative max-w-md">
                    <h1 className="font-serif text-4xl leading-tight font-semibold text-white">{panelTitle}</h1>
                    <p className="mt-4 text-brand-200">{panelText}</p>
                    <ul className="mt-8 space-y-3 text-sm text-brand-100">
                        {points.map((point) => (
                            <li key={point.text} className="flex items-center gap-3">
                                <point.icon className="size-5 shrink-0 text-brand-300" />
                                {point.text}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="relative text-xs text-brand-400">Rajshahi Mohila Polytechnic Institute Library</p>
            </div>

            <div className="flex flex-col justify-center bg-paper px-4 py-12 sm:px-8">
                <div className={`mx-auto w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}>
                    <div className="mb-8 lg:hidden">
                        <Logo />
                    </div>
                    {children}
                    <Link to="/" className="btn btn-ghost mt-6 -ml-3">
                        <ArrowLeft className="size-4" /> Back to website
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
