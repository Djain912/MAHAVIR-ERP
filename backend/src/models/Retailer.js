/**
 * Retailer Model
 * Represents shops/retailers where products are delivered
 */

import mongoose from 'mongoose';

const retailerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Retailer name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  route: {
    type: String,
    required: [true, 'Route is required'],
    trim: true,
    maxlength: [100, 'Route name cannot exceed 100 characters']
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

// Indexes for performance optimization
retailerSchema.index({ route: 1, active: 1 }); // Route-based active retailers
retailerSchema.index({ phone: 1 }); // Phone lookup
retailerSchema.index({ active: 1, route: 1 }); // Active retailers by route
retailerSchema.index({ name: 'text', address: 'text' }); // Text search
retailerSchema.index({ active: 1, createdAt: -1 }); // Recent active retailers
retailerSchema.index({ route: 1, name: 1 }); // Sorted by route and name

const Retailer = mongoose.model('Retailer', retailerSchema);

export default Retailer;
