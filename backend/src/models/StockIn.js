/**
 * StockIn Model
 * Represents stock received from Coca-Cola into warehouse
 * Tracks inventory received with batch numbers
 */

import mongoose from 'mongoose';

const stockInSchema = new mongoose.Schema({
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
  batchNo: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
    maxlength: [100, 'Batch number cannot exceed 100 characters']
  },
  dateReceived: {
    type: Date,
    required: [true, 'Date received is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  purchaseRate: {
    type: Number,
    required: [true, 'Purchase rate is required'],
    min: [0, 'Purchase rate cannot be negative']
  },
  sellingRate: {
    type: Number,
    required: [true, 'Selling rate is required'],
    min: [0, 'Selling rate cannot be negative']
  },
  ratePerUnit: {
    type: Number,
    min: [0, 'Rate cannot be negative']
  },
  totalValue: {
    type: Number
  },
  remainingQuantity: {
    type: Number
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
stockInSchema.pre('save', function(next) {
  // Always calculate for new documents or when quantity/rate changes
  if (this.isNew || this.isModified('quantity') || this.isModified('purchaseRate')) {
    // Use purchaseRate for total value calculation, fallback to ratePerUnit for backward compatibility
    const rate = this.purchaseRate || this.ratePerUnit || 0;
    this.totalValue = this.quantity * rate;
    
    // Set remaining quantity only for new documents
    if (this.isNew) {
      this.remainingQuantity = this.quantity;
    }
    
    // Set ratePerUnit for backward compatibility
    if (!this.ratePerUnit) {
      this.ratePerUnit = this.purchaseRate;
    }
  }
  next();
});

// Indexes for performance optimization
stockInSchema.index({ productId: 1, batchNo: 1 }, { unique: true }); // Unique batch per product
stockInSchema.index({ dateReceived: -1 }); // Recent stock entries
stockInSchema.index({ productId: 1, expiryDate: 1 }); // FIFO & expiry tracking
stockInSchema.index({ productId: 1, remainingQuantity: 1 }); // Low stock alerts
stockInSchema.index({ remainingQuantity: 1 }); // Global low stock check
stockInSchema.index({ expiryDate: 1 }); // Expiry date monitoring
stockInSchema.index({ createdAt: -1 }); // Recent stock intake

const StockIn = mongoose.model('StockIn', stockInSchema);

export default StockIn;
