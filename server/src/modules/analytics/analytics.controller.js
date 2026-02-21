const AnalyticsService = require("./analytics.service");

exports.getFleetAnalytics = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getFleetKPIs();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getVehicleAnalytics = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getVehicleAnalytics();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyAnalytics = async (req, res, next) => {
  try {
    const data = await AnalyticsService.getMonthlyTrends();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};
