/**
 * Stock In Service
 * Business logic for warehouse stock intake management
 */

import StockIn from '../models/StockIn.js';
import Product from '../models/Product.js';
import Driver from '../models/Driver.js';
import PickListExtracted from '../models/PickListExtracted.js';
import mongoose from 'mongoose';

/**
 * Create stock intake entry
 */
export const createStockIn = async (stockData) => {
  // Verify product exists
  const product = await Product.findById(stockData.productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (!product.active) {
    throw new Error('Cannot add stock for inactive product');
  }
  
  // Check for duplicate batch number for same product
  const existingBatch = await StockIn.findOne({
    productId: stockData.productId,
    batchNo: stockData.batchNo
  });
  
  if (existingBatch) {
    throw new Error('Batch number already exists for this product');
  }
  
  const stockIn = new StockIn(stockData);
  await stockIn.save();
  
  // Populate product details
  await stockIn.populate('productId', 'name size pricePerUnit brandFullName');
  
  return stockIn;
};

/**
 * Get all stock intake records with filters
 */
export const getAllStockIn = async (filters = {}) => {
  const query = {};
  
  if (filters.productId) {
    query.productId = filters.productId;
  }
  
  if (filters.batchNo) {
    query.batchNo = { $regex: filters.batchNo, $options: 'i' };
  }
  
  if (filters.startDate && filters.endDate) {
    query.dateReceived = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  const stockRecords = await StockIn.find(query)
    .populate('productId', 'name size pricePerUnit category brandFullName')
    .sort({ dateReceived: -1 });
  
  // Transform productId to product for frontend compatibility
  return stockRecords.map(record => {
    const obj = record.toObject();
    obj.product = obj.productId;
    return obj;
  });
};

/**
 * Get stock by ID
 */
export const getStockById = async (stockId) => {
  const stock = await StockIn.findById(stockId)
    .populate('productId', 'name size pricePerUnit brandFullName')
    .lean();
  
  if (!stock) {
    throw new Error('Stock record not found');
  }
  
  return stock;
};

/**
 * Get available stock summary by product
 */
export const getAvailableStockSummary = async () => {
  const summary = await StockIn.aggregate([
    {
      $match: { remainingQuantity: { $gt: 0 } }
    },
    {
      $group: {
        _id: '$productId',
        totalQuantity: { $sum: '$remainingQuantity' },
        totalValue: {
          $sum: { $multiply: ['$remainingQuantity', '$ratePerUnit'] }
        },
        batches: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        productId: '$_id',
        productName: {
          $cond: {
            if: { $ne: ['$product.brandFullName', null] },
            then: '$product.brandFullName',
            else: {
              $cond: {
                if: { $ne: ['$product.name', null] },
                then: '$product.name',
                else: 'Unknown Product'
              }
            }
          }
        },
        productSize: {
          $cond: {
            if: { $ne: ['$product.ml', null] },
            then: '$product.ml',
            else: {
              $cond: {
                if: { $ne: ['$product.size', null] },
                then: '$product.size',
                else: '-'
              }
            }
          }
        },
        productCategory: {
          $cond: {
            if: { $ne: ['$product.brand', null] },
            then: '$product.brand',
            else: {
              $cond: {
                if: { $ne: ['$product.type', null] },
                then: '$product.type',
                else: '-'
              }
            }
          }
        },
        availableQuantity: '$totalQuantity',
        totalQuantity: 1,
        totalValue: 1,
        batches: 1
      }
    },
    {
      $sort: { productName: 1 }
    }
  ]);
  
  return summary;
};

/**
 * Get available stock for a specific product
 */
export const getAvailableStockByProduct = async (productId) => {
  const stockRecords = await StockIn.find({
    productId,
    remainingQuantity: { $gt: 0 }
  })
  .populate('productId', 'name size pricePerUnit brandFullName')
  .sort({ dateReceived: 1 }); // FIFO
  
  const totalAvailable = stockRecords.reduce((sum, record) => sum + record.remainingQuantity, 0);
  
  return {
    totalAvailable,
    records: stockRecords
  };
};

/**
 * Update stock quantity (used when dispatching to drivers)
 */
export const updateStockQuantity = async (stockId, quantityToDeduct) => {
  const stock = await StockIn.findById(stockId);
  
  if (!stock) {
    throw new Error('Stock record not found');
  }
  
  if (stock.remainingQuantity < quantityToDeduct) {
    throw new Error(`Insufficient stock. Available: ${stock.remainingQuantity}, Requested: ${quantityToDeduct}`);
  }
  
  stock.remainingQuantity -= quantityToDeduct;
  stock.updatedAt = Date.now();
  await stock.save();
  
  return stock;
};

/**
 * Get low stock alerts (less than threshold)
 */
export const getLowStockAlerts = async (threshold = 10) => {
  const lowStockProducts = await StockIn.aggregate([
    {
      $group: {
        _id: '$productId',
        totalRemaining: { $sum: '$remainingQuantity' }
      }
    },
    {
      $match: { totalRemaining: { $lt: threshold, $gt: 0 } }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        productId: '$_id',
        productName: '$product.name',
        productSize: '$product.size',
        remainingQuantity: '$totalRemaining'
      }
    },
    {
      $sort: { remainingQuantity: 1 }
    }
  ]);
  
  return lowStockProducts;
};

/**
 * Get stock intake statistics
 */
export const getStockStats = async (startDate, endDate) => {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.dateReceived = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await StockIn.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalStockValue: { $sum: '$totalValue' },
        totalQuantityReceived: { $sum: '$quantity' },
        totalQuantityRemaining: { $sum: '$remainingQuantity' },
        totalBatches: { $sum: 1 }
      }
    }
  ]);
  
  return stats[0] || {
    totalStockValue: 0,
    totalQuantityReceived: 0,
    totalQuantityRemaining: 0,
    totalBatches: 0
  };
};

/**
 * Mark stock as damaged/returned
 */
export const returnDamagedStock = async (stockId, damageReason, damagedQuantity, userId) => {
  const stock = await StockIn.findById(stockId);
  
  if (!stock) {
    throw new Error('Stock record not found');
  }
  
  if (stock.isDamaged) {
    throw new Error('This stock is already marked as damaged');
  }
  
  if (damagedQuantity > stock.remainingQuantity) {
    throw new Error(`Cannot return ${damagedQuantity} units. Only ${stock.remainingQuantity} units available`);
  }
  
  stock.isDamaged = true;
  stock.damageReason = damageReason;
  stock.damagedQuantity = damagedQuantity;
  stock.returnedAt = new Date();
  stock.returnedBy = userId;
  stock.remainingQuantity -= damagedQuantity; // Reduce available stock
  stock.updatedAt = Date.now();
  
  await stock.save();
  await stock.populate('productId', 'name size pricePerUnit brandFullName');
  await stock.populate('returnedBy', 'name phone');
  
  return stock;
};

/**
 * Get all damaged/returned stock
 */
export const getDamagedStock = async () => {
  const damagedStock = await StockIn.find({ isDamaged: true })
    .populate('productId', 'name size pricePerUnit category brandFullName')
    .populate('returnedBy', 'name phone role')
    .sort({ returnedAt: -1 });
  
  return damagedStock.map(record => {
    const obj = record.toObject();
    obj.product = obj.productId;
    return obj;
  });
};

/**
 * PICK LIST STOCK OPERATIONS
 */

/**
 * Reduce stock when pick list is loaded
 * Uses FIFO (First In First Out) method
 * @param {String} pickListId - Pick list ID
 * @returns {Object} - Result with success status and details
 */
export const reduceStockForPickList = async (pickListId) => {
  try {
    const pickList = await PickListExtracted.findById(pickListId);
    
    if (!pickList) {
      throw new Error('Pick list not found');
    }
    
    if (pickList.stockReduced) {
      return {
        success: true,
        message: 'Stock already reduced for this pick list',
        alreadyReduced: true
      };
    }
    
    const reductionLog = [];
    const insufficientStockItems = [];
    
    // Process each item in pick list
    for (const item of pickList.items) {
      try {
        // Extract actual product code from itemCode (remove prefix like "1.00.")
        // itemCode format: "1.00.DKO300" -> we need "DKO300"
        const actualCode = item.itemName || item.itemCode.split('.').pop();
        
        // Find product by item code
        // Some products have codes like "SPR200/SPR200P", so we search for codes that contain the actualCode
        const product = await Product.findOne({ 
          $or: [
            { code: actualCode },
            { code: { $regex: `^${actualCode}/`, $options: 'i' } },  // Match "SPR200/SPR200P" when searching for "SPR200"
            { code: { $regex: `/${actualCode}$`, $options: 'i' } }   // Match "SPR200P/SPR200" when searching for "SPR200"
          ]
        });
        
        if (!product) {
          console.warn(`⚠️ Product not found: ${actualCode} (from ${item.itemCode}) - ${item.itemName}`);
          insufficientStockItems.push({
            itemCode: item.itemCode,
            itemName: item.itemName,
            reason: 'Product not found in database'
          });
          continue;
        }
        
        // Find stock batches using FIFO (oldest first)
        const stockBatches = await StockIn.find({
          productId: product._id,
          remainingQuantity: { $gt: 0 }
        }).sort({ dateReceived: 1 }); // FIFO - oldest first
        
        // Calculate available stock
        const availableStock = stockBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
        
        if (availableStock < item.loQty) {
          insufficientStockItems.push({
            itemCode: item.itemCode,
            itemName: item.itemName,
            required: item.loQty,
            available: availableStock,
            shortage: item.loQty - availableStock
          });
          console.warn(`⚠️ Insufficient stock for ${item.itemName}: Need ${item.loQty}, Available ${availableStock}`);
          continue;
        }
        
        // Deduct from batches using FIFO
        let qtyToDeduct = item.loQty;
        const batchesUsed = [];
        
        for (const batch of stockBatches) {
          if (qtyToDeduct <= 0) break;
          
          const deductFromBatch = Math.min(qtyToDeduct, batch.remainingQuantity);
          
          batch.remainingQuantity -= deductFromBatch;
          await batch.save();
          
          batchesUsed.push({
            batchId: batch._id,
            batchNumber: batch.batchNumber,
            deducted: deductFromBatch,
            remaining: batch.remainingQuantity
          });
          
          qtyToDeduct -= deductFromBatch;
        }
        
        reductionLog.push({
          itemCode: item.itemCode,
          itemName: item.itemName,
          qtyDeducted: item.loQty,
          batchesUsed: batchesUsed.length,
          success: true
        });
        
        console.log(`✅ Stock reduced for ${item.itemName}: ${item.loQty} units from ${batchesUsed.length} batch(es)`);
        
      } catch (itemError) {
        console.error(`❌ Error processing item ${item.itemCode}:`, itemError.message);
        insufficientStockItems.push({
          itemCode: item.itemCode,
          itemName: item.itemName,
          reason: itemError.message
        });
      }
    }
    
    // Update pick list status
    if (insufficientStockItems.length === 0) {
      pickList.stockReduced = true;
      pickList.stockReducedAt = new Date();
      pickList.stockReductionError = null;
      await pickList.save();
      
      return {
        success: true,
        message: 'Stock reduced successfully for all items',
        pickListNumber: pickList.pickListNumber,
        itemsProcessed: reductionLog.length,
        reductionLog
      };
    } else {
      // Partial success
      const errorMessage = `Stock reduction incomplete. ${insufficientStockItems.length} item(s) have insufficient stock.`;
      pickList.stockReductionError = errorMessage;
      await pickList.save();
      
      return {
        success: false,
        message: errorMessage,
        pickListNumber: pickList.pickListNumber,
        itemsProcessed: reductionLog.length,
        itemsFailed: insufficientStockItems.length,
        reductionLog,
        insufficientStockItems
      };
    }
    
  } catch (error) {
    console.error('❌ Stock reduction failed:', error);
    throw error;
  }
};

/**
 * Add back stock when items are returned
 * @param {String} pickListId - Pick list ID
 * @param {Number} returnedFullCrates - Number of full crates returned
 * @returns {Object} - Result with success status
 */
export const addBackReturnedStock = async (pickListId, returnedFullCrates) => {
  try {
    const pickList = await PickListExtracted.findById(pickListId);
    
    if (!pickList) {
      throw new Error('Pick list not found');
    }
    
    if (returnedFullCrates <= 0) {
      return {
        success: true,
        message: 'No items to add back',
        itemsAdded: 0
      };
    }
    
    const addBackLog = [];
    
    // Calculate proportional return for each item
    for (const item of pickList.items) {
      try {
        const product = await Product.findOne({ code: item.itemCode });
        
        if (!product) {
          console.warn(`⚠️ Product not found: ${item.itemCode}`);
          continue;
        }
        
        // Calculate proportional quantity to add back
        const itemReturnedQty = Math.floor((item.loQty / pickList.totalLoQty) * returnedFullCrates);
        
        if (itemReturnedQty <= 0) continue;
        
        // Find latest batch (LIFO for returns)
        const latestBatch = await StockIn.findOne({
          productId: product._id
        }).sort({ dateReceived: -1 });
        
        if (latestBatch) {
          latestBatch.remainingQuantity += itemReturnedQty;
          await latestBatch.save();
          
          // Update item return tracking
          item.returnedFullQty = itemReturnedQty;
          
          addBackLog.push({
            itemCode: item.itemCode,
            itemName: item.itemName,
            qtyAdded: itemReturnedQty,
            batchNumber: latestBatch.batchNumber
          });
          
          console.log(`✅ Added back ${itemReturnedQty} units of ${item.itemName} to batch ${latestBatch.batchNumber}`);
        }
        
      } catch (itemError) {
        console.error(`❌ Error adding back item ${item.itemCode}:`, itemError.message);
      }
    }
    
    // Update pick list
    pickList.returnedFullCrates = returnedFullCrates;
    pickList.returnStatus = 'partial';
    await pickList.save();
    
    return {
      success: true,
      message: `Added back ${returnedFullCrates} crates to stock`,
      itemsAdded: addBackLog.length,
      addBackLog
    };
    
  } catch (error) {
    console.error('❌ Add back stock failed:', error);
    throw error;
  }
};

/**
 * Reverse stock reduction (undo)
 * @param {String} pickListId - Pick list ID
 * @returns {Object} - Result with success status
 */
export const reverseStockReduction = async (pickListId) => {
  try {
    const pickList = await PickListExtracted.findById(pickListId);
    
    if (!pickList) {
      throw new Error('Pick list not found');
    }
    
    if (!pickList.stockReduced) {
      return {
        success: true,
        message: 'Stock was not reduced, nothing to reverse'
      };
    }
    
    // Add back all items using addBackReturnedStock with total quantity
    const result = await addBackReturnedStock(pickListId, pickList.totalLoQty);
    
    // Update pick list status
    pickList.stockReduced = false;
    pickList.stockReducedAt = null;
    pickList.stockReductionError = null;
    await pickList.save();
    
    return {
      success: true,
      message: 'Stock reduction reversed successfully',
      ...result
    };
    
  } catch (error) {
    console.error('❌ Reverse stock reduction failed:', error);
    throw error;
  }
};
