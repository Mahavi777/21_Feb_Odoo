const express = require("express");
const { verifyToken, roleGuard } = require("../../middleware/auth.middleware");
const financeController = require("./finance.controller");

const router = express.Router();

// Strict RBAC locking operational roles away from financial endpoints.
// Only `finance` and `manager` roles possess access to this data tree.
router.use(verifyToken, roleGuard(["manager", "finance"]));

router.get("/dashboard", financeController.getDashboardKPIs);
router.get("/trends", financeController.getMonthlyTrends);
router.get("/fuel", financeController.getFuelLogs);
router.get("/maintenance", financeController.getMaintenanceLogs);
router.get("/roi", financeController.getVehicleROI);

module.exports = router;
