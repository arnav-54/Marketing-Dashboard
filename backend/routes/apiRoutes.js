const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.use(isAuthenticated);

router.get('/summary', apiController.getSummary);
router.get('/channels', apiController.getChannels);
router.get('/monthly', apiController.getMonthly);
router.get('/campaigns', apiController.getCampaigns);
router.get('/insights', apiController.getInsights);

module.exports = router;
