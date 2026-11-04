import { useState } from 'react';

const BAR_COLOR = '#34508d';

const CategoryChart = ({ data }) => {
    const [view, setView] = useState('chart');
    const max = Math.max(...data.map((item) => item.titles), 1);

    return (
        <div className="card h-full p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="font-semibold text-stone-900">Books by category</h2>
                    <p className="mt-0.5 text-sm text-stone-500">Number of titles in each category</p>
                </div>
                <div className="flex rounded-lg bg-stone-100 p-0.5 text-xs font-medium" role="group" aria-label="Choose view">
                    {['chart', 'table'].map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setView(option)}
                            aria-pressed={view === option}
                            className={`rounded-md px-2.5 py-1 capitalize transition ${
                                view === option ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {data.length === 0 && <p className="py-10 text-center text-sm text-stone-500">No books in the catalog yet.</p>}

            {data.length > 0 && view === 'chart' && (
                <ul className="mt-6 space-y-1.5">
                    {data.map((item) => (
                        <li
                            key={item.category}
                            tabIndex={0}
                            aria-label={`${item.category}: ${item.titles} titles, ${item.copies} copies`}
                            className="group relative grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:grid-cols-[minmax(0,10rem)_1fr]"
                        >
                            <span className="truncate text-right text-sm text-stone-600">{item.category}</span>
                            <div className="flex min-w-0 items-center gap-2 border-l border-stone-300 py-1.5">
                                <div
                                    className="h-4 rounded-r-[4px] transition-opacity group-hover:opacity-80"
                                    style={{ width: `calc((100% - 2.5rem) * ${item.titles / max})`, backgroundColor: BAR_COLOR }}
                                />
                                <span className="text-sm font-medium text-stone-800 tabular-nums">{item.titles}</span>
                            </div>
                            <div className="pointer-events-none absolute -top-8 left-1/3 z-10 hidden rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus-visible:block">
                                {item.category}: {item.titles} titles · {item.copies} copies
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {data.length > 0 && view === 'table' && (
                <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                                <th className="py-2 pr-4 font-medium">Category</th>
                                <th className="py-2 pr-4 text-right font-medium">Titles</th>
                                <th className="py-2 text-right font-medium">Copies</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {data.map((item) => (
                                <tr key={item.category}>
                                    <td className="py-2 pr-4 text-stone-800">{item.category}</td>
                                    <td className="py-2 pr-4 text-right text-stone-800 tabular-nums">{item.titles}</td>
                                    <td className="py-2 text-right text-stone-800 tabular-nums">{item.copies}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CategoryChart;
