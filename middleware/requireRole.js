const AppError = require('../utils/AppError');

const requireRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Access denied. This area is for Admin or Moderator only.', 403));
  }
  next();
};

module.exports = requireRole;
