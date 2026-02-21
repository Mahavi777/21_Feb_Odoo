const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Max capacity is required'],
    min: 1,
  },
  odometer: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['available', 'onTrip', 'inShop', 'retired'],
    default: 'available',
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Acquisition cost is required'],
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
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

module.exports = mongoose.model('Vehicle', vehicleSchema);
