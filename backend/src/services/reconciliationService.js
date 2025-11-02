/**
 * Reconciliation Service
 * Handles reconciliation between expected (PDF) and actual (driver app) totals
 */

import PickListExtracted from '../models/PickListExtracted.js';
import CashCollection from '../models/CashCollection.js';
import Product from '../models/Product.js';

/**
 * Reconcile pick list with cash collection
 * @param {String} pickListId - Pick list ID
 * @param {String} collectionId - Cash collection ID
 * @returns {Object} - Reconciliation result
 */
export const reconcilePickList = async (pickListId, collectionId) => {
  try {
    const pickList = await PickListExtracted.findById(pickListId);
    const collection = await CashCollection.findById(collectionId);
    
    if (!pickList) {
      throw new Error('Pick list not found');
    }
    
    if (!collection) {
      throw new Error('Cash collection not found');
    }
    
    // Calculate expected total from PDF (pick list)
    let expectedTotal = 0;
    const itemBreakdown = [];
    
    for (const item of pickList.items) {
      const product = await Product.findOne({ code: item.itemCode });
      const itemExpectedQty = item.sellQty || 0;
      const itemPrice = product ? (product.pricePerUnit || item.mrp || 0) : (item.mrp || 0);
      const itemTotal = itemExpectedQty * itemPrice;
      
      expectedTotal += itemTotal;
      
      itemBreakdown.push({
        itemCode: item.itemCode,
        itemName: item.itemName,
        expectedQty: itemExpectedQty,
        pricePerUnit: itemPrice,
        expectedTotal: itemTotal
      });
    }
    
    // Calculate actual total from driver app (cash collection)
    const actualTotal = 
      (collection.totalCashCollected || 0) +
      (collection.totalChequeReceived || 0) +
      (collection.totalOnlineReceived || 0) +
      (collection.totalCreditGiven || 0);
    
    // Calculate variance
    const variance = actualTotal - expectedTotal;
    const variancePercentage = expectedTotal > 0 ? ((variance / expectedTotal) * 100).toFixed(2) : 0;
    
    // Determine status
    let status = 'MATCHED';
    const toleranceAmount = 100; // ₹100 tolerance
    const tolerancePercentage = 2; // 2% tolerance
    
    if (Math.abs(variance) > toleranceAmount && Math.abs(variancePercentage) > tolerancePercentage) {
      status = variance > 0 ? 'EXCESS' : 'SHORTAGE';
    }
    
    // Update pick list
    pickList.expectedTotal = expectedTotal;
    pickList.actualTotal = actualTotal;
    pickList.variance = variance;
    pickList.variancePercentage = parseFloat(variancePercentage);
    pickList.isReconciled = true;
    pickList.reconciledAt = new Date();
    pickList.collectionId = collectionId;
    await pickList.save();
    
    // Update cash collection
    collection.pickListId = pickListId;
    await collection.save();
    
    const reconciliationResult = {
      pickListNumber: pickList.pickListNumber,
      vehicleNumber: pickList.vehicleNumber,
      loadOutDate: pickList.loadOutDate,
      expectedTotal,
      actualTotal,
      variance,
      variancePercentage: parseFloat(variancePercentage),
      status,
      breakdown: {
        cash: collection.totalCashCollected || 0,
        cheque: collection.totalChequeReceived || 0,
        online: collection.totalOnlineReceived || 0,
        credit: collection.totalCreditGiven || 0
      },
      itemBreakdown,
      reconciledAt: pickList.reconciledAt
    };
    
    console.log(`✅ Reconciliation completed: Expected ₹${expectedTotal}, Actual ₹${actualTotal}, Variance ₹${variance} (${status})`);
    
    return reconciliationResult;
    
  } catch (error) {
    console.error('❌ Reconciliation failed:', error);
    throw error;
  }
};

/**
 * Auto-reconcile pick list with collection by driver and date
 * @param {String} driverId - Driver ID
 * @param {Date} date - Collection date
 * @returns {Object} - Reconciliation result
 */
export const autoReconcileByDriverAndDate = async (driverId, date) => {
  try {
    // Find pick list by driver and date (match salesman or vehicle)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find collection
    const collection = await CashCollection.findOne({
      driverId,
      collectionDate: { $gte: startOfDay, $lte: endOfDay }
    });
    
    if (!collection) {
      throw new Error('Cash collection not found for driver and date');
    }
    
    // Find pick list (assuming vehicle or salesman matches driver)
    // This requires driver to have vehicle number or name matching
    const pickList = await PickListExtracted.findOne({
      loadOutDate: { $gte: startOfDay, $lte: endOfDay },
      isReconciled: false
    }).sort({ loadOutDate: -1 });
    
    if (!pickList) {
      throw new Error('Pick list not found for date');
    }
    
    // Perform reconciliation
    return await reconcilePickList(pickList._id, collection._id);
    
  } catch (error) {
    console.error('❌ Auto reconciliation failed:', error);
    throw error;
  }
};

/**
 * Get reconciliation reports with filters
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Reconciliation reports
 */
export const getReconciliationReports = async (filters = {}) => {
  try {
    const query = { isReconciled: true };
    
    if (filters.startDate && filters.endDate) {
      query.loadOutDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    if (filters.vehicleNumber) {
      query.vehicleNumber = { $regex: filters.vehicleNumber, $options: 'i' };
    }
    
    if (filters.varianceStatus) {
      if (filters.varianceStatus === 'SHORTAGE') {
        query.variance = { $lt: -100 };
      } else if (filters.varianceStatus === 'EXCESS') {
        query.variance = { $gt: 100 };
      } else if (filters.varianceStatus === 'MATCHED') {
        query.variance = { $gte: -100, $lte: 100 };
      }
    }
    
    const reports = await PickListExtracted.find(query)
      .populate('collectionId', 'totalCashCollected totalChequeReceived totalOnlineReceived totalCreditGiven')
      .populate('reconciledBy', 'name')
      .sort({ reconciledAt: -1 });
    
    return reports.map(report => ({
      _id: report._id,
      pickListNumber: report.pickListNumber,
      vehicleNumber: report.vehicleNumber,
      loadOutDate: report.loadOutDate,
      salesMan: report.salesMan,
      expectedTotal: report.expectedTotal,
      actualTotal: report.actualTotal,
      variance: report.variance,
      variancePercentage: report.variancePercentage,
      status: report.variance === 0 ? 'MATCHED' : (report.variance > 0 ? 'EXCESS' : 'SHORTAGE'),
      reconciledAt: report.reconciledAt,
      collection: report.collectionId
    }));
    
  } catch (error) {
    console.error('❌ Get reconciliation reports failed:', error);
    throw error;
  }
};

/**
 * Get reconciliation statistics
 * @param {Object} filters - Filter criteria
 * @returns {Object} - Reconciliation statistics
 */
export const getReconciliationStatistics = async (filters = {}) => {
  try {
    const query = { isReconciled: true };
    
    if (filters.startDate && filters.endDate) {
      query.loadOutDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    const stats = await PickListExtracted.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalReconciled: { $sum: 1 },
          totalExpected: { $sum: '$expectedTotal' },
          totalActual: { $sum: '$actualTotal' },
          totalVariance: { $sum: '$variance' },
          avgVariancePercentage: { $avg: '$variancePercentage' },
          maxVariance: { $max: '$variance' },
          minVariance: { $min: '$variance' }
        }
      }
    ]);
    
    const matchedCount = await PickListExtracted.countDocuments({
      ...query,
      variance: { $gte: -100, $lte: 100 }
    });
    
    const shortageCount = await PickListExtracted.countDocuments({
      ...query,
      variance: { $lt: -100 }
    });
    
    const excessCount = await PickListExtracted.countDocuments({
      ...query,
      variance: { $gt: 100 }
    });
    
    return {
      ...(stats[0] || {
        totalReconciled: 0,
        totalExpected: 0,
        totalActual: 0,
        totalVariance: 0,
        avgVariancePercentage: 0,
        maxVariance: 0,
        minVariance: 0
      }),
      matchedCount,
      shortageCount,
      excessCount,
      matchPercentage: stats[0] ? ((matchedCount / stats[0].totalReconciled) * 100).toFixed(2) : 0
    };
    
  } catch (error) {
    console.error('❌ Get reconciliation statistics failed:', error);
    throw error;
  }
};

/**
 * Get variance breakdown by reason
 * @param {String} pickListId - Pick list ID
 * @returns {Object} - Variance breakdown
 */
export const getVarianceBreakdown = async (pickListId) => {
  try {
    const pickList = await PickListExtracted.findById(pickListId)
      .populate('collectionId');
    
    if (!pickList || !pickList.isReconciled) {
      throw new Error('Pick list not reconciled');
    }
    
    const collection = pickList.collectionId;
    
    // Analyze variance reasons
    const breakdown = {
      totalVariance: pickList.variance,
      reasons: []
    };
    
    // Check for credit given
    if (collection.totalCreditGiven > 0) {
      breakdown.reasons.push({
        reason: 'Credit Given to Customers',
        amount: collection.totalCreditGiven,
        percentage: ((collection.totalCreditGiven / Math.abs(pickList.variance)) * 100).toFixed(2)
      });
    }
    
    // Check for returns (from RGB tracking)
    if (pickList.returnedFullCrates > 0) {
      const returnValue = pickList.returnedFullCrates * 500; // Estimate ₹500/crate
      breakdown.reasons.push({
        reason: 'Full Crates Returned (Unsold)',
        amount: returnValue,
        percentage: ((returnValue / Math.abs(pickList.variance)) * 100).toFixed(2)
      });
    }
    
    // Check for damages (if implemented)
    // breakdown.reasons.push({ reason: 'Damaged Items', amount: 0 });
    
    // Remaining unexplained variance
    const explainedAmount = breakdown.reasons.reduce((sum, r) => sum + r.amount, 0);
    const unexplained = pickList.variance - explainedAmount;
    
    if (Math.abs(unexplained) > 10) {
      breakdown.reasons.push({
        reason: 'Unexplained Variance',
        amount: unexplained,
        percentage: ((Math.abs(unexplained) / Math.abs(pickList.variance)) * 100).toFixed(2)
      });
    }
    
    return breakdown;
    
  } catch (error) {
    console.error('❌ Get variance breakdown failed:', error);
    throw error;
  }
};

export default {
  reconcilePickList,
  autoReconcileByDriverAndDate,
  getReconciliationReports,
  getReconciliationStatistics,
  getVarianceBreakdown
};
