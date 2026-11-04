import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ id, name, value, onChange, error, placeholder = 'Enter your password', autoComplete = 'current-password' }) => {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className={`input pr-11 ${error ? 'input-error' : ''}`}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 hover:text-stone-700"
                aria-label={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
};

export default PasswordInput;
