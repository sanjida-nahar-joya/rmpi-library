const PageHeader = ({ eyebrow, title, description, children }) => {
    return (
        <section className="border-b border-stone-200 bg-linear-to-b from-white to-paper">
            <div className="container-page py-12 sm:py-14">
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">{title}</h1>
                {description && <p className="mt-3 max-w-2xl text-stone-600">{description}</p>}
                {children && <div className="mt-7">{children}</div>}
            </div>
        </section>
    );
};

export default PageHeader;
