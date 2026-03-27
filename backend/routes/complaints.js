const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getOfficerComplaints,
  getComplaint,
  updateStatus,
  assignOfficer,
  trackComplaintByPublicId,
} = require('../controllers/complaintController');

// Public tracking route (no auth required)
router.get('/track/:complaintId', trackComplaintByPublicId);

// Citizen routes
router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);

// Officer routes
router.get('/officer', protect, requireRole('officer', 'admin'), getOfficerComplaints);
router.patch('/:id/status', protect, requireRole('officer', 'admin'), updateStatus);

// Admin routes
router.get('/', protect, requireRole('admin'), getAllComplaints);
router.patch('/:id/assign', protect, requireRole('admin'), assignOfficer);

// Shared
router.get('/:id', protect, getComplaint);

module.exports = router;
