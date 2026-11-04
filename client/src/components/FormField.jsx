const FormField = ({ id, label, error, hint, className = '', children }) => {
    return (
        <div className={className}>
            <label htmlFor={id} className="label">
                {label}
            </label>
            {children}
            {error ? <p className="field-error">{error}</p> : hint && <p className="mt-1.5 text-xs text-stone-500">{hint}</p>}
        </div>
    );
};

export default FormField;
