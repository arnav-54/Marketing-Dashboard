const express = require('express');
const router = express.Router();
const tutorialController = require('../controllers/tutorialController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/status', isAuthenticated, tutorialController.getStatus);
router.post('/complete', isAuthenticated, tutorialController.complete);

module.exports = router;
