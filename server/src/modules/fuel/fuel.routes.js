const express = require('express');
const router = express.Router();
const fuelController = require('./fuel.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

// Create fuel record (Dispatcher or Manager)
router.post('/', verifyToken, roleGuard(['dispatcher', 'manager']), fuelController.createFuel);

// Get all fuel records
router.get('/', verifyToken, fuelController.getAllFuel);

// Get fuel by ID
router.get('/:id', verifyToken, fuelController.getFuelById);

// Get fuel by vehicle
router.get('/vehicle/:vehicleId', verifyToken, fuelController.getFuelByVehicle);

// Get fuel by trip
router.get('/trip/:tripId', verifyToken, fuelController.getFuelByTrip);

// Delete fuel record (Manager only)
router.delete('/:id', verifyToken, roleGuard(['manager']), fuelController.deleteFuel);

// Get fuel analytics
router.get('/analytics/consumption', verifyToken, roleGuard(['manager', 'finance']), fuelController.getFuelAnalytics);

module.exports = router;
