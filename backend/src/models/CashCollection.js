/**
 * CashCollection Model
 * Tracks daily cash collection submitted by driver
 * Records denominations and reconciliation
 */

import mongoose from 'mongoose';

const cashCollectionSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver ID is required']
  },
  dispatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriverDispatch',
    required: [true, 'Dispatch ID is required']
  },
  collectionDate: {
    type: Date,
    required: [true, 'Collection date is required'],
    default: Date.now
  },
  denominations: [{
    noteValue: {
      type: Number,
      required: true,
      enum: [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000]
    },
    noteCount: {
      type: Number,
      required: true,
      min: [0, 'Note count cannot be negative']
    },
    totalValue: {
      type: Number,
      required: true
    }
  }],
  totalCashCollected: {
    type: Number,
    required: [true, 'Total cash collected is required'],
    min: [0, 'Total cash cannot be negative']
  },
  totalChequeReceived: {
    type: Number,
    default: 0,
    min: [0, 'Cheque amount cannot be negative']
  },
  totalOnlineReceived: {
    type: Number,
    default: 0,
    min: [0, 'Online payment amount cannot be negative']
  },
  totalCreditGiven: {
    type: Number,
    default: 0,
    min: [0, 'Credit amount cannot be negative']
  },
  expectedCash: {
    type: Number,
    required: true
  },
  variance: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['Submitted', 'Verified', 'Reconciled'],
    default: 'Submitted'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate totals and variance
cashCollectionSchema.pre('save', function(next) {
  // Calculate total cash from denominations
  this.totalCashCollected = this.denominations.reduce((sum, denom) => {
    denom.totalValue = denom.noteValue * denom.noteCount;
    return sum + denom.totalValue;
  }, 0);
  
  // Calculate total received (cash + cheque + online)
  const totalReceived = this.totalCashCollected + 
                        (this.totalChequeReceived || 0) + 
                        (this.totalOnlineReceived || 0);
  
  // Calculate variance (total received + credit given - expected)
  this.variance = (totalReceived + (this.totalCreditGiven || 0)) - this.expectedCash;
  
  next();
});

// Indexes
cashCollectionSchema.index({ driverId: 1, collectionDate: -1 });
cashCollectionSchema.index({ dispatchId: 1 });
cashCollectionSchema.index({ status: 1 });
cashCollectionSchema.index({ collectionDate: -1 });

const CashCollection = mongoose.model('CashCollection', cashCollectionSchema);

export default CashCollection;
