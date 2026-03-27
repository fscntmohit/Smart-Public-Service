const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  getStats,
  getCategoryDistribution,
  getMonthlyTrends,
  getAreaDistribution,
  getHeatmapData,
  getOfficerPerformance,
} = require('../controllers/analyticsController');

router.get('/stats', protect, requireRole('admin'), getStats);
router.get('/categories', protect, requireRole('admin'), getCategoryDistribution);
router.get('/trends', protect, requireRole('admin'), getMonthlyTrends);
router.get('/areas', protect, requireRole('admin'), getAreaDistribution);
router.get('/heatmap', protect, requireRole('admin'), getHeatmapData);
router.get('/performance', protect, requireRole('admin'), getOfficerPerformance);

module.exports = router;
