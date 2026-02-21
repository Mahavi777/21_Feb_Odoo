const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update vehicle status to "inShop" when maintenance is added
maintenanceSchema.post('save', async function (doc, next) {
  try {
    const Vehicle = mongoose.model('Vehicle');
    await Vehicle.findByIdAndUpdate(
      doc.vehicleId,
      { status: 'inShop', updatedAt: Date.now() },
      { new: true }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
