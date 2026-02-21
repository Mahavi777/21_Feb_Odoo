const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { verifyToken, roleGuard } = require("../../middleware/auth.middleware");

// Drivers routes
router.get(
  "/drivers",
  verifyToken,
  roleGuard(["dispatcher", "manager", "safety", "finance"]),
  userController.getDrivers,
);
router.post(
  "/drivers",
  verifyToken,
  roleGuard(["manager"]),
  userController.createDriver,
);
router.patch(
  "/drivers/:id",
  verifyToken,
  roleGuard(["manager"]),
  userController.updateDriverDetails,
);
router.patch(
  "/drivers/:id/status",
  verifyToken,
  roleGuard(["manager"]),
  userController.updateDriverStatus,
);

// Protected routes - Manager and Finance only
router.get(
  "/",
  verifyToken,
  roleGuard(["manager", "finance"]),
  userController.getAllUsers,
);
router.get(
  "/:id",
  verifyToken,
  roleGuard(["manager", "finance"]),
  userController.getUserById,
);
router.put(
  "/:id",
  verifyToken,
  roleGuard(["manager"]),
  userController.updateUser,
);
router.delete(
  "/:id",
  verifyToken,
  roleGuard(["manager"]),
  userController.deleteUser,
);

module.exports = router;
