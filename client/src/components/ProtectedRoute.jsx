import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Loader';

// role is "admin" for the admin panel or "student" for student pages
const ProtectedRoute = ({ role, children }) => {
    const { loading, isAdmin, isStudent } = useAuth();
    const location = useLocation();

    if (loading) return <PageLoader text="Checking your session..." />;

    const allowed = role === 'admin' ? isAdmin : isStudent;
    if (!allowed) {
        return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default ProtectedRoute;
