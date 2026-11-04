import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';
import toast from 'react-hot-toast';
import { BookOpenCheck, CircleAlert, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import useTitle from '../hooks/useTitle';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import PasswordInput from '../components/PasswordInput';
import { PageLoader, Spinner } from '../components/Loader';
import { isValidEmail } from '../utils/helpers';

const AdminLogin = () => {
    useTitle('Librarian Login');
    const { isAdmin, loading, loginAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    if (loading) return <PageLoader text="Checking your session..." />;
    if (isAdmin) return <Navigate to="/admin" replace />;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = {};
        if (!isValidEmail(form.email.trim())) formErrors.email = 'Please enter a valid email address.';
        if (!form.password) formErrors.password = 'Please enter your password.';
        setErrors(formErrors);
        if (Object.keys(formErrors).length) return;

        setSubmitting(true);
        try {
            const result = await loginAdmin(form.email.trim(), form.password);
            toast.success(result.message);
            navigate(location.state?.from || '/admin', { replace: true });
        } catch (err) {
            setServerError(getErrorMessage(err));
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            panelTitle="Manage the library with confidence."
            panelText="Add books, approve student requests, issue and return copies, and keep the catalog accurate."
            points={[
                { icon: BookOpenCheck, text: 'Live inventory that updates on every issue and return' },
                { icon: ShieldCheck, text: 'Protected area for authorized library staff only' },
            ]}
        >
            <div className="card p-6 shadow-sm sm:p-8">
                <h2 className="font-serif text-2xl font-semibold text-stone-900">Librarian Login</h2>
                <p className="mt-1.5 text-sm text-stone-500">Sign in to access the RMPI Library admin panel.</p>

                {searchParams.get('expired') && !serverError && (
                    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Your session has expired. Please log in again.
                    </div>
                )}

                {serverError && (
                    <div className="mt-5 flex gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        <CircleAlert className="mt-0.5 size-4 shrink-0" />
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                    <FormField id="email" label="Email address" error={errors.email}>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="username"
                            value={form.email}
                            onChange={handleChange}
                            className={`input ${errors.email ? 'input-error' : ''}`}
                            placeholder="librarian@example.com"
                        />
                    </FormField>

                    <FormField id="password" label="Password" error={errors.password}>
                        <PasswordInput id="password" name="password" value={form.password} onChange={handleChange} error={errors.password} />
                    </FormField>

                    <button type="submit" className="btn btn-primary w-full py-3" disabled={submitting}>
                        {submitting ? <Spinner className="size-4" /> : <LogIn className="size-4" />}
                        {submitting ? 'Signing in...' : 'Login'}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default AdminLogin;
