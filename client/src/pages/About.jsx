import { Link } from 'react-router';
import { ArrowRight, BookOpenCheck, ClipboardList, Database, Info, Search, Target } from 'lucide-react';
import useTitle from '../hooks/useTitle';
import PageHeader from '../components/PageHeader';

const objectives = [
    'Keep the whole book collection in one organized, searchable catalog.',
    'Show accurate, up-to-date availability for every book.',
    'Let students request books online and follow the status of their requests.',
    'Record every book issue and return with student details and due dates.',
    'Give library staff a clear overview of stock, issued books and overdue returns.',
    'Make the library easier to use for students on any device.',
];

const features = [
    {
        icon: Search,
        title: 'Digital Book Discovery',
        text: 'Students can search by title, author, ISBN or category and open a details page for any book, all from a phone or computer.',
    },
    {
        icon: Database,
        title: 'Organized Inventory',
        text: 'Each book keeps its total, available and issued copy counts, and the numbers always add up because they change only through issue and return.',
    },
    {
        icon: BookOpenCheck,
        title: 'Easier Availability Checking',
        text: 'Clear green, amber and red badges show whether a book is available, running low or fully issued before anyone visits the library.',
    },
    {
        icon: ClipboardList,
        title: 'Issue & Return Records',
        text: 'Librarians issue and return books from the admin panel. Every transaction is saved, and overdue books are highlighted automatically.',
    },
];

const steps = [
    { title: 'Search the catalog', text: 'Find a book by its title, author, ISBN or category and check its availability.' },
    { title: 'Send a request', text: 'Log in with your student account and request an available book.' },
    { title: 'Collect from the desk', text: 'Once the librarian approves your request, collect the book before the due date.' },
];

const About = () => {
    useTitle('About');

    return (
        <>
            <PageHeader eyebrow="About" title="About RMPI Library" />

            <section className="container-page py-12">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
                    <div>
                        <p className="font-serif text-2xl leading-relaxed text-stone-800 sm:text-[1.7rem]">
                            RMPI Library is a digital library management platform designed to make book discovery and library
                            inventory management easier for students and library staff of Rajshahi Mohila Polytechnic Institute.
                        </p>

                        <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold text-stone-900">
                            <Target className="size-5 text-brand-700" /> Project purpose
                        </h2>
                        <p className="mt-3 leading-relaxed text-stone-700">
                            The purpose of this project is to bring the library's book collection online in a form that is simple
                            to search and simple to maintain. Students get a quick way to see what the library holds and whether a
                            book is on the shelf. Library staff get one place to add books, update copy counts and keep track of
                            which student has which book.
                        </p>

                        <h2 className="mt-10 text-lg font-semibold text-stone-900">Library management objectives</h2>
                        <ul className="mt-4 space-y-3">
                            {objectives.map((objective) => (
                                <li key={objective} className="flex gap-3 text-stone-700">
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-600" />
                                    {objective}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-5">
                        <div className="card p-6">
                            <h2 className="font-semibold text-stone-900">How it works</h2>
                            <ol className="mt-5 space-y-5">
                                {steps.map((step, index) => (
                                    <li key={step.title} className="flex gap-4">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-stone-900">{step.title}</p>
                                            <p className="mt-0.5 text-sm text-stone-600">{step.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                            <Info className="mt-0.5 size-5 shrink-0" />
                            <div>
                                <p className="font-semibold">About the current data</p>
                                <p className="mt-1 leading-relaxed">
                                    The copy counts, availability and issue records currently shown are sample demonstration data.
                                    They must be checked against the actual library stock before the system is used for daily
                                    operations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-stone-200 bg-white py-16">
                <div className="container-page">
                    <h2 className="font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">What the platform offers</h2>
                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex gap-4 rounded-2xl border border-stone-200 p-6">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                    <feature.icon className="size-5" />
                                </span>
                                <div>
                                    <h3 className="font-semibold text-stone-900">{feature.title}</h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{feature.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container-page pt-14 text-center">
                <h2 className="font-serif text-2xl font-semibold text-stone-900">Start exploring the collection</h2>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link to="/books" className="btn btn-primary px-5 py-3">
                        Browse Books <ArrowRight className="size-4" />
                    </Link>
                    <Link to="/contact" className="btn btn-secondary px-5 py-3">
                        Contact Us
                    </Link>
                </div>
            </section>
        </>
    );
};

export default About;
