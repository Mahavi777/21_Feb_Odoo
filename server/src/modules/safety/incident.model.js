const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  type: { type: String, enum: ['Accident', 'Speeding', 'Compliance Failure', 'Other'], required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  description: { type: String },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Incident', incidentSchema);
