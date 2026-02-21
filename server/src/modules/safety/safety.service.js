const Incident = require('./incident.model');
const User = require('../users/user.model');

// Severity penalties
const SEVERITY_PENALTY = {
  Low: 5,
  Medium: 10,
  High: 15,
};

// Recalculate safety score for a driver based on incidents and time
async function recalculateDriverSafety(driverId) {
  const driver = await User.findById(driverId);
  if (!driver) throw new Error('Driver not found');

  const incidents = await Incident.find({ driverId }).sort({ date: 1 });

  // Base score
  let score = 100;

  // Apply penalties
  incidents.forEach((inc) => {
    if (inc.type === 'Accident') score -= 10;
    const sev = SEVERITY_PENALTY[inc.severity] || 0;
    score -= sev;
  });

  // Add +5 every 90 days incident-free since last incident
  if (incidents.length === 0) {
    // Determine how many 90-day periods since account creation or lastScoreUpdated
    const since = driver.lastScoreUpdated || driver.createdAt || new Date();
    const periods = Math.floor((Date.now() - new Date(since).getTime()) / (90 * 24 * 60 * 60 * 1000));
    score += periods * 5;
  } else {
    // since last incident
    const lastIncidentDate = incidents[incidents.length - 1].date;
    const periods = Math.floor((Date.now() - new Date(lastIncidentDate).getTime()) / (90 * 24 * 60 * 60 * 1000));
    score += periods * 5;
  }

  // Clamp score
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  // Update driver fields
  driver.safetyScore = Math.round(score);
  driver.totalIncidents = incidents.length;
  driver.lastScoreUpdated = new Date();

  // Determine complianceStatus
  if (driver.safetyScore < 50) {
    driver.complianceStatus = 'Suspended';
    if (!driver.suspendedAt) driver.suspendedAt = new Date();
    driver.suspensionReason = 'Safety score below threshold';
  } else if (driver.safetyScore >= 50 && driver.safetyScore <= 70) {
    driver.complianceStatus = 'Warning';
  } else {
    driver.complianceStatus = 'Active';
    // clear suspension if score recovered
    driver.suspensionReason = '';
    driver.suspendedAt = undefined;
  }

  await driver.save();
  return driver;
}

// Apply license expiry logic to a driver record (mutates passed user document)
function applyLicenseExpiryStatus(user) {
  if (!user || !user.licenseExpiry) return user;
  const today = new Date();
  const expiry = new Date(user.licenseExpiry);
  const daysLeft = Math.ceil((expiry - today) / (24 * 60 * 60 * 1000));

  if (daysLeft < 0) {
    user.complianceStatus = 'Suspended';
    user.suspensionReason = 'License expired';
    user.suspendedAt = user.suspendedAt || new Date();
  } else if (daysLeft <= 30 && user.complianceStatus !== 'Suspended') {
    user.complianceStatus = 'Warning';
  }

  return user;
}

module.exports = {
  recalculateDriverSafety,
  applyLicenseExpiryStatus,
};
