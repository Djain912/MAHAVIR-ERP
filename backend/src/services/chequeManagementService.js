/**
 * Cheque Management Service
 * Business logic for cheque tracking and status management
 */

import ChequeManagement from '../models/ChequeManagement.js';
import Sale from '../models/Sale.js';
import Retailer from '../models/Retailer.js';
import Driver from '../models/Driver.js';
import mongoose from 'mongoose';

/**
 * Import cheques from sales
 * Run this to sync existing sale cheques to cheque management
 */
export const importChequesFromSales = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find all sales with cheques
    const sales = await Sale.find({
      'payments.cheque': { $exists: true, $ne: [] }
    }).populate('retailerId driverId');

    let imported = 0;
    
    for (const sale of sales) {
      for (const cheque of sale.payments.cheque) {
        // Check if already imported
        const exists = await ChequeManagement.findOne({
          chequeNumber: cheque.chequeNumber
        });
        
        if (!exists) {
          await ChequeManagement.create([{
            chequeNumber: cheque.chequeNumber,
            amount: cheque.amount,
            depositDate: cheque.uploadedAt || sale.saleDate,
            bankName: cheque.bankName || 'Not Specified',
            chequePhotoUrl: cheque.photoUrl,
            saleId: sale._id,
            retailerId: sale.retailerId,
            driverId: sale.driverId,
            status: 'Deposited',
            depositedAt: cheque.uploadedAt || sale.saleDate
          }], { session });
          
          imported++;
        }
      }
    }

    await session.commitTransaction();
    return { imported };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get all cheques with filters
 */
export const getAllCheques = async (filters = {}) => {
  const {
    startDate,
    endDate,
    status,
    bankName,
    retailerId,
    driverId,
    chequeNumber,
    page = 1,
    limit = 50,
    sortBy = 'depositDate',
    sortOrder = 'desc'
  } = filters;

  // Build query
  const query = {};

  if (startDate || endDate) {
    query.depositDate = {};
    if (startDate) query.depositDate.$gte = new Date(startDate);
    if (endDate) query.depositDate.$lte = new Date(endDate);
  }

  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  if (bankName) {
    query.bankName = new RegExp(bankName, 'i');
  }

  if (retailerId) query.retailerId = retailerId;
  if (driverId) query.driverId = driverId;
  if (chequeNumber) {
    query.chequeNumber = new RegExp(chequeNumber, 'i');
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [cheques, total] = await Promise.all([
    ChequeManagement.find(query)
      .populate('retailerId', 'name phone address')
      .populate('driverId', 'name phone')
      .populate('depositedBy', 'name')
      .populate('clearedBy', 'name')
      .populate('bouncedBy', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    ChequeManagement.countDocuments(query)
  ]);

  return {
    cheques,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get cheque summary for date range
 */
export const getChequeSummary = async (startDate, endDate) => {
  const summary = await ChequeManagement.getSummary(startDate, endDate);
  
  // Calculate totals
  const totals = {
    totalCheques: 0,
    totalAmount: 0,
    pending: { count: 0, amount: 0 },
    deposited: { count: 0, amount: 0 },
    cleared: { count: 0, amount: 0 },
    bounced: { count: 0, amount: 0 }
  };

  summary.forEach(item => {
    totals.totalCheques += item.count;
    totals.totalAmount += item.totalAmount;
    
    const status = item._id.toLowerCase();
    if (totals[status]) {
      totals[status].count = item.count;
      totals[status].amount = item.totalAmount;
    }
  });

  return totals;
};

/**
 * Get bank-wise summary
 */
export const getBankWiseSummary = async (startDate, endDate) => {
  return await ChequeManagement.getBankWiseSummary(startDate, endDate);
};

/**
 * Update single cheque status
 */
export const updateChequeStatus = async (chequeId, status, userId, remarks = '') => {
  const cheque = await ChequeManagement.findById(chequeId);
  
  if (!cheque) {
    throw new Error('Cheque not found');
  }

  // Validate status transition
  const validTransitions = {
    'Pending': ['Deposited', 'Cancelled'],
    'Deposited': ['Cleared', 'Bounced', 'Cancelled'],
    'Cleared': [], // Final state
    'Bounced': ['Deposited'], // Can re-deposit
    'Cancelled': [] // Final state
  };

  if (!validTransitions[cheque.status].includes(status)) {
    throw new Error(`Cannot change status from ${cheque.status} to ${status}`);
  }

  // Set modifier for pre-save hook
  cheque.modifiedBy = userId;
  cheque.statusChangeRemarks = remarks;
  cheque.status = status;
  
  if (status === 'Bounced') {
    cheque.bounceReason = remarks;
  }

  await cheque.save();
  return cheque;
};

/**
 * Bulk update cheque status (for select all → mark cleared)
 */
export const bulkUpdateChequeStatus = async (chequeIds, status, userId, remarks = '') => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const chequeId of chequeIds) {
      try {
        await updateChequeStatus(chequeId, status, userId, remarks);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          chequeId,
          error: error.message
        });
      }
    }

    await session.commitTransaction();
    return results;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Create new cheque entry
 */
export const createCheque = async (chequeData) => {
  // Verify sale exists
  const sale = await Sale.findById(chequeData.saleId);
  if (!sale) {
    throw new Error('Sale not found');
  }

  const cheque = await ChequeManagement.create(chequeData);
  return cheque;
};

/**
 * Get cheque by ID
 */
export const getChequeById = async (chequeId) => {
  const cheque = await ChequeManagement.findById(chequeId)
    .populate('retailerId', 'name phone address route')
    .populate('driverId', 'name phone vehicleNumber')
    .populate('saleId')
    .populate({
      path: 'statusHistory.changedBy',
      select: 'name'
    });

  if (!cheque) {
    throw new Error('Cheque not found');
  }

  return cheque;
};

/**
 * Delete cheque (admin only)
 */
export const deleteCheque = async (chequeId) => {
  const cheque = await ChequeManagement.findById(chequeId);
  
  if (!cheque) {
    throw new Error('Cheque not found');
  }

  if (cheque.status === 'Cleared') {
    throw new Error('Cannot delete cleared cheque');
  }

  await cheque.deleteOne();
  return { message: 'Cheque deleted successfully' };
};

/**
 * Get cheque statistics for dashboard
 */
export const getChequeStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const [todayStats, monthStats, pendingStats, bouncedStats] = await Promise.all([
    // Today's cheques
    ChequeManagement.aggregate([
      {
        $match: {
          depositDate: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]),
    
    // This month
    ChequeManagement.aggregate([
      {
        $match: {
          depositDate: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]),
    
    // Pending cheques
    ChequeManagement.aggregate([
      {
        $match: { status: { $in: ['Pending', 'Deposited'] } }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]),
    
    // Bounced cheques (all time)
    ChequeManagement.aggregate([
      {
        $match: { status: 'Bounced' }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ])
  ]);

  return {
    today: todayStats,
    thisMonth: monthStats,
    pending: pendingStats[0] || { count: 0, amount: 0 },
    bounced: bouncedStats[0] || { count: 0, amount: 0 }
  };
};
