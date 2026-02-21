const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');

// Verify JWT Token
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// Role-based access control guard
exports.roleGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. Required roles: ' + allowedRoles.join(', '),
      });
    }

    next();
  };
};

// License expiry check middleware
exports.checkLicenseExpiry = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isLicenseExpired()) {
      return res.status(403).json({
        message: 'License has expired. Cannot perform this action.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking license', error: error.message });
  }
};

// Driver assignment blocker middleware
exports.blockDriverIfNotEligible = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Cannot assign trip. Driver is suspended.',
      });
    }

    // Check if license expired
    if (user.isLicenseExpired()) {
      return res.status(403).json({
        message: 'Cannot assign trip. Driver license has expired.',
      });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error checking driver eligibility', error: error.message });
  }
};
