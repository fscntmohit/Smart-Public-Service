const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const {
  syncUser,
  getMe,
  getOfficers,
  createOfficer,
  updateOfficer,
  deleteOfficer,
} = require('../controllers/userController');

// Auth routes
router.post('/sync', protect, syncUser);
router.get('/me', protect, getMe);

// Officer management (admin)
router.get('/officers', protect, requireRole('admin'), getOfficers);
router.post('/officers', protect, requireRole('admin'), createOfficer);
router.put('/officers/:id', protect, requireRole('admin'), updateOfficer);
router.delete('/officers/:id', protect, requireRole('admin'), deleteOfficer);

module.exports = router;
