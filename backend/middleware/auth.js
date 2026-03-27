const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');

// Clerk session middleware — attach to app-level
const clerkSession = clerkMiddleware();

// Require authenticated user
const protect = requireAuth();

// Role-based access control middleware
const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Lookup user in database instead of relying on token claims
      const User = require('../models/User');
      const user = await User.findOne({ clerkId: userId });
      const userRole = user?.role || 'citizen';

      if (!roles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Auth error' });
    }
  };
};

module.exports = { clerkSession, protect, requireRole };
