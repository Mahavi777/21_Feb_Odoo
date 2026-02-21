const Trip = require('../trips/trip.model');
const Vehicle = require('../vehicles/vehicle.model');
const User = require('../users/user.model');
const Fuel = require('../fuel/fuel.model');
const Maintenance = require('../maintenance/maintenance.model');

// Dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const vehiclesInShop = await Vehicle.countDocuments({ status: 'inShop' });
    const vehiclesOnTrip = await Vehicle.countDocuments({ status: 'onTrip' });

    const totalTrips = await Trip.countDocuments();
    const completedTrips = await Trip.countDocuments({ status: 'completed' });
    const activeTrips = await Trip.countDocuments({ status: 'dispatched' });

    const totalUsers = await User.countDocuments();
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    const dashboardData = {
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        inShop: vehiclesInShop,
        onTrip: vehiclesOnTrip,
      },
      trips: {
        total: totalTrips,
        completed: completedTrips,
        active: activeTrips,
      },
      users: {
        total: totalUsers,
        suspended: suspendedUsers,
      },
    };

    res.json({
      message: 'Dashboard overview fetched successfully',
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard overview', error: error.message });
  }
};

// Revenue analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const trips = await Trip.find(query);

    const totalRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0);
    const completedTripsCount = trips.filter((t) => t.status === 'completed').length;
    const avgRevenuePerTrip = completedTripsCount > 0 ? totalRevenue / completedTripsCount : 0;

    res.json({
      message: 'Revenue analytics calculated successfully',
      data: {
        totalRevenue,
        completedTripsCount,
        avgRevenuePerTrip: avgRevenuePerTrip.toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating revenue analytics', error: error.message });
  }
};

// Vehicle utilization
exports.getVehicleUtilization = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();

    const utilization = await Promise.all(
      vehicles.map(async (vehicle) => {
        const trips = await Trip.find({ vehicleId: vehicle._id });
        const completedTrips = trips.filter((t) => t.status === 'completed');
        const totalDistance = trips.reduce((sum, trip) => {
          return sum + (trip.endOdometer - trip.startOdometer || 0);
        }, 0);

        return {
          vehicleId: vehicle._id,
          name: vehicle.name,
          licensePlate: vehicle.licensePlate,
          status: vehicle.status,
          totalTrips: trips.length,
          completedTrips: completedTrips.length,
          totalDistance,
          odometer: vehicle.odometer,
        };
      })
    );

    res.json({
      message: 'Vehicle utilization calculated successfully',
      data: utilization,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating vehicle utilization', error: error.message });
  }
};

// Driver performance
exports.getDriverPerformance = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'dispatcher' });

    const performance = await Promise.all(
      drivers.map(async (driver) => {
        const trips = await Trip.find({ driverId: driver._id });
        const completedTrips = trips.filter((t) => t.status === 'completed');
        const totalDistance = trips.reduce((sum, trip) => {
          return sum + (trip.endOdometer - trip.startOdometer || 0);
        }, 0);

        return {
          driverId: driver._id,
          name: driver.name,
          email: driver.email,
          status: driver.status,
          licenseExpiry: driver.licenseExpiry,
          safetyScore: driver.safetyScore,
          totalTrips: trips.length,
          completedTrips: completedTrips.length,
          totalDistance,
        };
      })
    );

    res.json({
      message: 'Driver performance calculated successfully',
      data: performance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating driver performance', error: error.message });
  }
};

// Maintenance costs
exports.getMaintenanceCosts = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;

    const query = {};
    if (vehicleId) query.vehicleId = vehicleId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const maintenanceRecords = await Maintenance.find(query).populate('vehicleId', 'name licensePlate');

    const totalCost = maintenanceRecords.reduce((sum, record) => sum + record.cost, 0);
    const avgCostPerMaintenance =
      maintenanceRecords.length > 0 ? totalCost / maintenanceRecords.length : 0;

    res.json({
      message: 'Maintenance costs calculated successfully',
      data: {
        recordCount: maintenanceRecords.length,
        totalCost,
        avgCostPerMaintenance: avgCostPerMaintenance.toFixed(2),
        records: maintenanceRecords,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating maintenance costs', error: error.message });
  }
};

// Fuel consumption trends
exports.getFuelConsumptionTrends = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;

    const query = {};
    if (vehicleId) query.vehicleId = vehicleId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const fuelRecords = await Fuel.find(query).populate('vehicleId', 'name licensePlate');

    const totalLiters = fuelRecords.reduce((sum, record) => sum + record.liters, 0);
    const totalCost = fuelRecords.reduce((sum, record) => sum + record.cost, 0);
    const avgCostPerLiter =
      totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : 0;

    res.json({
      message: 'Fuel consumption trends calculated successfully',
      data: {
        recordCount: fuelRecords.length,
        totalLiters,
        totalCost,
        avgCostPerLiter,
        records: fuelRecords,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error calculating fuel consumption trends', error: error.message });
  }
};
