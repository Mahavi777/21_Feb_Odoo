const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["manager", "dispatcher", "safety", "finance", "driver"],
    default: "driver",
  },
  assignedVehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    default: null,
  },
  status: {
    type: String,
    enum: ["onDuty", "offDuty", "suspended"],
    default: "offDuty",
  },
  licenseNumber: {
    type: String,
    sparse: true,
  },
  licenseExpiry: {
    type: Date,
  },
  licenseCategory: {
    type: String,
    default: "Standard",
  },
  baseSalary: {
    type: Number,
    default: 0,
  },
  region: {
    type: String,
    default: "Global",
  },
  safetyScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  complianceStatus: {
    type: String,
    enum: ["Active", "Warning", "Suspended"],
    default: "Active",
  },
  totalIncidents: {
    type: Number,
    default: 0,
  },
  suspensionReason: {
    type: String,
    default: "",
  },
  suspendedAt: {
    type: Date,
  },
  lastScoreUpdated: {
    type: Date,
    default: Date.now,
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

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if license is expired
userSchema.methods.isLicenseExpired = function () {
  return this.licenseExpiry < new Date();
};

module.exports = mongoose.model("User", userSchema);
