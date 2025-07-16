const User = require('../models/User');

// Create or get user (for Clerk integration)
exports.createOrGetUser = async (req, res) => {
  const { clerkId, email, firstName, lastName } = req.body;
  
  try {
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      user = new User({
        clerkId,
        email,
        firstName,
        lastName
      });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user by Clerk ID
exports.getUserByClerkId = async (req, res) => {
  const { clerkId } = req.params;
  
  try {
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { clerkId } = req.params;
  const { email, firstName, lastName } = req.body;
  
  try {
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { email, firstName, lastName },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
