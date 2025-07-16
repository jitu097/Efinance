const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

// Get all investments
router.get('/', investmentController.getInvestments);

// Get investments by month
router.get('/month', investmentController.getInvestmentsByMonth);

// Create investment
router.post('/', investmentController.createInvestment);

// Update investment
router.put('/:id', investmentController.updateInvestment);

// Delete investment
router.delete('/:id', investmentController.deleteInvestment);

module.exports = router;
