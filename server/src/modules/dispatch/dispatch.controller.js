const User = require('../users/user.model');
const Vehicle = require('../vehicles/vehicle.model');

// Get available drivers for dispatch
exports.getAvailableDrivers = async (req, res) => {
  try {
    const today = new Date();
    
    // Fetch drivers where status = offDuty and not suspended, and licenseExpiry > today
    const drivers = await User.find({
      role: 'driver',
      status: 'offDuty',
      licenseExpiry: { $gt: today }
    }).select('-password').sort({ name: 1 });

    res.json({
      message: 'Available drivers fetched successfully',
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available drivers', error: error.message });
  }
};

// Get available vehicles for dispatch
exports.getAvailableVehicles = async (req, res) => {
  try {
    // Fetch vehicles where status = available
    const vehicles = await Vehicle.find({
      status: 'available'
    }).sort({ name: 1 });

    res.json({
      message: 'Available vehicles fetched successfully',
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available vehicles', error: error.message });
  }
};
