const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required'],
  },
  liters: {
    type: Number,
    required: [true, 'Liters is required'],
    min: 0.1,
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Fuel', fuelSchema);
