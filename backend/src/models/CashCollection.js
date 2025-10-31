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
      enum: [10, 20, 50, 100, 200, 500, 2000] // Removed 1, 2, 5 - now handled by coins field
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
  coins: {
    type: Number,
    default: 0,
    min: [0, 'Coins amount cannot be negative']
  },
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
  // Cheque details
  chequeNumber: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  chequeDate: {
    type: Date
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
  // Credit details
  creditCustomerName: {
    type: String,
    trim: true
  },
  creditNotes: {
    type: String,
    maxlength: [500, 'Credit notes cannot exceed 500 characters']
  },
  totalReceived: {
    type: Number,
    default: 0,
    min: [0, 'Total received cannot be negative']
  },
  // NEW FIELDS - Credit Received Breakdown
  creditReceivedCash: {
    type: Number,
    default: 0,
    min: [0, 'Credit received cash cannot be negative']
  },
  creditReceivedCheque: {
    type: Number,
    default: 0,
    min: [0, 'Credit received cheque cannot be negative']
  },
  // NEW FIELDS - Bounce Received Breakdown
  bounceReceivedCash: {
    type: Number,
    default: 0,
    min: [0, 'Bounce received cash cannot be negative']
  },
  bounceReceivedCheque: {
    type: Number,
    default: 0,
    min: [0, 'Bounce received cheque cannot be negative']
  },
  // Bounce details
  bounceChequeNumber: {
    type: String,
    trim: true
  },
  bounceDate: {
    type: Date
  },
  bounceReason: {
    type: String,
    maxlength: [500, 'Bounce reason cannot exceed 500 characters']
  },
  // NEW FIELD - Empty Bottles
  emptyBottlesReceived: {
    type: Number,
    default: 0,
    min: [0, 'Empty bottles count cannot be negative']
  },
  bottlesNotes: {
    type: String,
    maxlength: [500, 'Bottles notes cannot exceed 500 characters']
  },
  // NEW FIELDS - Invoice and Outlet Details
  invoiceNumber: {
    type: String,
    trim: true
  },
  outletName: {
    type: String,
    trim: true
  },
  salesmanName: {
    type: String,
    trim: true
  },
  // NEW FIELD - Daily Expense
  dailyExpenseAmount: {
    type: Number,
    default: 0,
    min: [0, 'Daily expense cannot be negative']
  },
  expenseNotes: {
    type: String,
    maxlength: [500, 'Expense notes cannot exceed 500 characters']
  },
  // NEW FIELD - Bill Cancellation
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledAmount: {
    type: Number,
    default: 0
  },
  expectedCash: {
    type: Number,
    required: true
  },
  variance: {
    type: Number,
    default: 0
  },
  previousVariance: {
    type: Number,
    default: 0
  },
  cumulativeVariance: {
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
cashCollectionSchema.pre('save', async function(next) {
  // Calculate total cash from denominations + coins
  const denominationsTotal = this.denominations.reduce((sum, denom) => {
    denom.totalValue = denom.noteValue * denom.noteCount;
    return sum + denom.totalValue;
  }, 0);
  
  this.totalCashCollected = denominationsTotal + (this.coins || 0);
  
  // Calculate total received (cash + cheque + online) and store it
  this.totalReceived = this.totalCashCollected + 
                       (this.totalChequeReceived || 0) + 
                       (this.totalOnlineReceived || 0);
  
  // Calculate current day variance (total received + credit given - expected)
  this.variance = (this.totalReceived + (this.totalCreditGiven || 0)) - this.expectedCash;
  
  // Calculate cumulative variance (previous variance + current variance)
  this.cumulativeVariance = (this.previousVariance || 0) + this.variance;
  
  next();
});

// Indexes
cashCollectionSchema.index({ driverId: 1, collectionDate: -1 });
cashCollectionSchema.index({ dispatchId: 1 });
cashCollectionSchema.index({ status: 1 });
cashCollectionSchema.index({ collectionDate: -1 });

const CashCollection = mongoose.model('CashCollection', cashCollectionSchema);

export default CashCollection;
