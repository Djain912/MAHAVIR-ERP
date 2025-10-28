/**
 * Driver Dispatch Service
 * Business logic for assigning stock to drivers with cash denominations
 */

import DriverDispatch from '../models/DriverDispatch.js';
import DriverDispatchItem from '../models/DriverDispatchItem.js';
import CashDenomination from '../models/CashDenomination.js';
import StockIn from '../models/StockIn.js';
import Product from '../models/Product.js';
import Driver from '../models/Driver.js';
import mongoose from 'mongoose';

/**
 * Create driver dispatch with stock items and cash denominations
 */
export const createDriverDispatch = async (dispatchData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { driverId, date, items, cashDenominations } = dispatchData;
    
    // Verify driver exists and is active
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }
    if (!driver.active) {
      throw new Error('Cannot dispatch to inactive driver');
    }
    
    // Check if driver already has an active dispatch for today
    const existingDispatch = await DriverDispatch.findOne({
      driverId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      },
      status: 'Active'
    });
    
    if (existingDispatch) {
      throw new Error('Driver already has an active dispatch for this date');
    }
    
    let totalStockValue = 0;
    const dispatchItems = [];
    
    // Process each item and validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (!product.active) {
        throw new Error(`Cannot dispatch inactive product: ${product.name}`);
      }
      
      // Get available stock for this product (FIFO)
      const availableStock = await StockIn.find({
        productId: item.productId,
        remainingQuantity: { $gt: 0 }
      }).sort({ dateReceived: 1 });
      
      const totalAvailable = availableStock.reduce((sum, stock) => sum + stock.remainingQuantity, 0);
      
      if (totalAvailable < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${totalAvailable}, Requested: ${item.quantity}`);
      }
      
      // Deduct stock using FIFO
      let remainingToDeduct = item.quantity;
      for (const stock of availableStock) {
        if (remainingToDeduct === 0) break;
        
        const deductAmount = Math.min(stock.remainingQuantity, remainingToDeduct);
        stock.remainingQuantity -= deductAmount;
        await stock.save({ session });
        
        remainingToDeduct -= deductAmount;
      }
      
      // Use product's current price
      const ratePerUnit = product.pricePerUnit;
      const itemValue = item.quantity * ratePerUnit;
      totalStockValue += itemValue;
      
      dispatchItems.push({
        productId: item.productId,
        quantity: item.quantity,
        ratePerUnit,
        itemType: item.itemType || 'Retail' // Include item type
      });
    }
    
    // Calculate total cash value from denominations
    let totalCashValue = 0;
    for (const denom of cashDenominations) {
      totalCashValue += denom.noteValue * denom.noteCount;
    }
    
    // Create driver dispatch record
    const dispatch = new DriverDispatch({
      driverId,
      date,
      totalStockValue,
      totalCashValue,
      status: 'Active'
    });
    await dispatch.save({ session });
    
    // Create dispatch items
    for (const item of dispatchItems) {
      const dispatchItem = new DriverDispatchItem({
        dispatchId: dispatch._id,
        ...item
      });
      await dispatchItem.save({ session });
    }
    
    // Create cash denominations
    for (const denom of cashDenominations) {
      if (denom.noteCount > 0) {
        const cashDenom = new CashDenomination({
          dispatchId: dispatch._id,
          noteValue: denom.noteValue,
          noteCount: denom.noteCount
        });
        await cashDenom.save({ session });
      }
    }
    
    await session.commitTransaction();
    
    // Return populated dispatch
    return await getDriverDispatchById(dispatch._id.toString());
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get driver dispatch by ID with all details
 */
export const getDriverDispatchById = async (dispatchId) => {
  const dispatch = await DriverDispatch.findById(dispatchId)
    .populate('driverId', 'name phone role');
  
  if (!dispatch) {
    throw new Error('Dispatch not found');
  }
  
  const items = await DriverDispatchItem.find({ dispatchId })
    .populate('productId', 'name size pricePerUnit');
  
  const cashDenominations = await CashDenomination.find({ dispatchId })
    .sort({ noteValue: -1 });
  
  return {
    ...dispatch.toObject(),
    items,
    cashDenominations
  };
};

/**
 * Get all dispatches with filters
 */
export const getAllDispatches = async (filters = {}) => {
  const query = {};
  
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
  
  const dispatches = await DriverDispatch.find(query)
    .populate('driverId', 'name phone role')
    .sort({ date: -1 });
  
  return dispatches;
};

/**
 * Get active dispatch for a driver
 */
export const getActiveDispatchForDriver = async (driverId) => {
  const dispatch = await DriverDispatch.findOne({
    driverId,
    status: 'Active'
  })
  .populate('driverId', 'name phone role')
  .sort({ date: -1 });
  
  if (!dispatch) {
    return null;
  }
  
  const items = await DriverDispatchItem.find({ dispatchId: dispatch._id })
    .populate('productId', 'name size pricePerUnit');
  
  const cashDenominations = await CashDenomination.find({ dispatchId: dispatch._id })
    .sort({ noteValue: -1 });
  
  return {
    ...dispatch.toObject(),
    items,
    cashDenominations
  };
};

/**
 * Update dispatch status
 */
export const updateDispatchStatus = async (dispatchId, status) => {
  const dispatch = await DriverDispatch.findByIdAndUpdate(
    dispatchId,
    { status, updatedAt: Date.now() },
    { new: true, runValidators: true }
  ).populate('driverId', 'name phone role');
  
  if (!dispatch) {
    throw new Error('Dispatch not found');
  }
  
  return dispatch;
};

/**
 * Get dispatch statistics
 */
export const getDispatchStats = async (startDate, endDate) => {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await DriverDispatch.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalStockValue: { $sum: '$totalStockValue' },
        totalCashValue: { $sum: '$totalCashValue' }
      }
    }
  ]);
  
  const result = {
    active: { count: 0, totalStockValue: 0, totalCashValue: 0 },
    completed: { count: 0, totalStockValue: 0, totalCashValue: 0 },
    settled: { count: 0, totalStockValue: 0, totalCashValue: 0 }
  };
  
  stats.forEach(stat => {
    const status = stat._id.toLowerCase();
    result[status] = {
      count: stat.count,
      totalStockValue: stat.totalStockValue,
      totalCashValue: stat.totalCashValue
    };
  });
  
  return result;
};
