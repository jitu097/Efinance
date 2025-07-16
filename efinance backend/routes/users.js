const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create or get user
router.post('/', userController.createOrGetUser);

// Get user by Clerk ID
router.get('/:clerkId', userController.getUserByClerkId);

// Update user
router.put('/:clerkId', userController.updateUser);

module.exports = router;
