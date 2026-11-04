const SectionHeader = ({ eyebrow, title, description, action }) => {
    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                <h2 className="mt-2 font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">{title}</h2>
                {description && <p className="mt-2 text-stone-600">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
};

export default SectionHeader;
