const AdminPageHeader = ({ title, description, action }) => {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">{title}</h1>
                {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
            </div>
            {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
        </div>
    );
};

export default AdminPageHeader;
