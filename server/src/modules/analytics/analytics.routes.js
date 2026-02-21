const express = require("express");
const { verifyToken, roleGuard } = require("../../middleware/auth.middleware");
const analyticsController = require("./analytics.controller");

const router = express.Router();

// Apply Manager & Finance RBAC to all routes in this file
// Dispatchers and Drivers intentionally blocked from financial visibility
router.use(verifyToken, roleGuard(["manager", "finance"]));

router.get("/fleet", analyticsController.getFleetAnalytics);
router.get("/vehicles", analyticsController.getVehicleAnalytics);
router.get("/monthly", analyticsController.getMonthlyAnalytics);

module.exports = router;
