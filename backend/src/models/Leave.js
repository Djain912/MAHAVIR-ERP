/**
 * Leave Model
 * Tracks employee leave applications and approvals
 */

import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  // Employee reference
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  
  // Leave type
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave', 'Emergency Leave', 'Half Day'],
    required: true
  },
  
  // Leave dates
  fromDate: {
    type: Date,
    required: true
  },
  
  toDate: {
    type: Date,
    required: true
  },
  
  // Number of days
  numberOfDays: {
    type: Number,
    required: true,
    min: 0.5
  },
  
  // Reason for leave
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
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
  
  // Is this leave paid or unpaid
  isPaid: {
    type: Boolean,
    default: function() {
      return ['Sick Leave', 'Casual Leave', 'Paid Leave'].includes(this.leaveType);
    }
  },
  
  // Applied date
  appliedDate: {
    type: Date,
    default: Date.now
  },
  
  // Remarks
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });
leaveSchema.index({ status: 1, appliedDate: -1 });

// Pre-save middleware to calculate number of days
leaveSchema.pre('save', function(next) {
  if (this.isModified('fromDate') || this.isModified('toDate')) {
    const diffTime = Math.abs(this.toDate - this.fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (this.leaveType === 'Half Day') {
      this.numberOfDays = 0.5;
    } else {
      this.numberOfDays = diffDays;
    }
  }
  next();
});

// Method to approve leave
leaveSchema.methods.approve = async function(approvedBy, remarks = '') {
  this.status = 'Approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  if (remarks) this.remarks = remarks;
  return await this.save();
};

// Method to reject leave
leaveSchema.methods.reject = async function(approvedBy, reason) {
  this.status = 'Rejected';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return await this.save();
};

// Static method to get leave balance for employee
leaveSchema.statics.getLeaveBalance = async function(employeeId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
  
  const leaves = await this.find({
    employeeId,
    status: 'Approved',
    fromDate: { $gte: startDate, $lte: endDate }
  });
  
  const balance = {
    sickLeave: { used: 0, total: 12 },
    casualLeave: { used: 0, total: 12 },
    paidLeave: { used: 0, total: 15 },
    unpaidLeave: { used: 0 },
    totalUsed: 0
  };
  
  leaves.forEach(leave => {
    balance.totalUsed += leave.numberOfDays;
    
    switch(leave.leaveType) {
      case 'Sick Leave':
        balance.sickLeave.used += leave.numberOfDays;
        break;
      case 'Casual Leave':
        balance.casualLeave.used += leave.numberOfDays;
        break;
      case 'Paid Leave':
        balance.paidLeave.used += leave.numberOfDays;
        break;
      case 'Unpaid Leave':
        balance.unpaidLeave.used += leave.numberOfDays;
        break;
    }
  });
  
  balance.sickLeave.remaining = Math.max(0, balance.sickLeave.total - balance.sickLeave.used);
  balance.casualLeave.remaining = Math.max(0, balance.casualLeave.total - balance.casualLeave.used);
  balance.paidLeave.remaining = Math.max(0, balance.paidLeave.total - balance.paidLeave.used);
  
  return balance;
};

// Static method to get monthly leave summary
leaveSchema.statics.getMonthlySummary = async function(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  return await this.aggregate([
    {
      $match: {
        $or: [
          { fromDate: { $gte: startDate, $lte: endDate } },
          { toDate: { $gte: startDate, $lte: endDate } },
          { fromDate: { $lte: startDate }, toDate: { $gte: endDate } }
        ]
      }
    },
    {
      $group: {
        _id: {
          employeeId: '$employeeId',
          leaveType: '$leaveType',
          status: '$status'
        },
        count: { $sum: 1 },
        totalDays: { $sum: '$numberOfDays' }
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: '_id.employeeId',
        foreignField: '_id',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    }
  ]);
};

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
