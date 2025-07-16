const Expense = require('../models/Expense');

// Get all expenses for a user
exports.getExpenses = async (req, res) => {
  const { userId } = req.query;
  
  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expenses by month and year
exports.getExpensesByMonth = async (req, res) => {
  const { userId, month, year } = req.query;
  
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new expense
exports.createExpense = async (req, res) => {
  const { description, amount, date, category, userId } = req.body;
  
  try {
    const newExpense = new Expense({
      description,
      amount,
      date: new Date(date),
      category,
      userId
    });
    
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { description, amount, date, category } = req.body;
  
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { description, amount, date: new Date(date), category },
      { new: true, runValidators: true }
    );
    
    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deletedExpense = await Expense.findByIdAndDelete(id);
    
    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
