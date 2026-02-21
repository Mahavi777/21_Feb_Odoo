const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

// Create maintenance (Manager only)
router.post('/', verifyToken, roleGuard(['manager', 'safety']), maintenanceController.createMaintenance);

// Get all maintenance records
router.get('/', verifyToken, maintenanceController.getAllMaintenance);

// Get maintenance by ID
router.get('/:id', verifyToken, maintenanceController.getMaintenanceById);

// Get maintenance by vehicle
router.get('/vehicle/:vehicleId', verifyToken, maintenanceController.getMaintenanceByVehicle);

// Delete maintenance record (Manager only)
router.delete('/:id', verifyToken, roleGuard(['manager']), maintenanceController.deleteMaintenance);

// Mark maintenance as complete
router.patch('/:id/complete', verifyToken, roleGuard(['manager', 'safety']), maintenanceController.completeMaintenance);

module.exports = router;
