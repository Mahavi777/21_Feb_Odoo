const User = require('./user.model');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = { $in: req.query.status.split(',') };
    }
    if (req.query.role) {
      filter.role = { $in: req.query.role.split(',') };
    }

    const users = await User.find(filter).select('-password');
    res.json({
      message: 'Users fetched successfully',
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, role, status, safetyScore } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        role,
        status,
        safetyScore,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Get drivers (users with dispatcher role by default for this schema context)
exports.getDrivers = async (req, res) => {
  try {
    const filter = { role: 'driver' };
    if (req.query.status) {
      filter.status = { $in: req.query.status.split(',') };
    }
    const drivers = await User.find(filter).select('-password');
    res.json({
      message: 'Drivers fetched successfully',
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drivers', error: error.message });
  }
};

// Update driver status
exports.updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Driver status updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating driver status', error: error.message });
  }
};

// Create a Driver
exports.createDriver = async (req, res) => {
  try {
    const { name, email, password, licenseNumber, licenseExpiry, licenseCategory, baseSalary } = req.body;

    if (!licenseNumber || !licenseExpiry) {
      return res.status(400).json({ message: 'Drivers must have a license number and expiry' });
    }

    const user = new User({
      name,
      email,
      password: password || 'defaultpassword123',
      role: 'driver',
      status: 'offDuty',
      safetyScore: 100,
      licenseNumber,
      licenseExpiry,
      licenseCategory: licenseCategory || 'Standard',
      baseSalary: baseSalary || 0
    });

    await user.save();

    res.status(201).json({
      message: 'Driver created successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating driver', error: error.message });
  }
};

// Update Driver Details
exports.updateDriverDetails = async (req, res) => {
  try {
    const { name, email, licenseNumber, licenseExpiry, licenseCategory, baseSalary, status, safetyScore } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      {
        name,
        email,
        licenseNumber,
        licenseExpiry,
        licenseCategory,
        baseSalary,
        status,
        safetyScore,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({
      message: 'Driver updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating driver', error: error.message });
  }
};
