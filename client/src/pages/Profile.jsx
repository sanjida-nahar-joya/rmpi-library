import { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { ClipboardList, Save } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import useTitle from '../hooks/useTitle';
import PageHeader from '../components/PageHeader';
import StudentFields from '../components/StudentFields';
import { Spinner } from '../components/Loader';
import { formatLocalDate, validateStudentForm } from '../utils/helpers';

const Profile = () => {
    useTitle('My Profile');
    const { user, setUser } = useAuth();
    const { data: options } = useFetch('/students/options');

    const [form, setForm] = useState({
        name: user.name,
        roll: user.roll,
        phone: user.phone,
        department: user.department,
        semester: user.semester,
        shift: user.shift,
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateStudentForm(form);
        setErrors(formErrors);
        if (Object.keys(formErrors).length) return;

        setSaving(true);
        try {
            const res = await api.put('/students/me', form);
            setUser({ ...user, ...res.data.data });
            setForm({ ...form, roll: res.data.data.roll, phone: res.data.data.phone });
            toast.success(res.data.message);
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const details = [
        { label: 'Roll', value: user.roll },
        { label: 'Department', value: user.department },
        { label: 'Semester', value: `${user.semester} semester` },
        { label: 'Shift', value: `${user.shift} shift` },
        { label: 'Phone', value: user.phone },
        { label: 'Member since', value: formatLocalDate(user.createdAt) },
    ];

    return (
        <>
            <PageHeader eyebrow="My account" title="My Profile" description="Your student details are attached to every book request you make." />

            <section className="container-page py-10">
                <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <div className="card self-start p-6">
                        <div className="text-center">
                            <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-800 text-3xl font-semibold text-white">
                                {user.name?.charAt(0).toUpperCase()}
                            </span>
                            <h2 className="mt-4 text-lg font-semibold text-stone-900">{user.name}</h2>
                            <p className="text-sm break-words text-stone-500">{user.email}</p>
                            <span className="mt-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">Student</span>
                        </div>
                        <dl className="mt-6 divide-y divide-stone-100 border-t border-stone-100 text-sm">
                            {details.map((item) => (
                                <div key={item.label} className="flex justify-between gap-4 py-2.5">
                                    <dt className="text-stone-500">{item.label}</dt>
                                    <dd className="text-right font-medium text-stone-900">{item.value}</dd>
                                </div>
                            ))}
                        </dl>
                        <Link to="/my-requests" className="btn btn-secondary mt-5 w-full">
                            <ClipboardList className="size-4" /> My Requests
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8">
                        <h2 className="text-lg font-semibold text-stone-900">Edit details</h2>
                        <p className="mt-1 text-sm text-stone-500">Keep your semester and phone number up to date. Your email cannot be changed.</p>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="label">
                                    Email
                                </label>
                                <input id="email" value={user.email} disabled className="input" />
                            </div>
                            <StudentFields values={form} errors={errors} onChange={handleChange} options={options} />
                        </div>

                        <button type="submit" className="btn btn-primary mt-6" disabled={saving}>
                            {saving ? <Spinner className="size-4" /> : <Save className="size-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
};

export default Profile;
