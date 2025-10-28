/**
 * ChequeManagement Model
 * Tracks all cheques received from retailers with status management
 */

import mongoose from 'mongoose';

const chequeManagementSchema = new mongoose.Schema({
  chequeNumber: {
    type: String,
    required: [true, 'Cheque number is required'],
    trim: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  depositDate: {
    type: Date,
    required: [true, 'Deposit date is required'],
    index: true
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  branchName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  // Reference data
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  
  // Cheque status tracking
  status: {
    type: String,
    enum: ['Pending', 'Deposited', 'Cleared', 'Bounced', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  
  // Photo evidence
  chequePhotoUrl: {
    type: String,
    required: [true, 'Cheque photo is required'],
    trim: true
  },
  
  // Status tracking
  depositedAt: {
    type: Date,
    index: true
  },
  depositedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  clearedAt: {
    type: Date
  },
  clearedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  bouncedAt: {
    type: Date
  },
  bouncedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  bounceReason: {
    type: String,
    trim: true
  },
  
  // Notes and remarks
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  
  // Audit trail
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'Deposited', 'Cleared', 'Bounced', 'Cancelled']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver'
    },
    remarks: String
  }],
  
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

// Indexes for performance
chequeManagementSchema.index({ depositDate: -1, status: 1 }); // Date filtering with status
chequeManagementSchema.index({ status: 1, depositDate: -1 }); // Status reports
chequeManagementSchema.index({ retailerId: 1, depositDate: -1 }); // Retailer cheque history
chequeManagementSchema.index({ driverId: 1, depositDate: -1 }); // Driver cheque collection
chequeManagementSchema.index({ chequeNumber: 1 }, { unique: true }); // Unique cheque number
chequeManagementSchema.index({ bankName: 1, depositDate: -1 }); // Bank-wise reports
chequeManagementSchema.index({ createdAt: -1 }); // Recent cheques

// Pre-save middleware to add to status history
chequeManagementSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this.modifiedBy || null,
      remarks: this.statusChangeRemarks || ''
    });
    
    // Update status timestamps
    if (this.status === 'Cleared') {
      this.clearedAt = new Date();
      this.clearedBy = this.modifiedBy;
    } else if (this.status === 'Bounced') {
      this.bouncedAt = new Date();
      this.bouncedBy = this.modifiedBy;
    } else if (this.status === 'Deposited') {
      this.depositedAt = new Date();
      this.depositedBy = this.modifiedBy;
    }
  }
  next();
});

// Static method to get summary by date range
chequeManagementSchema.statics.getSummary = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        depositDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

// Static method to get bank-wise summary
chequeManagementSchema.statics.getBankWiseSummary = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        depositDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          bankName: '$bankName',
          status: '$status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id.bankName': 1, '_id.status': 1 }
    }
  ]);
};

const ChequeManagement = mongoose.model('ChequeManagement', chequeManagementSchema);

export default ChequeManagement;
