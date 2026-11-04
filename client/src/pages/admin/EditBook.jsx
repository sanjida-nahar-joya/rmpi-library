import { Link, useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeft, BookX } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BookForm from '../../components/admin/BookForm';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { PageLoader } from '../../components/Loader';

const EditBook = () => {
    useTitle('Edit Book');
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: book, loading, error, status, refetch } = useFetch(`/books/${id}`);

    const handleSubmit = async (values) => {
        try {
            const res = await api.put(`/books/${id}`, values);
            toast.success(res.data.message);
            navigate('/admin/books');
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err));
            return false;
        }
    };

    const backButton = (
        <Link to="/admin/books" className="btn btn-secondary">
            <ArrowLeft className="size-4" /> Back to books
        </Link>
    );

    if (loading) return <PageLoader text="Loading book..." />;

    if (error) {
        return (
            <div className="card">
                {status === 404 ? (
                    <EmptyState icon={BookX} title="Book not found" message="This book may have been deleted." action={backButton} />
                ) : (
                    <ErrorState message={error} onRetry={refetch} />
                )}
            </div>
        );
    }

    return (
        <>
            <AdminPageHeader title="Edit Book" description={`Editing "${book.title}"`} action={backButton} />
            <BookForm key={book._id} initialValues={book} issuedCopies={book.issuedCopies} submitLabel="Save Changes" onSubmit={handleSubmit} />
        </>
    );
};

export default EditBook;
