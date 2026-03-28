const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateReport } = require('../controllers/reportController');

router.get('/', protect, generateReport);

module.exports = router;
