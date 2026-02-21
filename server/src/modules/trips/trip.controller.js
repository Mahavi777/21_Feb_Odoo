const Trip = require('./trip.model');
const Vehicle = require('../vehicles/vehicle.model');
const User = require('../users/user.model');

// Create trip (with validation)
exports.createTrip = async (req, res) => {
  try {
    const { vehicleId, driverId, cargoWeight, startOdometer, revenue } = req.body;

    // Validate driver eligibility
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (driver.status === 'suspended') {
      return res.status(403).json({ message: 'Cannot assign trip. Driver is suspended.' });
    }

    if (driver.status !== 'offDuty') {
      return res.status(403).json({ message: 'Cannot assign trip. Driver is currently not off-duty.' });
    }

    if (driver.isLicenseExpired()) {
      return res.status(403).json({ message: 'Cannot assign trip. Driver license has expired.' });
    }

    // Validate vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Validate cargo weight
    if (cargoWeight > vehicle.maxCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${vehicle.maxCapacity}kg)`,
      });
    }

    const trip = new Trip({
      vehicleId,
      driverId,
      cargoWeight,
      startOdometer,
      revenue,
      status: 'dispatched',
    });

    await trip.save();

    // Update vehicle to onTrip
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'onTrip', updatedAt: Date.now() });

    // Update driver to onDuty and bound to vehicle
    await User.findByIdAndUpdate(driverId, { 
      status: 'onDuty', 
      assignedVehicle: vehicleId,
      updatedAt: Date.now() 
    });

    res.status(201).json({
      message: 'Trip created successfully',
      data: trip,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating trip', error: error.message });
  }
};

// Get all trips
exports.getAllTrips = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = { $in: req.query.status.split(',') };
    }

    const trips = await Trip.find(filter)
      .populate('vehicleId', 'name licensePlate')
      .populate('driverId', 'name email');

    res.json({
      message: 'Trips fetched successfully',
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trips', error: error.message });
  }
};

// Get trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicleId', 'name licensePlate maxCapacity')
      .populate('driverId', 'name email licenseNumber');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({
      message: 'Trip fetched successfully',
      data: trip,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip', error: error.message });
  }
};

// Dispatch trip
exports.dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft trips can be dispatched' });
    }

    // Update vehicle status to onTrip
    await Vehicle.findByIdAndUpdate(
      trip.vehicleId,
      { status: 'onTrip', updatedAt: Date.now() },
      { new: true }
    );

    trip.status = 'dispatched';
    trip.updatedAt = Date.now();
    await trip.save();

    // Update driver to onDuty
    await User.findByIdAndUpdate(
      trip.driverId,
      { status: 'onDuty', assignedVehicle: trip.vehicleId, updatedAt: Date.now() }
    );

    res.json({
      message: 'Trip dispatched successfully',
      data: trip,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error dispatching trip', error: error.message });
  }
};

// Complete trip
exports.completeTrip = async (req, res) => {
  try {
    const { endOdometer } = req.body;

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'dispatched') {
      return res.status(400).json({ message: 'Only dispatched trips can be completed' });
    }

    // Update trip
    trip.status = 'completed';
    trip.endOdometer = endOdometer;
    trip.updatedAt = Date.now();
    await trip.save();

    // Update vehicle status to available
    await Vehicle.findByIdAndUpdate(
      trip.vehicleId,
      { status: 'available', odometer: endOdometer, updatedAt: Date.now() },
      { new: true }
    );

    // Update driver to offDuty
    await User.findByIdAndUpdate(
      trip.driverId,
      { status: 'offDuty', assignedVehicle: null, updatedAt: Date.now() }
    );

    res.json({
      message: 'Trip completed successfully',
      data: trip,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error completing trip', error: error.message });
  }
};

// Cancel trip
exports.cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed trips' });
    }

    // If trip was dispatched, reset vehicle status
    if (trip.status === 'dispatched') {
      await Vehicle.findByIdAndUpdate(
        trip.vehicleId,
        { status: 'available', updatedAt: Date.now() },
        { new: true }
      );
    }

    trip.status = 'cancelled';
    trip.updatedAt = Date.now();
    await trip.save();

    // Update driver to offDuty
    await User.findByIdAndUpdate(
      trip.driverId,
      { status: 'offDuty', assignedVehicle: null, updatedAt: Date.now() }
    );

    res.json({
      message: 'Trip cancelled successfully',
      data: trip,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling trip', error: error.message });
  }
};

// Get trips by driver
exports.getTripsByDriver = async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.params.driverId })
      .populate('vehicleId', 'name licensePlate')
      .pop('driverId', 'name email');

    res.json({
      message: 'Driver trips fetched successfully',
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching driver trips', error: error.message });
  }
};

// Get trips by vehicle
exports.getTripsByVehicle = async (req, res) => {
  try {
    const trips = await Trip.find({ vehicleId: req.params.vehicleId })
      .populate('vehicleId', 'name licensePlate')
      .populate('driverId', 'name email');

    res.json({
      message: 'Vehicle trips fetched successfully',
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vehicle trips', error: error.message });
  }
};
