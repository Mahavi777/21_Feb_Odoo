const ManagerService = require('./manager.service');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await ManagerService.getDashboardMetrics();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await ManagerService.getGlobalAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

exports.getVehicleAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analytics = await ManagerService.getVehicleAnalytics(id);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};
