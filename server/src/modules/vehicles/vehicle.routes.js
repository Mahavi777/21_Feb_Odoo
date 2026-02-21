const express = require('express');
const router = express.Router();
const vehicleController = require('./vehicle.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

// Get all vehicles (protected)
router.get('/', verifyToken, vehicleController.getAllVehicles);

// Get vehicle by ID (protected)
router.get('/:id', verifyToken, vehicleController.getVehicleById);

// Create vehicle (Manager only)
router.post('/', verifyToken, roleGuard(['manager']), vehicleController.createVehicle);

// Update vehicle (Manager only)
router.patch('/:id', verifyToken, roleGuard(['manager']), vehicleController.updateVehicle);

// Retire vehicle (Manager only)
router.patch('/:id/retire', verifyToken, roleGuard(['manager']), vehicleController.retireVehicle);

// Delete vehicle (Manager only)
router.delete('/:id', verifyToken, roleGuard(['manager']), vehicleController.deleteVehicle);

// Get available vehicles
router.get('/status/available', verifyToken, vehicleController.getAvailableVehicles);

// Update odometer (Dispatcher)
router.patch('/:id/odometer', verifyToken, roleGuard(['dispatcher', 'manager']), vehicleController.updateOdometer);

module.exports = router;
