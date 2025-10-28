/**
 * Salary Advance Model
 * Tracks advance payments given to employees
 * Auto-deducts from monthly salary
 */

import mongoose from 'mongoose';

const salaryAdvanceSchema = new mongoose.Schema({
  // Employee reference
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  
  // Advance amount
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be greater than 0']
  },
  
  // Date of advance
  advanceDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Reason for advance
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  
  // Payment method
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI'],
    required: true,
    default: 'Cash'
  },
  
  // Payment details (for bank/cheque/UPI)
  paymentDetails: {
    referenceNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    chequeNumber: { type: String, trim: true },
    chequeDate: { type: Date },
    upiId: { type: String, trim: true },
    transactionId: { type: String, trim: true }
  },
  
  // Recovery plan
  recoveryPlan: {
    installments: {
      type: Number,
      default: 1,
      min: 1,
      max: 12
    },
    perMonthDeduction: {
      type: Number,
      default: function() {
        return Math.ceil(this.amount / this.recoveryPlan.installments);
      }
    },
    startMonth: {
      type: Number,
      min: 1,
      max: 12
    },
    startYear: {
      type: Number
    }
  },
  
  // Recovery tracking
  recovery: {
    totalRecovered: {
      type: Number,
      default: 0
    },
    remainingAmount: {
      type: Number,
      default: function() {
        return this.amount;
      }
    },
    recoveredMonths: [{
      month: Number,
      year: Number,
      amount: Number,
      salarySlipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalarySlip'
      },
      recoveredAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Recovering', 'Recovered', 'Cancelled'],
    default: 'Pending'
  },
  
  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  approvedAt: {
    type: Date
  },
  
  rejectionReason: {
    type: String,
    trim: true
  },
  
  // Created by (who entered this advance)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  
  // Remarks
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes
salaryAdvanceSchema.index({ employeeId: 1, status: 1 });
salaryAdvanceSchema.index({ advanceDate: -1 });
salaryAdvanceSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to set recovery plan defaults
salaryAdvanceSchema.pre('save', function(next) {
  if (this.isNew) {
    const now = new Date();
    if (!this.recoveryPlan.startMonth) {
      this.recoveryPlan.startMonth = now.getMonth() + 2; // Start from next month
      if (this.recoveryPlan.startMonth > 12) {
        this.recoveryPlan.startMonth = 1;
        this.recoveryPlan.startYear = now.getFullYear() + 1;
      } else {
        this.recoveryPlan.startYear = now.getFullYear();
      }
    }
    
    if (!this.recoveryPlan.perMonthDeduction) {
      this.recoveryPlan.perMonthDeduction = Math.ceil(this.amount / this.recoveryPlan.installments);
    }
    
    this.recovery.remainingAmount = this.amount;
  }
  next();
});

// Method to approve advance
salaryAdvanceSchema.methods.approve = async function(approvedBy) {
  this.status = 'Approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return await this.save();
};

// Method to reject advance
salaryAdvanceSchema.methods.reject = async function(approvedBy, reason) {
  this.status = 'Rejected';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return await this.save();
};

// Method to record recovery
salaryAdvanceSchema.methods.recordRecovery = async function(month, year, amount, salarySlipId) {
  this.recovery.recoveredMonths.push({
    month,
    year,
    amount,
    salarySlipId,
    recoveredAt: new Date()
  });
  
  this.recovery.totalRecovered += amount;
  this.recovery.remainingAmount = this.amount - this.recovery.totalRecovered;
  
  if (this.recovery.remainingAmount <= 0) {
    this.status = 'Recovered';
  } else {
    this.status = 'Recovering';
  }
  
  return await this.save();
};

// Static method to get pending advances for employee
salaryAdvanceSchema.statics.getPendingAdvances = async function(employeeId) {
  return await this.find({
    employeeId,
    status: { $in: ['Approved', 'Recovering'] },
    'recovery.remainingAmount': { $gt: 0 }
  }).sort({ advanceDate: 1 });
};

// Static method to get total pending amount for employee
salaryAdvanceSchema.statics.getTotalPendingAmount = async function(employeeId) {
  const result = await this.aggregate([
    {
      $match: {
        employeeId: mongoose.Types.ObjectId(employeeId),
        status: { $in: ['Approved', 'Recovering'] },
        'recovery.remainingAmount': { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalPending: { $sum: '$recovery.remainingAmount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalPending : 0;
};

// Static method to get monthly summary
salaryAdvanceSchema.statics.getMonthlySummary = async function(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return await this.aggregate([
    {
      $match: {
        advanceDate: { $gte: startDate, $lte: endDate }
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

const SalaryAdvance = mongoose.model('SalaryAdvance', salaryAdvanceSchema);

export default SalaryAdvance;
