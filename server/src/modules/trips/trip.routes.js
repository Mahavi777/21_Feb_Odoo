const express = require('express');
const router = express.Router();
const tripController = require('./trip.controller');
const { verifyToken, roleGuard, blockDriverIfNotEligible } = require('../../middleware/auth.middleware');

// Create trip (Dispatcher only, with driver eligibility check)
router.post('/', verifyToken, roleGuard(['dispatcher', 'manager']), blockDriverIfNotEligible, tripController.createTrip);

// Get all trips
router.get('/', verifyToken, tripController.getAllTrips);

// Get trip by ID
router.get('/:id', verifyToken, tripController.getTripById);

// Dispatch trip
router.patch('/:id/dispatch', verifyToken, roleGuard(['dispatcher', 'manager']), tripController.dispatchTrip);

// Complete trip
router.patch('/:id/complete', verifyToken, roleGuard(['dispatcher', 'manager']), tripController.completeTrip);

// Cancel trip
router.patch('/:id/cancel', verifyToken, roleGuard(['dispatcher', 'manager']), tripController.cancelTrip);

// Get trips by driver
router.get('/driver/:driverId', verifyToken, tripController.getTripsByDriver);

// Get trips by vehicle
router.get('/vehicle/:vehicleId', verifyToken, tripController.getTripsByVehicle);

module.exports = router;
