const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

// Protected routes - Manager and Finance only
router.get('/', verifyToken, roleGuard(['manager', 'finance']), userController.getAllUsers);
router.get('/:id', verifyToken, roleGuard(['manager', 'finance']), userController.getUserById);
router.put('/:id', verifyToken, roleGuard(['manager']), userController.updateUser);
router.delete('/:id', verifyToken, roleGuard(['manager']), userController.deleteUser);

// Drivers routes
router.get('/drivers/list', verifyToken, roleGuard(['dispatcher', 'manager']), userController.getDrivers);
router.patch('/drivers/:id/status', verifyToken, roleGuard(['manager']), userController.updateDriverStatus);

module.exports = router;
