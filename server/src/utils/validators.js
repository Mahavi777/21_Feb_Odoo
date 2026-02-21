// Input validation utilities
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const phoneRegex = /^[0-9]{10,15}$/;

exports.validateEmail = (email) => {
  return emailRegex.test(email);
};

exports.validatePhone = (phone) => {
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

exports.validateCargoWeight = (cargoWeight, maxCapacity) => {
  return cargoWeight <= maxCapacity;
};

exports.validateLicenseExpiry = (licenseExpiry) => {
  return new Date(licenseExpiry) > new Date();
};

exports.validatePassword = (password) => {
  return password && password.length >= 6;
};

exports.validateRequired = (field, fieldName) => {
  if (!field || field.toString().trim() === '') {
    throw new Error(`${fieldName} is required`);
  }
};

module.exports;
