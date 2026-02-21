const Vehicle = require('./vehicle.model');

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = { $in: req.query.status.split(',') };
    }

    const vehicles = await Vehicle.find(filter);
    res.json({
      message: 'Vehicles fetched successfully',
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({
      message: 'Vehicle fetched successfully',
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle', error: error.message });
  }
};

// Create vehicle
exports.createVehicle = async (req, res) => {
  try {
    const { name, model, licensePlate, maxCapacity, acquisitionCost, vehicleType, region } =
      req.body;

    const vehicle = new Vehicle({
      name,
      model,
      licensePlate,
      maxCapacity,
      acquisitionCost,
      vehicleType,
      region,
    });

    await vehicle.save();

    res.status(201).json({
      message: 'Vehicle created successfully',
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating vehicle', error: error.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { name, model, licensePlate, maxCapacity, odometer, status, vehicleType, region, acquisitionCost } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        name,
        model,
        licensePlate,
        maxCapacity,
        odometer,
        status,
        vehicleType,
        region,
        acquisitionCost,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({
      message: 'Vehicle updated successfully',
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vehicle', error: error.message });
  }
};

// Retire vehicle
exports.retireVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        status: 'retired',
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({
      message: 'Vehicle retired successfully',
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retiring vehicle', error: error.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({
      message: 'Vehicle deleted successfully',
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
  }
};

// Get available vehicles
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: 'available' });
    res.json({
      message: 'Available vehicles fetched successfully',
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available vehicles', error: error.message });
  }
};

// Update vehicle odometer
exports.updateOdometer = async (req, res) => {
  try {
    const { odometer } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        odometer,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({
      message: 'Vehicle odometer updated successfully',
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating odometer', error: error.message });
  }
};
