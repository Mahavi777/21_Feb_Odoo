const express = require('express');
const router = express.Router();
const dispatchController = require('./dispatch.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

// Protect all dispatch routes for dispatchers and managers
router.use(verifyToken, roleGuard(['dispatcher', 'manager']));

router.get('/drivers/available', dispatchController.getAvailableDrivers);
router.get('/vehicles/available', dispatchController.getAvailableVehicles);

module.exports = router;
