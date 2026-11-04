import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import api, { getErrorMessage } from '../../services/api';
import useTitle from '../../hooks/useTitle';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import BookForm from '../../components/admin/BookForm';

const AddBook = () => {
    useTitle('Add New Book');
    const navigate = useNavigate();

    const handleSubmit = async (book) => {
        try {
            const res = await api.post('/books', book);
            toast.success(res.data.message);
            navigate('/admin/books');
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err));
            return false;
        }
    };

    return (
        <>
            <AdminPageHeader
                title="Add New Book"
                description="Fields marked * are required. All copies start as available."
                action={
                    <Link to="/admin/books" className="btn btn-secondary">
                        <ArrowLeft className="size-4" /> Back to books
                    </Link>
                }
            />
            <BookForm submitLabel="Add Book" onSubmit={handleSubmit} />
        </>
    );
};

export default AddBook;
