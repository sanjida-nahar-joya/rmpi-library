import FormField from './FormField';

// Name, roll, phone, department, semester and shift inputs used in several forms
const StudentFields = ({ values, errors, onChange, options }) => {
    const inputClass = (name) => `input ${errors[name] ? 'input-error' : ''}`;
    const placeholder = (text) => (options ? text : 'Loading...');

    return (
        <>
            <FormField id="name" label="Full name *" error={errors.name} className="sm:col-span-2">
                <input
                    id="name"
                    name="name"
                    value={values.name}
                    onChange={onChange}
                    className={inputClass('name')}
                    placeholder="Full name"
                    autoComplete="name"
                />
            </FormField>

            <FormField id="roll" label="Roll *" error={errors.roll}>
                <input id="roll" name="roll" value={values.roll} onChange={onChange} className={inputClass('roll')} placeholder="e.g. 100245" />
            </FormField>

            <FormField id="phone" label="Phone *" error={errors.phone}>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={values.phone}
                    onChange={onChange}
                    className={inputClass('phone')}
                    placeholder="01XXXXXXXXX"
                    autoComplete="tel"
                />
            </FormField>

            <FormField id="department" label="Department *" error={errors.department} className="sm:col-span-2">
                <select id="department" name="department" value={values.department} onChange={onChange} className={inputClass('department')}>
                    <option value="">{placeholder('Select department')}</option>
                    {options?.departments.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </FormField>

            <FormField id="semester" label="Semester *" error={errors.semester}>
                <select id="semester" name="semester" value={values.semester} onChange={onChange} className={inputClass('semester')}>
                    <option value="">{placeholder('Select semester')}</option>
                    {options?.semesters.map((item) => (
                        <option key={item} value={item}>
                            {item} Semester
                        </option>
                    ))}
                </select>
            </FormField>

            <FormField id="shift" label="Shift *" error={errors.shift}>
                <select id="shift" name="shift" value={values.shift} onChange={onChange} className={inputClass('shift')}>
                    <option value="">{placeholder('Select shift')}</option>
                    {options?.shifts.map((item) => (
                        <option key={item} value={item}>
                            {item} Shift
                        </option>
                    ))}
                </select>
            </FormField>
        </>
    );
};

export default StudentFields;
