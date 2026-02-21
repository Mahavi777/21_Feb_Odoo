const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required'],
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver ID is required'],
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Cargo weight is required'],
    min: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'dispatched', 'completed', 'cancelled'],
    default: 'draft',
  },
  startOdometer: {
    type: Number,
    min: 0,
  },
  endOdometer: {
    type: Number,
    min: 0,
  },
  revenue: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Validation hook to check cargo weight against vehicle capacity
tripSchema.pre('save', async function (next) {
  try {
    const Vehicle = mongoose.model('Vehicle');
    const vehicle = await Vehicle.findById(this.vehicleId);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    if (this.cargoWeight > vehicle.maxCapacity) {
      throw new Error(
        `Cargo weight (${this.cargoWeight}kg) exceeds vehicle max capacity (${vehicle.maxCapacity}kg)`
      );
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Trip', tripSchema);
