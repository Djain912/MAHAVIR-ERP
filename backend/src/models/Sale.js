/**
 * Sale Model
 * Represents sales transactions made by drivers to retailers
 * Tracks products sold, payments received, and empty bottles returned
 */

import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver ID is required']
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: [true, 'Retailer ID is required']
  },
  dispatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriverDispatch',
    required: [true, 'Dispatch ID is required']
  },
  saleDate: {
    type: Date,
    required: [true, 'Sale date is required'],
    default: Date.now
  },
  productsSold: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    ratePerUnit: {
      type: Number,
      required: true,
      min: [0, 'Rate cannot be negative']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    }
  }],
  payments: {
    cash: {
      type: Number,
      default: 0,
      min: [0, 'Cash cannot be negative']
    },
    cheque: [{
      chequeNumber: {
        type: String,
        required: true,
        trim: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Cheque amount cannot be negative']
      },
      photoUrl: {
        type: String,
        required: true,
        trim: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    credit: {
      type: Number,
      default: 0,
      min: [0, 'Credit cannot be negative']
    }
  },
  emptyBottlesReturned: {
    type: Number,
    default: 0,
    min: [0, 'Empty bottles returned cannot be negative']
  },
  geoLocation: {
    latitude: {
      type: Number,
      min: [-90, 'Invalid latitude'],
      max: [90, 'Invalid latitude']
    },
    longitude: {
      type: Number,
      min: [-180, 'Invalid longitude'],
      max: [180, 'Invalid longitude']
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  totalPaid: {
    type: Number,
    required: true,
    min: [0, 'Total paid cannot be negative']
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

// Pre-save middleware to calculate totals
saleSchema.pre('save', function(next) {
  // Calculate total amount from products sold
  this.totalAmount = this.productsSold.reduce((sum, item) => {
    item.amount = item.quantity * item.ratePerUnit;
    return sum + item.amount;
  }, 0);
  
  // Calculate total paid from all payment methods
  const totalCheque = this.payments.cheque.reduce((sum, cheque) => sum + cheque.amount, 0);
  this.totalPaid = this.payments.cash + totalCheque;
  
  next();
});

// Indexes for performance optimization
saleSchema.index({ driverId: 1, saleDate: -1 }); // Driver sales history
saleSchema.index({ retailerId: 1, saleDate: -1 }); // Retailer purchase history
saleSchema.index({ dispatchId: 1 }); // Dispatch reconciliation
saleSchema.index({ saleDate: -1 }); // Recent sales listing
saleSchema.index({ saleDate: -1, driverId: 1 }); // Date-based driver reports
saleSchema.index({ saleDate: -1, retailerId: 1 }); // Date-based retailer reports
saleSchema.index({ 'productsSold.productId': 1, saleDate: -1 }); // Product analytics
saleSchema.index({ createdAt: -1 }); // Recent transactions

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
