import { Navigate, Route, Routes } from 'react-router';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import StudentLogin from './pages/StudentLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyRequests from './pages/MyRequests';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';

import Dashboard from './pages/admin/Dashboard';
import ManageBooks from './pages/admin/ManageBooks';
import AddBook from './pages/admin/AddBook';
import EditBook from './pages/admin/EditBook';
import BookRequests from './pages/admin/BookRequests';
import IssueReturn from './pages/admin/IssueReturn';
import Transactions from './pages/admin/Transactions';
import Students from './pages/admin/Students';
import AdminCategories from './pages/admin/AdminCategories';
import Messages from './pages/admin/Messages';

const App = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/books/:id" element={<BookDetails />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute role="student">
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-requests"
                        element={
                            <ProtectedRoute role="student">
                                <MyRequests />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Route>

                <Route path="/login" element={<StudentLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="books" element={<ManageBooks />} />
                    <Route path="books/new" element={<AddBook />} />
                    <Route path="books/:id/edit" element={<EditBook />} />
                    <Route path="requests" element={<BookRequests />} />
                    <Route path="issues" element={<IssueReturn />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="students" element={<Students />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
            </Routes>
        </>
    );
};

export default App;
