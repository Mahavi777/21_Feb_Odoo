const express = require('express');
const { getDashboardStats, getAnalytics, getVehicleAnalytics } = require('./manager.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply manager RBAC to all routes in this file
router.use(verifyToken, roleGuard(['manager']));

// Dashboard metrics
router.get('/dashboard', getDashboardStats);

// Analytics
router.get('/analytics', getAnalytics);
router.get('/analytics/vehicle/:id', getVehicleAnalytics);

module.exports = router;
