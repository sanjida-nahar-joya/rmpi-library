import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { BookOpenCheck, CircleAlert, ClipboardList, UserPlus, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import useFetch from '../hooks/useFetch';
import useTitle from '../hooks/useTitle';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import StudentFields from '../components/StudentFields';
import { PageLoader, Spinner } from '../components/Loader';
import { isValidEmail, validateStudentForm } from '../utils/helpers';

const emptyForm = {
    name: '',
    roll: '',
    phone: '',
    department: '',
    semester: '',
    shift: '',
    email: '',
    password: '',
    confirmPassword: '',
};

const Register = () => {
    useTitle('Create Account');
    const { isStudent, loading, register } = useAuth();
    const { data: options } = useFetch('/students/options');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/books';

    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    if (loading) return <PageLoader text="Checking your session..." />;
    if (isStudent) return <Navigate to={from} replace />;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateStudentForm(form);
        if (!isValidEmail(form.email.trim())) formErrors.email = 'Please enter a valid email address.';
        if (form.password.length < 6) formErrors.password = 'Password must be at least 6 characters.';
        if (form.confirmPassword !== form.password) formErrors.confirmPassword = 'Passwords do not match.';
        setErrors(formErrors);
        if (Object.keys(formErrors).length) return;

        setSubmitting(true);
        try {
            const { confirmPassword, ...values } = form;
            const result = await register(values);
            toast.success(result.message);
            navigate(from, { replace: true });
        } catch (err) {
            setServerError(getErrorMessage(err));
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            wide
            panelTitle="Join RMPI Library."
            panelText="Create your student account to request books online. You will be logged in right after registering."
            points={[
                { icon: BookOpenCheck, text: 'Request available books from the catalog' },
                { icon: ClipboardList, text: 'See approval status and due dates' },
                { icon: Zap, text: 'No email verification needed' },
            ]}
        >
            <div className="card p-6 shadow-sm sm:p-8">
                <h2 className="font-serif text-2xl font-semibold text-stone-900">Create student account</h2>
                <p className="mt-1.5 text-sm text-stone-500">
                    Already registered?{' '}
                    <Link to="/login" state={location.state} className="font-semibold text-brand-700 hover:underline">
                        Log in
                    </Link>
                </p>

                {serverError && (
                    <div className="mt-5 flex gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2" noValidate>
                    <p className="text-sm font-semibold text-stone-900 sm:col-span-2">Student details</p>
                    <StudentFields values={form} errors={errors} onChange={handleChange} options={options} />

                    <p className="border-t border-stone-100 pt-5 text-sm font-semibold text-stone-900 sm:col-span-2">Login details</p>
                    <FormField id="email" label="Email *" error={errors.email} className="sm:col-span-2">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            className={`input ${errors.email ? 'input-error' : ''}`}
                            placeholder="you@example.com"
                        />
                    </FormField>
                    <FormField id="password" label="Password *" error={errors.password} hint="At least 6 characters.">
                        <PasswordInput
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Create a password"
                            autoComplete="new-password"
                        />
                    </FormField>
                    <FormField id="confirmPassword" label="Confirm password *" error={errors.confirmPassword}>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="Type it again"
                            autoComplete="new-password"
                        />
                    </FormField>

                    <button type="submit" className="btn btn-primary py-3 sm:col-span-2" disabled={submitting}>
                        {submitting ? <Spinner className="size-4" /> : <UserPlus className="size-4" />}
                        {submitting ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default Register;
