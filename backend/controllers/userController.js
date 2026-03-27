const User = require('../models/User');
const { getAuth } = require('@clerk/express');

// Sync user from Clerk (upsert)
exports.syncUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { name, email, role } = req.body;

    const userRole = role || 'citizen';

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          clerkId: userId,
          name: name || '',
          email: email || '',
          role: userRole,
        },
        $setOnInsert: {
          department: '',
          area: '',
        }
      },
      { upsert: true, new: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Sync user error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sync first.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Get all officers (admin)
exports.getOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' }).sort({ name: 1 });
    res.json(officers);
  } catch (error) {
    console.error('Get officers error:', error);
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
};

// Create/add officer (admin)
exports.createOfficer = async (req, res) => {
  try {
    const { clerkId, name, email, department, area } = req.body;

    const officer = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          clerkId,
          name,
          email,
          role: 'officer',
          department: department || '',
          area: area || '',
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json(officer);
  } catch (error) {
    console.error('Create officer error:', error);
    res.status(500).json({ error: 'Failed to create officer' });
  }
};

// Update officer (admin)
exports.updateOfficer = async (req, res) => {
  try {
    const { name, email, department, area } = req.body;
    const officer = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { name, email, department, area } },
      { new: true }
    );

    if (!officer) return res.status(404).json({ error: 'Officer not found' });
    res.json(officer);
  } catch (error) {
    console.error('Update officer error:', error);
    res.status(500).json({ error: 'Failed to update officer' });
  }
};

// Delete officer (admin)
exports.deleteOfficer = async (req, res) => {
  try {
    const officer = await User.findByIdAndDelete(req.params.id);
    if (!officer) return res.status(404).json({ error: 'Officer not found' });
    res.json({ message: 'Officer deleted' });
  } catch (error) {
    console.error('Delete officer error:', error);
    res.status(500).json({ error: 'Failed to delete officer' });
  }
};
