const FinanceService = require("./finance.service");

exports.getDashboardKPIs = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await FinanceService.getDashboardKPIs(fromDate, toDate);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await FinanceService.getMonthlyTrends(fromDate, toDate);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getFuelLogs = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await FinanceService.getFuelLogs(fromDate, toDate);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getMaintenanceLogs = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await FinanceService.getMaintenanceLogs(fromDate, toDate);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getVehicleROI = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await FinanceService.getVehicleROI(fromDate, toDate);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};
