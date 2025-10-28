/**
 * Driver Model
 * Represents drivers who deliver products to retailers
 * Supports Admin, Supervisor, and Driver roles
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: ['Admin', 'Supervisor', 'Driver'],
    default: 'Driver',
    required: true
  },
  salary: {
    type: Number,
    default: 12000,
    min: [0, 'Salary cannot be negative']
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
driverSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
driverSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get driver without sensitive data
driverSchema.methods.toSafeObject = function() {
  const driver = this.toObject();
  delete driver.password;
  return driver;
};

// Indexes for performance optimization
driverSchema.index({ phone: 1 }, { unique: true }); // Login queries (already unique)
driverSchema.index({ role: 1, active: 1 }); // Role-based filtering
driverSchema.index({ active: 1, createdAt: -1 }); // Active users listing
driverSchema.index({ name: 'text' }); // Text search on name

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
