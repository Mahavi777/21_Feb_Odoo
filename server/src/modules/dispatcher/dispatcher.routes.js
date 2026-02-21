const express = require('express');
const router = express.Router();
const dispatcherController = require('./dispatcher.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

// Protect all routes
router.use(verifyToken);

// Allow access to dispatcher and manager roles
router.use(roleGuard(['dispatcher', 'manager']));

// Dashboard aggregated route
router.get('/dashboard', dispatcherController.getDashboardStats);

module.exports = router;
