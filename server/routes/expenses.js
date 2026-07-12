const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getExpensesByDate,
  getMonthlyCalendar,
} = require('../controllers/expenseController');

router.use(protect); // All expense routes require authentication

router.get('/summary', getSummary);
router.get('/date/:date', getExpensesByDate);
router.get('/monthly-calendar/:yearMonth', getMonthlyCalendar);

router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').get(getExpenseById).put(updateExpense).delete(deleteExpense);

module.exports = router;
