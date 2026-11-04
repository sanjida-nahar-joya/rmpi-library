import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        style: { fontSize: '14px', borderRadius: '12px', padding: '12px 14px' },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
