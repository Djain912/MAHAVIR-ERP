/**
 * DriverDispatchItem Model
 * Represents individual product items in a driver dispatch
 * Links dispatch to specific products and quantities
 */

import mongoose from 'mongoose';

const driverDispatchItemSchema = new mongoose.Schema({
  dispatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriverDispatch',
    required: [true, 'Dispatch ID is required']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  remainingQuantity: {
    type: Number
  },
  ratePerUnit: {
    type: Number,
    required: [true, 'Rate per unit is required'],
    min: [0, 'Rate cannot be negative']
  },
  totalValue: {
    type: Number
  },
  itemType: {
    type: String,
    enum: ['Retail', 'Wholesale'],
    required: [true, 'Item type is required'],
    default: 'Retail'
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

// Pre-save middleware to calculate total value and set remaining quantity
driverDispatchItemSchema.pre('save', function(next) {
  if (this.isNew) {
    this.totalValue = this.quantity * this.ratePerUnit;
    this.remainingQuantity = this.quantity;
  }
  next();
});

// Index for faster dispatch and product queries
driverDispatchItemSchema.index({ dispatchId: 1, productId: 1 });

const DriverDispatchItem = mongoose.model('DriverDispatchItem', driverDispatchItemSchema);

export default DriverDispatchItem;
