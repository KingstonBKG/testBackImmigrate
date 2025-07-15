const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET events - optionally filtered by month and year
router.get('/', eventController.scrapeEvents);

module.exports = router;