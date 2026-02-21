const express = require("express");
const router = express.Router();
const exportController = require("./export.controller");
const { verifyToken, roleGuard } = require("../../middleware/auth.middleware");

// Export CSV
router.get(
  "/csv",
  verifyToken,
  roleGuard(["manager", "finance"]),
  exportController.exportCsv,
);

// Export PDF
router.get(
  "/pdf",
  verifyToken,
  roleGuard(["manager", "finance"]),
  exportController.exportPdf,
);

module.exports = router;
