/**
 * Stock In Service
 * Business logic for warehouse stock intake management
 */

import StockIn from '../models/StockIn.js';
import Product from '../models/Product.js';
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
  await stockIn.populate('productId', 'name size pricePerUnit');
  
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
    .populate('productId', 'name size pricePerUnit category')
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
    .populate('productId', 'name size pricePerUnit')
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
        productName: '$product.name',
        productSize: '$product.size',
        productCategory: '$product.category',
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
  .populate('productId', 'name size pricePerUnit')
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
