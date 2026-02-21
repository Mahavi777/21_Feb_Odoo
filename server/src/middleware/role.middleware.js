// Role-based access control middleware
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking role', error: error.message });
    }
  };
};

module.exports = roleMiddleware;
