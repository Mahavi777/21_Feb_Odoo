const express = require('express');
const router = express.Router();
const safetyController = require('./safety.controller');

router.post('/incidents', safetyController.createIncident);
router.get('/incidents', safetyController.getIncidents);
router.get('/drivers', safetyController.getDrivers);
router.get('/dashboard', safetyController.getDashboard);

module.exports = router;
