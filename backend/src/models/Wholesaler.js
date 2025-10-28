/**
 * Wholesaler Model
 * Represents wholesale buyers who purchase in bulk
 */

import mongoose from 'mongoose';

const wholesalerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Wholesaler name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  businessName: {
    type: String,
    trim: true,
    maxlength: [150, 'Business name cannot exceed 150 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  pincode: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate if value is provided
        if (!v || v === '') return true;
        return /^[0-9]{6}$/.test(v);
      },
      message: 'Please provide a valid 6-digit pincode'
    }
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Only validate if value is provided
        if (!v || v === '') return true;
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: 'Please provide a valid GST number (Format: 22AAAAA0000A1Z5)'
    }
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  outstandingBalance: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
wholesalerSchema.index({ phone: 1 });
wholesalerSchema.index({ name: 1 });
wholesalerSchema.index({ active: 1 });
wholesalerSchema.index({ city: 1, state: 1 });

const Wholesaler = mongoose.model('Wholesaler', wholesalerSchema);

export default Wholesaler;
