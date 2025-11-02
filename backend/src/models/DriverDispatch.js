/**
 * DriverDispatch Model
 * Represents stock assigned to a driver for delivery
 * Tracks total stock value and cash assigned
 */

import mongoose from 'mongoose';

const driverDispatchSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver ID is required']
  },
  pickListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PickListExtracted',
    required: false, // Optional - some dispatches may not have pick lists
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Dispatch date is required'],
    default: Date.now
  },
  totalStockValue: {
    type: Number,
    required: [true, 'Total stock value is required'],
    min: [0, 'Total stock value cannot be negative']
  },
  totalCashValue: {
    type: Number,
    required: [true, 'Total cash value is required'],
    min: [0, 'Total cash value cannot be negative']
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Settled'],
    default: 'Active'
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
driverDispatchSchema.index({ driverId: 1, date: -1 }); // Driver dispatch history
driverDispatchSchema.index({ pickListId: 1 }); // Pick list lookup
driverDispatchSchema.index({ status: 1 }); // Status filtering
driverDispatchSchema.index({ driverId: 1, status: 1, date: -1 }); // Active dispatches per driver
driverDispatchSchema.index({ date: -1, status: 1 }); // Date-based status filtering
driverDispatchSchema.index({ status: 1, createdAt: -1 }); // Recent active/completed dispatches
driverDispatchSchema.index({ createdAt: -1 }); // Recent dispatches

const DriverDispatch = mongoose.model('DriverDispatch', driverDispatchSchema);

export default DriverDispatch;
