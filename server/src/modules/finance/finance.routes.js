const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');

/**
 * All finance routes are protected and require finance role
 */

// Get finance dashboard summary
router.get('/dashboard', verifyToken, roleMiddleware(['finance', 'manager']), financeController.getDashboardSummary);

// Get monthly financial report
router.get('/report', verifyToken, roleMiddleware(['finance', 'manager']), financeController.getMonthlyReport);

// Get top 5 costliest vehicles
router.get('/top-costly', verifyToken, roleMiddleware(['finance', 'manager']), financeController.getTopCostliestVehicles);

// Get financial breakdown for a specific vehicle
router.get('/vehicle/:vehicleId', verifyToken, roleMiddleware(['finance', 'manager']), financeController.getVehicleFinancial);

// Export financial data (CSV or PDF)
router.get('/export', verifyToken, roleMiddleware(['finance', 'manager']), financeController.exportFinancialData);

module.exports = router;
