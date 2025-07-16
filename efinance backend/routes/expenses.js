const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// Get all expenses
router.get('/', expenseController.getExpenses);

// Get expenses by month
router.get('/month', expenseController.getExpensesByMonth);

// Create expense
router.post('/', expenseController.createExpense);

// Update expense
router.put('/:id', expenseController.updateExpense);

// Delete expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
