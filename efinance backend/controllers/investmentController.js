const Investment = require('../models/Investment');

// Get all investments for a user
exports.getInvestments = async (req, res) => {
  const { userId } = req.query;
  
  try {
    const investments = await Investment.find({ userId }).sort({ date: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get investments by month and year
exports.getInvestmentsByMonth = async (req, res) => {
  const { userId, month, year } = req.query;
  
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const investments = await Investment.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new investment
exports.createInvestment = async (req, res) => {
  const { name, amount, date, type, userId } = req.body;
  
  try {
    const newInvestment = new Investment({
      name,
      amount,
      date: new Date(date),
      type,
      userId
    });
    
    await newInvestment.save();
    res.status(201).json(newInvestment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an investment
exports.updateInvestment = async (req, res) => {
  const { id } = req.params;
  const { name, amount, date, type } = req.body;
  
  try {
    const updatedInvestment = await Investment.findByIdAndUpdate(
      id,
      { name, amount, date: new Date(date), type },
      { new: true, runValidators: true }
    );
    
    if (!updatedInvestment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json(updatedInvestment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an investment
exports.deleteInvestment = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deletedInvestment = await Investment.findByIdAndDelete(id);
    
    if (!deletedInvestment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
