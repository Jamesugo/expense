const Expense = require('../models/Expense');
const { startOfWeek, endOfWeek, format, parseISO, startOfYear, endOfYear } = require('date-fns');

// Helper: get date strings
const getDateRange = (period, refDate = new Date()) => {
  const today = format(refDate, 'yyyy-MM-dd');
  const year = format(refDate, 'yyyy');
  const month = format(refDate, 'yyyy-MM');
  const weekStart = format(startOfWeek(refDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(refDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  switch (period) {
    case 'today': return { start: today, end: today };
    case 'week': return { start: weekStart, end: weekEnd };
    case 'month': return { start: `${month}-01`, end: `${month}-31` };
    case 'year': return { start: `${year}-01-01`, end: `${year}-12-31` };
    default: return null;
  }
};

// @desc    Get all expenses for user (with filters)
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const {
      startDate, endDate, category, minAmount, maxAmount,
      search, page = 1, limit = 50, sortBy = 'date', order = 'desc',
    } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    if (category) query.category = category;
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, time, notes } = req.body;
    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount: parseFloat(amount),
      category,
      date,
      time: time || '00:00',
      notes: notes || '',
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const { title, amount, category, date, time, notes } = req.body;
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = date;
    if (time !== undefined) expense.time = time;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense summary (totals + category breakdown)
// @route   GET /api/expenses/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const monthStart = format(now, 'yyyy-MM') + '-01';
    const monthEnd = format(now, 'yyyy-MM') + '-31';
    const yearStart = format(now, 'yyyy') + '-01-01';
    const yearEnd = format(now, 'yyyy') + '-12-31';
    const weekRange = getDateRange('week', now);

    const [todayTotal, weekTotal, monthTotal, yearTotal, monthByCategory, dailyThisMonth, last6Months] =
      await Promise.all([
        // Today total
        Expense.aggregate([
          { $match: { user: userId, date: today } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        // Week total
        Expense.aggregate([
          { $match: { user: userId, date: { $gte: weekRange.start, $lte: weekRange.end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        // Month total
        Expense.aggregate([
          { $match: { user: userId, date: { $gte: monthStart, $lte: monthEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        // Year total
        Expense.aggregate([
          { $match: { user: userId, date: { $gte: yearStart, $lte: yearEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        // Month by category
        Expense.aggregate([
          { $match: { user: userId, date: { $gte: monthStart, $lte: monthEnd } } },
          { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
        ]),
        // Daily spending this month
        Expense.aggregate([
          { $match: { user: userId, date: { $gte: monthStart, $lte: monthEnd } } },
          { $group: { _id: '$date', total: { $sum: '$amount' } } },
          { $sort: { _id: 1 } },
        ]),
        // Last 6 months monthly totals
        Expense.aggregate([
          {
            $match: {
              user: userId,
              date: {
                $gte: format(new Date(now.getFullYear(), now.getMonth() - 5, 1), 'yyyy-MM-dd'),
                $lte: monthEnd,
              },
            },
          },
          {
            $group: {
              _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
              total: { $sum: '$amount' },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    const monthExpenseCount = monthTotal[0]?.count || 0;
    const daysInMonth = now.getDate();
    const avgDaily = monthExpenseCount > 0 && daysInMonth > 0
      ? (monthTotal[0]?.total || 0) / daysInMonth
      : 0;

    res.json({
      success: true,
      data: {
        today: { total: todayTotal[0]?.total || 0, count: todayTotal[0]?.count || 0 },
        week: { total: weekTotal[0]?.total || 0 },
        month: { total: monthTotal[0]?.total || 0, count: monthTotal[0]?.count || 0 },
        year: { total: yearTotal[0]?.total || 0 },
        avgDailyThisMonth: parseFloat(avgDaily.toFixed(2)),
        byCategory: monthByCategory,
        dailyThisMonth,
        last6Months,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expenses for a specific date (for calendar day modal)
// @route   GET /api/expenses/date/:date
// @access  Private
const getExpensesByDate = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      user: req.user._id,
      date: req.params.date,
    }).sort({ time: 1 });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ success: true, data: expenses, total });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily totals for a month (for calendar view)
// @route   GET /api/expenses/monthly-calendar/:yearMonth
// @access  Private
const getMonthlyCalendar = async (req, res, next) => {
  try {
    const { yearMonth } = req.params; // "2025-01"
    const start = `${yearMonth}-01`;
    const end = `${yearMonth}-31`;

    const dailyTotals = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$date', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Convert to a map keyed by date string
    const totalsMap = {};
    dailyTotals.forEach((d) => { totalsMap[d._id] = { total: d.total, count: d.count }; });

    res.json({ success: true, data: totalsMap });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getExpensesByDate,
  getMonthlyCalendar,
};
