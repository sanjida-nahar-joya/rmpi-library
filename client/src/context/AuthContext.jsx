import { createContext, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

// One login at a time: either a librarian (admin) or a student
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

    useEffect(() => {
        if (!localStorage.getItem(TOKEN_KEY)) return;

        api.get('/auth/me')
            .then((res) => setUser(res.data.data))
            .catch(() => localStorage.removeItem(TOKEN_KEY))
            .finally(() => setLoading(false));
    }, []);

    const saveSession = (data) => {
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
    };

    const loginAdmin = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        saveSession(res.data.data);
        return res.data;
    };

    const loginStudent = async (email, password) => {
        const res = await api.post('/students/login', { email, password });
        saveSession(res.data.data);
        return res.data;
    };

    const register = async (values) => {
        const res = await api.post('/students/register', values);
        saveSession(res.data.data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    };

    const isAdmin = ['admin', 'librarian'].includes(user?.role);
    const isStudent = user?.role === 'student';

    return (
        <AuthContext.Provider
            value={{ user, setUser, loading, isAdmin, isStudent, loginAdmin, loginStudent, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
