/**
 * RGB (Returnable Glass Bottles) Tracking Service
 * Handles RGB returns, empty bottle tracking, and penalty calculations
 */

import RGBTracking from '../models/RGBTracking.js';
import PickListExtracted from '../models/PickListExtracted.js';
import Product from '../models/Product.js';
import { addBackReturnedStock } from './stockService.js';

/**
 * Process RGB returns from driver
 * @param {Object} rgbData - RGB return data
 * @returns {Object} - RGB tracking record
 */
export const processRGBReturns = async (rgbData) => {
  try {
    const { pickListId, driverId, returnedFullCrates, returnedEmptyCrates } = rgbData;
    
    // Get pick list
    const pickList = await PickListExtracted.findById(pickListId);
    
    if (!pickList) {
      throw new Error('Pick list not found');
    }
    
    const totalLoaded = pickList.totalLoQty || 0;
    const expectedSold = pickList.totalSellQty || 0;
    
    // Calculate actual sold
    const actualSold = totalLoaded - (returnedFullCrates || 0);
    
    // Calculate expected and missing empties
    const expectedEmpties = actualSold;
    const missingEmpties = Math.max(0, expectedEmpties - (returnedEmptyCrates || 0));
    
    // Create or update RGB tracking record
    let rgbTracking = await RGBTracking.findOne({ pickListId, driverId });
    
    if (rgbTracking) {
      // Update existing record
      rgbTracking.totalLoadedCrates = totalLoaded;
      rgbTracking.totalSoldCrates = actualSold;
      rgbTracking.returnedFullCrates = returnedFullCrates || 0;
      rgbTracking.expectedEmptyCrates = expectedEmpties;
      rgbTracking.returnedEmptyCrates = returnedEmptyCrates || 0;
      rgbTracking.missingEmptyCrates = missingEmpties;
      rgbTracking.status = 'submitted';
      rgbTracking.submittedAt = new Date();
    } else {
      // Create new record
      rgbTracking = new RGBTracking({
        pickListId,
        driverId,
        date: new Date(),
        totalLoadedCrates: totalLoaded,
        totalSoldCrates: actualSold,
        returnedFullCrates: returnedFullCrates || 0,
        expectedEmptyCrates: expectedEmpties,
        returnedEmptyCrates: returnedEmptyCrates || 0,
        missingEmptyCrates: missingEmpties,
        emptyBottleValue: 50, // ₹50 per empty crate (configurable)
        status: 'submitted',
        submittedAt: new Date()
      });
    }
    
    // Process item-wise returns
    const itemReturns = [];
    
    for (const item of pickList.items) {
      const itemLoadedQty = item.loQty || 0;
      const itemReturnedFullQty = Math.floor((itemLoadedQty / totalLoaded) * (returnedFullCrates || 0));
      const itemSoldQty = itemLoadedQty - itemReturnedFullQty;
      const itemReturnedEmptyQty = Math.floor((itemSoldQty / actualSold) * (returnedEmptyCrates || 0));
      const itemMissingEmptyQty = Math.max(0, itemSoldQty - itemReturnedEmptyQty);
      
      // Get product to calculate penalty
      const product = await Product.findOne({ code: item.itemCode });
      const penaltyPerUnit = product ? (product.pricePerUnit * 0.1) : 5; // 10% of unit price or ₹5
      
      itemReturns.push({
        itemCode: item.itemCode,
        itemName: item.itemName,
        loadedQty: itemLoadedQty,
        soldQty: itemSoldQty,
        returnedFullQty: itemReturnedFullQty,
        returnedEmptyQty: itemReturnedEmptyQty,
        missingEmptyQty: itemMissingEmptyQty,
        penaltyPerUnit
      });
      
      // Update item in pick list
      item.actualSoldQty = itemSoldQty;
      item.returnedFullQty = itemReturnedFullQty;
      item.returnedEmptyQty = itemReturnedEmptyQty;
      item.missingEmptyQty = itemMissingEmptyQty;
    }
    
    rgbTracking.itemReturns = itemReturns;
    await rgbTracking.save();
    
    // Update pick list
    pickList.returnedFullCrates = returnedFullCrates || 0;
    pickList.returnedEmptyCrates = returnedEmptyCrates || 0;
    pickList.missingEmptyCrates = missingEmpties;
    pickList.actualSold = actualSold;
    pickList.returnStatus = (returnedFullCrates > 0 || returnedEmptyCrates > 0) ? 'partial' : 'pending';
    await pickList.save();
    
    // Add full crates back to stock if any
    if (returnedFullCrates > 0) {
      await addBackReturnedStock(pickListId, returnedFullCrates);
      console.log(`✅ Added back ${returnedFullCrates} full crates to stock`);
    }
    
    console.log(`✅ RGB returns processed: ${returnedFullCrates} full, ${returnedEmptyCrates} empty, ${missingEmpties} missing`);
    
    return rgbTracking;
    
  } catch (error) {
    console.error('❌ RGB returns processing failed:', error);
    throw error;
  }
};

/**
 * Get RGB tracking records with filters
 * @param {Object} filters - Filter criteria
 * @returns {Array} - RGB tracking records
 */
export const getRGBTrackingRecords = async (filters = {}) => {
  try {
    const query = { active: true };
    
    if (filters.driverId) {
      query.driverId = filters.driverId;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    const records = await RGBTracking.find(query)
      .populate('pickListId', 'pickListNumber vehicleNumber loadOutDate')
      .populate('driverId', 'name phone')
      .populate('verifiedBy', 'name')
      .sort({ date: -1 });
    
    return records;
    
  } catch (error) {
    console.error('❌ Get RGB tracking records failed:', error);
    throw error;
  }
};

/**
 * Get RGB tracking by ID
 * @param {String} rgbTrackingId - RGB tracking ID
 * @returns {Object} - RGB tracking record
 */
export const getRGBTrackingById = async (rgbTrackingId) => {
  try {
    const rgbTracking = await RGBTracking.findById(rgbTrackingId)
      .populate('pickListId', 'pickListNumber vehicleNumber loadOutDate salesMan route')
      .populate('driverId', 'name phone')
      .populate('verifiedBy', 'name')
      .populate('disputeResolvedBy', 'name');
    
    if (!rgbTracking) {
      throw new Error('RGB tracking record not found');
    }
    
    return rgbTracking;
    
  } catch (error) {
    console.error('❌ Get RGB tracking by ID failed:', error);
    throw error;
  }
};

/**
 * Verify RGB returns
 * @param {String} rgbTrackingId - RGB tracking ID
 * @param {String} verifiedById - Verifier user ID
 * @returns {Object} - Updated RGB tracking record
 */
export const verifyRGBReturns = async (rgbTrackingId, verifiedById) => {
  try {
    const rgbTracking = await RGBTracking.findById(rgbTrackingId);
    
    if (!rgbTracking) {
      throw new Error('RGB tracking record not found');
    }
    
    if (rgbTracking.status !== 'submitted') {
      throw new Error(`Cannot verify RGB returns with status: ${rgbTracking.status}`);
    }
    
    await rgbTracking.markAsVerified(verifiedById);
    
    console.log(`✅ RGB returns verified for pick list: ${rgbTracking.pickListId}`);
    
    return rgbTracking;
    
  } catch (error) {
    console.error('❌ Verify RGB returns failed:', error);
    throw error;
  }
};

/**
 * Settle RGB returns (mark penalties paid)
 * @param {String} rgbTrackingId - RGB tracking ID
 * @returns {Object} - Updated RGB tracking record
 */
export const settleRGBReturns = async (rgbTrackingId) => {
  try {
    const rgbTracking = await RGBTracking.findById(rgbTrackingId);
    
    if (!rgbTracking) {
      throw new Error('RGB tracking record not found');
    }
    
    if (rgbTracking.status !== 'verified') {
      throw new Error(`Cannot settle RGB returns with status: ${rgbTracking.status}`);
    }
    
    await rgbTracking.markAsSettled();
    
    // Update pick list return status
    const pickList = await PickListExtracted.findById(rgbTracking.pickListId);
    if (pickList) {
      pickList.returnStatus = 'complete';
      await pickList.save();
    }
    
    console.log(`✅ RGB returns settled for pick list: ${rgbTracking.pickListId}`);
    
    return rgbTracking;
    
  } catch (error) {
    console.error('❌ Settle RGB returns failed:', error);
    throw error;
  }
};

/**
 * Raise dispute for RGB returns
 * @param {String} rgbTrackingId - RGB tracking ID
 * @param {String} disputeReason - Reason for dispute
 * @returns {Object} - Updated RGB tracking record
 */
export const raiseRGBDispute = async (rgbTrackingId, disputeReason) => {
  try {
    const rgbTracking = await RGBTracking.findById(rgbTrackingId);
    
    if (!rgbTracking) {
      throw new Error('RGB tracking record not found');
    }
    
    await rgbTracking.raiseDispute(disputeReason);
    
    console.log(`⚠️ RGB dispute raised for pick list: ${rgbTracking.pickListId}`);
    
    return rgbTracking;
    
  } catch (error) {
    console.error('❌ Raise RGB dispute failed:', error);
    throw error;
  }
};

/**
 * Get RGB statistics
 * @param {Object} filters - Filter criteria
 * @returns {Object} - RGB statistics
 */
export const getRGBStatistics = async (filters = {}) => {
  try {
    const query = { active: true };
    
    if (filters.driverId) {
      query.driverId = filters.driverId;
    }
    
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    const stats = await RGBTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalLoadedCrates: { $sum: '$totalLoadedCrates' },
          totalSoldCrates: { $sum: '$totalSoldCrates' },
          totalReturnedFullCrates: { $sum: '$returnedFullCrates' },
          totalReturnedEmptyCrates: { $sum: '$returnedEmptyCrates' },
          totalMissingEmptyCrates: { $sum: '$missingEmptyCrates' },
          totalPenaltyAmount: { $sum: '$penaltyAmount' },
          avgReturnRate: { $avg: { $divide: ['$returnedFullCrates', '$totalLoadedCrates'] } }
        }
      }
    ]);
    
    const statusCounts = await RGBTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusBreakdown = {};
    statusCounts.forEach(item => {
      statusBreakdown[item._id] = item.count;
    });
    
    return {
      ...(stats[0] || {
        totalRecords: 0,
        totalLoadedCrates: 0,
        totalSoldCrates: 0,
        totalReturnedFullCrates: 0,
        totalReturnedEmptyCrates: 0,
        totalMissingEmptyCrates: 0,
        totalPenaltyAmount: 0,
        avgReturnRate: 0
      }),
      statusBreakdown
    };
    
  } catch (error) {
    console.error('❌ Get RGB statistics failed:', error);
    throw error;
  }
};

export default {
  processRGBReturns,
  getRGBTrackingRecords,
  getRGBTrackingById,
  verifyRGBReturns,
  settleRGBReturns,
  raiseRGBDispute,
  getRGBStatistics
};
