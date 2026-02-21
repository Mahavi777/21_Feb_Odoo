const Fuel = require('./fuel.model');
const Vehicle = require('../vehicles/vehicle.model');

// Create fuel record
exports.createFuel = async (req, res) => {
  try {
    const { vehicleId, liters, cost, date, tripId } = req.body;

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const fuel = new Fuel({
      vehicleId,
      liters,
      cost,
      date,
      tripId,
    });

    await fuel.save();

    res.status(201).json({
      message: 'Fuel record created successfully',
      data: fuel,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating fuel record', error: error.message });
  }
};

// Get all fuel records
exports.getAllFuel = async (req, res) => {
  try {
    const fuel = await Fuel.find()
      .populate('vehicleId', 'name licensePlate')
      .populate('tripId', 'status cargoWeight');

    res.json({
      message: 'Fuel records fetched successfully',
      count: fuel.length,
      data: fuel,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fuel records', error: error.message });
  }
};

// Get fuel by ID
exports.getFuelById = async (req, res) => {
  try {
    const fuel = await Fuel.findById(req.params.id)
      .populate('vehicleId', 'name licensePlate')
      .populate('tripId', 'status cargoWeight');

    if (!fuel) {
      return res.status(404).json({ message: 'Fuel record not found' });
    }

    res.json({
      message: 'Fuel record fetched successfully',
      data: fuel,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fuel record', error: error.message });
  }
};

// Get fuel records by vehicle
exports.getFuelByVehicle = async (req, res) => {
  try {
    const fuel = await Fuel.find({ vehicleId: req.params.vehicleId }).populate(
      'vehicleId',
      'name licensePlate'
    );

    res.json({
      message: 'Fuel records for vehicle fetched successfully',
      count: fuel.length,
      data: fuel,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle fuel records', error: error.message });
  }
};

// Get fuel records by trip
exports.getFuelByTrip = async (req, res) => {
  try {
    const fuel = await Fuel.find({ tripId: req.params.tripId }).populate(
      'vehicleId',
      'name licensePlate'
    );

    res.json({
      message: 'Fuel records for trip fetched successfully',
      count: fuel.length,
      data: fuel,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip fuel records', error: error.message });
  }
};

// Delete fuel record
exports.deleteFuel = async (req, res) => {
  try {
    const fuel = await Fuel.findByIdAndDelete(req.params.id);

    if (!fuel) {
      return res.status(404).json({ message: 'Fuel record not found' });
    }

    res.json({
      message: 'Fuel record deleted successfully',
      data: fuel,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting fuel record', error: error.message });
  }
};

// Get fuel consumption analytics
exports.getFuelAnalytics = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;

    const query = {};
    if (vehicleId) query.vehicleId = vehicleId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const fuelRecords = await Fuel.find(query);

    const analytics = {
      totalLiters: fuelRecords.reduce((sum, record) => sum + record.liters, 0),
      totalCost: fuelRecords.reduce((sum, record) => sum + record.cost, 0),
      averageCostPerLiter: 0,
      recordCount: fuelRecords.length,
    };

    if (analytics.totalLiters > 0) {
      analytics.averageCostPerLiter = (analytics.totalCost / analytics.totalLiters).toFixed(2);
    }

    res.json({
      message: 'Fuel analytics calculated successfully',
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating fuel analytics', error: error.message });
  }
};
