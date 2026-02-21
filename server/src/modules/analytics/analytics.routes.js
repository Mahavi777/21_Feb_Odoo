const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

// Dashboard overview (Manager and Finance)
router.get('/dashboard/overview', verifyToken, roleGuard(['manager', 'finance']), analyticsController.getDashboardOverview);

// Revenue analytics
router.get('/revenue', verifyToken, roleGuard(['manager', 'finance']), analyticsController.getRevenueAnalytics);

// Vehicle utilization
router.get('/vehicles/utilization', verifyToken, roleGuard(['manager', 'finance']), analyticsController.getVehicleUtilization);

// Driver performance
router.get('/drivers/performance', verifyToken, roleGuard(['manager', 'safety']), analyticsController.getDriverPerformance);

// Maintenance costs
router.get('/maintenance/costs', verifyToken, roleGuard(['manager', 'finance']), analyticsController.getMaintenanceCosts);

// Fuel consumption trends
router.get('/fuel/trends', verifyToken, roleGuard(['manager', 'finance']), analyticsController.getFuelConsumptionTrends);

module.exports = router;
