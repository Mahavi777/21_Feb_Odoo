const Maintenance = require('./maintenance.model');
const Vehicle = require('../vehicles/vehicle.model');

// Create maintenance record
exports.createMaintenance = async (req, res) => {
  try {
    const { vehicleId, description, cost, date } = req.body;

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const maintenance = new Maintenance({
      vehicleId,
      description,
      cost,
      date,
    });

    await maintenance.save();

    res.status(201).json({
      message: 'Maintenance record created successfully and vehicle status updated to inShop',
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating maintenance', error: error.message });
  }
};

// Get all maintenance records
exports.getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find().populate('vehicleId', 'name licensePlate');

    res.json({
      message: 'Maintenance records fetched successfully',
      count: maintenance.length,
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance records', error: error.message });
  }
};

// Get maintenance by ID
exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id).populate(
      'vehicleId',
      'name licensePlate status'
    );

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json({
      message: 'Maintenance record fetched successfully',
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance record', error: error.message });
  }
};

// Get maintenance by vehicle
exports.getMaintenanceByVehicle = async (req, res) => {
  try {
    const maintenance = await Maintenance.find({ vehicleId: req.params.vehicleId });

    res.json({
      message: 'Maintenance records for vehicle fetched successfully',
      count: maintenance.length,
      data: maintenance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching vehicle maintenance records', error: error.message });
  }
};

// Delete maintenance record
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    res.json({
      message: 'Maintenance record deleted successfully',
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting maintenance record', error: error.message });
  }
};

// Mark maintenance as complete and update vehicle status
exports.completeMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Update vehicle status back to available
    await Vehicle.findByIdAndUpdate(
      maintenance.vehicleId,
      { status: 'available', updatedAt: Date.now() },
      { new: true }
    );

    res.json({
      message: 'Maintenance completed and vehicle status updated to available',
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing maintenance', error: error.message });
  }
};
