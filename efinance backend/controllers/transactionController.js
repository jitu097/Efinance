const Transaction = require('../models/Transaction');

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
  const { userId } = req.query;
  
  try {
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions by month and year
exports.getTransactionsByMonth = async (req, res) => {
  const { userId, month, year } = req.query;
  
  try {
    // Create date range for the specified month and year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  const { description, amount, date, type, userId } = req.body;
  
  try {
    const newTransaction = new Transaction({
      description,
      amount,
      date: new Date(date),
      type,
      userId
    });
    
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { description, amount, date, type } = req.body;
  
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { description, amount, date: new Date(date), type },
      { new: true, runValidators: true }
    );
    
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
