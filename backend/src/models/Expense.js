/**
 * Expense Model
 * Track daily expenses with categories and cash denominations
 */

import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  // Date of expense
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Expense category/header
  category: {
    type: String,
    enum: [
      'COIN',
      'TEA',
      'Loder Lunch',
      'Extra Loder',
      'Office Supplies',
      'Transport',
      'Maintenance',
      'Utilities',
      'Salary Advance',
      'Petty Cash',
      'Other'
    ],
    required: true
  },
  
  // Sub-category or description
  subCategory: {
    type: String,
    trim: true
  },
  
  // Description of expense
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Total amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Cash denominations breakdown
  denominations: {
    note2000: { type: Number, default: 0 },
    note500: { type: Number, default: 0 },
    note200: { type: Number, default: 0 },
    note100: { type: Number, default: 0 },
    note50: { type: Number, default: 0 },
    note20: { type: Number, default: 0 },
    note10: { type: Number, default: 0 },
    coin10: { type: Number, default: 0 },
    coin5: { type: Number, default: 0 },
    coin2: { type: Number, default: 0 },
    coin1: { type: Number, default: 0 }
  },
  
  // Payment mode
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'],
    default: 'Cash'
  },
  
  // Reference number for digital payments
  paymentReference: {
    type: String,
    trim: true
  },
  
  // Paid to
  paidTo: {
    type: String,
    trim: true
  },
  
  // Approved by
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  
  // Remarks
  remarks: {
    type: String,
    trim: true
  },
  
  // Receipt/Bill attached
  hasReceipt: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Approved'
  }
}, {
  timestamps: true
});

// Indexes
expenseSchema.index({ date: 1, category: 1 });
expenseSchema.index({ createdBy: 1, date: -1 });
expenseSchema.index({ status: 1 });

// Virtual to calculate total from denominations
expenseSchema.virtual('denominationTotal').get(function() {
  const d = this.denominations;
  return (
    (d.note2000 * 2000) +
    (d.note500 * 500) +
    (d.note200 * 200) +
    (d.note100 * 100) +
    (d.note50 * 50) +
    (d.note20 * 20) +
    (d.note10 * 10) +
    (d.coin10 * 10) +
    (d.coin5 * 5) +
    (d.coin2 * 2) +
    (d.coin1 * 1)
  );
});

// Static method to get daily summary
expenseSchema.statics.getDailySummary = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const summary = await this.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'Approved'
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
  
  const total = summary.reduce((sum, item) => sum + item.totalAmount, 0);
  
  return { summary, total };
};

// Static method to get monthly summary
expenseSchema.statics.getMonthlySummary = async function(month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  const summary = await this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        status: 'Approved'
      }
    },
    {
      $group: {
        _id: {
          category: '$category',
          day: { $dayOfMonth: '$date' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.day': 1 }
    }
  ]);
  
  return summary;
};

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
