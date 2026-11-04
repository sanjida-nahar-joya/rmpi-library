import { useState } from 'react';
import toast from 'react-hot-toast';
import { CircleCheck, Mail, MapPin, Phone, Send } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import useTitle from '../hooks/useTitle';
import PageHeader from '../components/PageHeader';
import { Spinner } from '../components/Loader';
import { CONTACT, isValidEmail } from '../utils/helpers';

const emptyForm = { name: '', email: '', subject: '', message: '' };

const validate = (form) => {
    const errors = {};
    if (form.name.trim().length < 2) errors.name = 'Please enter your full name.';
    if (!isValidEmail(form.email.trim())) errors.email = 'Please enter a valid email address.';
    if (form.subject.trim().length < 3) errors.subject = 'Subject must be at least 3 characters.';
    if (form.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
    if (form.message.length > 2000) errors.message = 'Message must be under 2000 characters.';
    return errors;
};

const Contact = () => {
    useTitle('Contact');
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validate(form);
        setErrors(formErrors);
        if (Object.keys(formErrors).length) return;

        setSending(true);
        try {
            const res = await api.post('/contact', form);
            toast.success(res.data.message);
            setForm(emptyForm);
            setSent(true);
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSending(false);
        }
    };

    const infoCards = [
        { icon: Phone, label: 'Phone', value: CONTACT.phone },
        { icon: Mail, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
        { icon: MapPin, label: 'Location', value: CONTACT.location },
    ];

    const inputClass = (name) => `input ${errors[name] ? 'input-error' : ''}`;

    return (
        <>
            <PageHeader
                eyebrow="Contact"
                title="Get in Touch"
                description="Have a question about a book or the library? Send us a message and the library team will get back to you."
            />

            <section className="container-page py-10">
                <div className="grid gap-4 sm:grid-cols-3">
                    {infoCards.map((card) => (
                        <div key={card.label} className="card flex items-start gap-4 p-5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                                <card.icon className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm text-stone-500">{card.label}</p>
                                {card.href ? (
                                    <a href={card.href} className="font-semibold break-words text-brand-800 hover:underline">
                                        {card.value}
                                    </a>
                                ) : (
                                    <p className="font-semibold break-words text-stone-900">{card.value}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                    <div className="card p-6 sm:p-8">
                        {sent ? (
                            <div className="flex flex-col items-center py-10 text-center">
                                <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                    <CircleCheck className="size-7" />
                                </span>
                                <h2 className="mt-4 text-xl font-semibold text-stone-900">Message sent</h2>
                                <p className="mt-2 max-w-sm text-sm text-stone-600">
                                    Thank you for contacting RMPI Library. Your message has been received.
                                </p>
                                <button type="button" className="btn btn-secondary mt-6" onClick={() => setSent(false)}>
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate>
                                <h2 className="text-xl font-semibold text-stone-900">Send a message</h2>
                                <p className="mt-1 text-sm text-stone-500">All fields are required.</p>

                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="label">
                                            Full Name
                                        </label>
                                        <input id="name" name="name" value={form.name} onChange={handleChange} className={inputClass('name')} placeholder="Your full name" />
                                        {errors.name && <p className="field-error">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="label">
                                            Email
                                        </label>
                                        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass('email')} placeholder="you@example.com" />
                                        {errors.email && <p className="field-error">{errors.email}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="subject" className="label">
                                            Subject
                                        </label>
                                        <input id="subject" name="subject" value={form.subject} onChange={handleChange} className={inputClass('subject')} placeholder="What is your message about?" />
                                        {errors.subject && <p className="field-error">{errors.subject}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="message" className="label">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={6}
                                            value={form.message}
                                            onChange={handleChange}
                                            className={`${inputClass('message')} resize-y`}
                                            placeholder="Write your message here..."
                                        />
                                        <div className="mt-1.5 flex justify-between gap-4">
                                            <p className="field-error mt-0">{errors.message}</p>
                                            <p className="text-xs text-stone-400">{form.message.length}/2000</p>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto" disabled={sending}>
                                    {sending ? <Spinner className="size-4" /> : <Send className="size-4" />}
                                    {sending ? 'Sending...' : 'Submit Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="card overflow-hidden">
                        <div className="flex h-40 items-center justify-center bg-linear-to-br from-brand-900 to-brand-700">
                            <MapPin className="size-12 text-white/80" />
                        </div>
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-stone-900">Our location</h2>
                            <p className="mt-2 font-medium text-stone-800">Rajshahi Mohila Polytechnic Institute Library</p>
                            <p className="mt-1 text-stone-600">{CONTACT.location}</p>
                            <p className="mt-4 text-sm text-stone-500">
                                For questions about a specific book, include its title or ISBN in your message.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Contact;
