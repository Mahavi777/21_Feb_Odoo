const Incident = require("./incident.model");
const User = require("../users/user.model");
const {
  recalculateDriverSafety,
  applyLicenseExpiryStatus,
} = require("./safety.service");

// Create incident
exports.createIncident = async (req, res) => {
  try {
    const { driverId, tripId, type, severity, description, date } = req.body;
    const createdBy = req.user ? req.user._id : req.body.createdBy;

    const driver = await User.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const incident = new Incident({
      driverId,
      tripId,
      type,
      severity,
      description,
      date: date || Date.now(),
      createdBy,
    });
    await incident.save();

    // Recalculate safety score for driver
    await recalculateDriverSafety(driverId);

    res.status(201).json({ message: "Incident created", data: incident });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating incident", error: error.message });
  }
};

// Get incidents with filters
exports.getIncidents = async (req, res) => {
  try {
    const { type, severity, status, search } = req.query;
    const q = {};
    if (type) q.type = type;
    if (severity) q.severity = severity;
    if (status) q.status = status;
    if (search) q.description = { $regex: search, $options: "i" };

    const incidents = await Incident.find(q)
      .populate("driverId", "name email licenseNumber")
      .sort({ date: -1 });
    res.json({
      message: "Incidents fetched",
      count: incidents.length,
      data: incidents,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching incidents", error: error.message });
  }
};

// Get drivers list for safety module, including license expiry logic
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: "driver" });

    const transformed = drivers.map((d) => {
      const dd = d.toObject();
      applyLicenseExpiryStatus(dd);
      return dd;
    });

    res.json({
      message: "Drivers fetched",
      count: transformed.length,
      data: transformed,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching drivers", error: error.message });
  }
};

// Dashboard KPIs
exports.getDashboard = async (req, res) => {
  try {
    const totalDrivers = await User.countDocuments({
      role: "driver",
    });
    const activeDrivers = await User.countDocuments({
      complianceStatus: "Active",
    });
    const suspendedDrivers = await User.countDocuments({
      complianceStatus: "Suspended",
    });
    const openIncidents = await Incident.countDocuments({ status: "Open" });

    const avgScoreAgg = await User.aggregate([
      { $group: { _id: null, avg: { $avg: "$safetyScore" } } },
    ]);
    const averageSafetyScore = avgScoreAgg[0]
      ? Math.round(avgScoreAgg[0].avg)
      : 100;

    // Licenses expiring within 30 days
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = await User.countDocuments({
      licenseExpiry: { $lte: in30, $gte: now },
    });

    res.json({
      message: "Dashboard data",
      data: {
        totalDrivers,
        activeDrivers,
        suspendedDrivers,
        openIncidents,
        averageSafetyScore,
        expiringSoon,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching dashboard", error: error.message });
  }
};
