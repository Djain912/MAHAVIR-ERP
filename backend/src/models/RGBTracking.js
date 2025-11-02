/**
 * RGB (Returnable Glass Bottles) Tracking Model
 * Tracks returnable bottles and empties management
 */

import mongoose from 'mongoose';

const rgbTrackingSchema = new mongoose.Schema({
  pickListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PickListExtracted',
    required: true,
    index: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  // Full bottle returns (unsold)
  totalLoadedCrates: {
    type: Number,
    required: true,
    min: [0, 'Loaded crates cannot be negative']
  },
  totalSoldCrates: {
    type: Number,
    required: true,
    min: [0, 'Sold crates cannot be negative']
  },
  returnedFullCrates: {
    type: Number,
    default: 0,
    min: [0, 'Returned full crates cannot be negative']
  },
  
  // Empty bottle returns
  expectedEmptyCrates: {
    type: Number,
    default: 0,
    min: [0, 'Expected empties cannot be negative']
  },
  returnedEmptyCrates: {
    type: Number,
    default: 0,
    min: [0, 'Returned empties cannot be negative']
  },
  missingEmptyCrates: {
    type: Number,
    default: 0,
    min: [0, 'Missing empties cannot be negative']
  },
  
  // Financial impact
  emptyBottleValue: {
    type: Number,
    default: 50, // ₹50 per empty crate (configurable)
    min: [0, 'Empty bottle value cannot be negative']
  },
  penaltyAmount: {
    type: Number,
    default: 0,
    min: [0, 'Penalty amount cannot be negative']
  },
  
  // Item-wise RGB tracking
  itemReturns: [{
    itemCode: {
      type: String,
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    loadedQty: {
      type: Number,
      default: 0
    },
    soldQty: {
      type: Number,
      default: 0
    },
    returnedFullQty: {
      type: Number,
      default: 0
    },
    returnedEmptyQty: {
      type: Number,
      default: 0
    },
    missingEmptyQty: {
      type: Number,
      default: 0
    },
    penaltyPerUnit: {
      type: Number,
      default: 0
    }
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'submitted', 'verified', 'settled', 'disputed'],
    default: 'pending',
    index: true
  },
  
  // Timestamps
  submittedAt: {
    type: Date
  },
  verifiedAt: {
    type: Date
  },
  settledAt: {
    type: Date
  },
  
  // References
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  // Additional information
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Photos (for disputes)
  photoUrls: [{
    type: String
  }],
  
  // Dispute information
  disputeReason: {
    type: String,
    maxlength: [500, 'Dispute reason cannot exceed 500 characters']
  },
  disputeResolvedAt: {
    type: Date
  },
  disputeResolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
rgbTrackingSchema.index({ pickListId: 1, driverId: 1 });
rgbTrackingSchema.index({ date: -1 });
rgbTrackingSchema.index({ status: 1 });
rgbTrackingSchema.index({ driverId: 1, date: -1 });

// Virtual for total penalty
rgbTrackingSchema.virtual('totalPenalty').get(function() {
  return this.missingEmptyCrates * this.emptyBottleValue;
});

// Calculate expected empties before save
rgbTrackingSchema.pre('save', function(next) {
  // Expected empties = Total sold crates
  this.expectedEmptyCrates = this.totalSoldCrates;
  
  // Calculate missing empties
  this.missingEmptyCrates = Math.max(0, this.expectedEmptyCrates - this.returnedEmptyCrates);
  
  // Calculate penalty
  this.penaltyAmount = this.missingEmptyCrates * this.emptyBottleValue;
  
  next();
});

// Instance methods
rgbTrackingSchema.methods.markAsSubmitted = function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  return this.save();
};

rgbTrackingSchema.methods.markAsVerified = function(verifiedById) {
  this.status = 'verified';
  this.verifiedAt = new Date();
  this.verifiedBy = verifiedById;
  return this.save();
};

rgbTrackingSchema.methods.markAsSettled = function() {
  this.status = 'settled';
  this.settledAt = new Date();
  return this.save();
};

rgbTrackingSchema.methods.raiseDispute = function(reason) {
  this.status = 'disputed';
  this.disputeReason = reason;
  return this.save();
};

const RGBTracking = mongoose.model('RGBTracking', rgbTrackingSchema);

export default RGBTracking;
