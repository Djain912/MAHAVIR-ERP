/**
 * CashDenomination Model
 * Represents cash denominations assigned to driver at dispatch
 * Tracks individual note values and counts
 */

import mongoose from 'mongoose';

const cashDenominationSchema = new mongoose.Schema({
  dispatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriverDispatch',
    required: [true, 'Dispatch ID is required']
  },
  noteValue: {
    type: Number,
    required: [true, 'Note value is required'],
    enum: [1, 2, 5, 10, 20, 50, 100, 200, 500, 2000],
    min: [1, 'Note value must be positive']
  },
  noteCount: {
    type: Number,
    required: [true, 'Note count is required'],
    min: [0, 'Note count cannot be negative']
  },
  totalValue: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate total value
cashDenominationSchema.pre('save', function(next) {
  this.totalValue = this.noteValue * this.noteCount;
  next();
});

// Index for faster dispatch queries
cashDenominationSchema.index({ dispatchId: 1 });

const CashDenomination = mongoose.model('CashDenomination', cashDenominationSchema);

export default CashDenomination;
