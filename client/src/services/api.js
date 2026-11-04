import axios from 'axios';

export const TOKEN_KEY = 'rmpi-library-token';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// If the token expires on a private page, send the user back to the right login page
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const isAuthRequest = url.includes('/login') || url.includes('/register');

        if (error.response?.status === 401 && !isAuthRequest && localStorage.getItem(TOKEN_KEY)) {
            localStorage.removeItem(TOKEN_KEY);
            const path = window.location.pathname;
            if (path.startsWith('/admin')) window.location.href = '/admin/login?expired=1';
            else if (path === '/profile' || path === '/my-requests') window.location.href = '/login?expired=1';
        }
        return Promise.reject(error);
    }
);

export const getErrorMessage = (error) => {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response) return 'Something went wrong. Please try again.';
    return 'Cannot reach the server. Please make sure the backend is running.';
};

export default api;
