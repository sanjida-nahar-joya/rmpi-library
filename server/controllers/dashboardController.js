const { getDB } = require('../config/db');
const { LOW_STOCK_LIMIT, withAvailability, getToday } = require('../utils/helpers');

const booksCollection = () => getDB().collection('books');
const issuesCollection = () => getDB().collection('issues');

const getStats = async (req, res) => {
    const today = getToday();

    const [totals, totalCategories, unavailableTitles, lowStockTitles, activeIssues, overdueIssues, categoryDistribution] =
        await Promise.all([
            booksCollection()
                .aggregate([
                    {
                        $group: {
                            _id: null,
                            totalTitles: { $sum: 1 },
                            totalCopies: { $sum: '$totalCopies' },
                            availableCopies: { $sum: '$availableCopies' },
                            issuedCopies: { $sum: '$issuedCopies' },
                        },
                    },
                ])
                .toArray(),
            getDB().collection('categories').countDocuments(),
            booksCollection().countDocuments({ availableCopies: { $lte: 0 } }),
            booksCollection().countDocuments({ availableCopies: { $gt: 0, $lte: LOW_STOCK_LIMIT } }),
            issuesCollection().countDocuments({ status: 'issued' }),
            issuesCollection().countDocuments({ status: 'issued', dueDate: { $lt: today } }),
            booksCollection()
                .aggregate([
                    { $group: { _id: '$category', titles: { $sum: 1 }, copies: { $sum: '$totalCopies' } } },
                    { $sort: { titles: -1 } },
                ])
                .toArray(),
        ]);

    const sums = totals[0] || { totalTitles: 0, totalCopies: 0, availableCopies: 0, issuedCopies: 0 };

    res.json({
        success: true,
        data: {
            totalTitles: sums.totalTitles,
            totalCopies: sums.totalCopies,
            availableCopies: sums.availableCopies,
            issuedCopies: sums.issuedCopies,
            totalCategories,
            unavailableTitles,
            lowStockTitles,
            activeIssues,
            overdueIssues,
            categoryDistribution: categoryDistribution.map((item) => ({
                category: item._id,
                titles: item.titles,
                copies: item.copies,
            })),
        },
    });
};

const getRecentActivities = async (req, res) => {
    const today = getToday();

    const [recentBooks, recentIssued, recentReturned, lowStockBooks, unavailableBooks, pendingRequestCount] = await Promise.all([
        booksCollection().find().sort({ createdAt: -1 }).limit(5).toArray(),
        issuesCollection().find({ status: 'issued' }).sort({ createdAt: -1 }).limit(5).toArray(),
        issuesCollection().find({ status: 'returned' }).sort({ returnDate: -1 }).limit(5).toArray(),
        booksCollection()
            .find({ availableCopies: { $gt: 0, $lte: LOW_STOCK_LIMIT } })
            .sort({ availableCopies: 1, title: 1 })
            .limit(6)
            .toArray(),
        booksCollection().find({ availableCopies: { $lte: 0 } }).sort({ title: 1 }).limit(6).toArray(),
        getDB().collection('requests').countDocuments({ status: 'pending' }),
    ]);

    res.json({
        success: true,
        data: {
            recentBooks: recentBooks.map(withAvailability),
            recentIssued: recentIssued.map((issue) => ({ ...issue, isOverdue: new Date(issue.dueDate) < today })),
            recentReturned,
            lowStockBooks: lowStockBooks.map(withAvailability),
            unavailableBooks: unavailableBooks.map(withAvailability),
            pendingRequestCount,
        },
    });
};

module.exports = { getStats, getRecentActivities };
