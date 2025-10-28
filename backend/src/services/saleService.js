/**
 * Sale Service
 * Business logic for managing sales transactions from drivers
 */

import Sale from '../models/Sale.js';
import DriverDispatchItem from '../models/DriverDispatchItem.js';
import DriverDispatch from '../models/DriverDispatch.js';
import Driver from '../models/Driver.js';
import Retailer from '../models/Retailer.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

/**
 * Create a new sale
 */
export const createSale = async (saleData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { driverId, retailerId, dispatchId, productsSold } = saleData;
    
    // Verify driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }
    
    // Verify retailer exists
    const retailer = await Retailer.findById(retailerId);
    if (!retailer) {
      throw new Error('Retailer not found');
    }
    if (!retailer.active) {
      throw new Error('Cannot create sale for inactive retailer');
    }
    
    // Verify dispatch exists and is active
    const dispatch = await DriverDispatch.findById(dispatchId);
    if (!dispatch) {
      throw new Error('Dispatch not found');
    }
    if (dispatch.status !== 'Active') {
      throw new Error('Cannot create sale for non-active dispatch');
    }
    if (dispatch.driverId.toString() !== driverId) {
      throw new Error('Dispatch does not belong to this driver');
    }
    
    // Validate and deduct products from dispatch items
    for (const soldItem of productsSold) {
      const product = await Product.findById(soldItem.productId);
      if (!product) {
        throw new Error(`Product not found: ${soldItem.productId}`);
      }
      
      const dispatchItem = await DriverDispatchItem.findOne({
        dispatchId,
        productId: soldItem.productId
      });
      
      if (!dispatchItem) {
        throw new Error(`Product ${product.name} not in driver's dispatch`);
      }
      
      if (dispatchItem.remainingQuantity < soldItem.quantity) {
        throw new Error(
          `Insufficient quantity for ${product.name}. Available: ${dispatchItem.remainingQuantity}, Requested: ${soldItem.quantity}`
        );
      }
      
      // Deduct from dispatch item
      dispatchItem.remainingQuantity -= soldItem.quantity;
      await dispatchItem.save({ session });
      
      // Set rate from dispatch item
      soldItem.ratePerUnit = dispatchItem.ratePerUnit;
    }
    
    // Create sale record
    const sale = new Sale(saleData);
    await sale.save({ session });
    
    await session.commitTransaction();
    
    // Return populated sale
    return await getSaleById(sale._id.toString());
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Get sale by ID
 */
export const getSaleById = async (saleId) => {
  const sale = await Sale.findById(saleId)
    .populate('driverId', 'name phone role')
    .populate('retailerId', 'name address phone route')
    .populate('dispatchId')
    .populate('productsSold.productId', 'name size pricePerUnit');
  
  if (!sale) {
    throw new Error('Sale not found');
  }
  
  return sale;
};

/**
 * Get all sales with filters and pagination
 */
export const getAllSales = async (filters = {}, page = 1, limit = 50) => {
  const query = {};
  
  if (filters.driverId) {
    query.driverId = filters.driverId;
  }
  
  if (filters.retailerId) {
    query.retailerId = filters.retailerId;
  }
  
  if (filters.dispatchId) {
    query.dispatchId = filters.dispatchId;
  }
  
  if (filters.startDate && filters.endDate) {
    query.saleDate = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  const skip = (page - 1) * limit;
  
  const [sales, total] = await Promise.all([
    Sale.find(query)
      .select('driverId retailerId dispatchId saleDate totalAmount totalPaid payments productsSold')
      .populate('driverId', 'name phone role')
      .populate('retailerId', 'name address phone route')
      .populate('productsSold.productId', 'name size')
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Sale.countDocuments(query)
  ]);
  
  return {
    sales,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

/**
 * Get sales by driver for a specific date/dispatch
 */
export const getSalesByDriver = async (driverId, date = null) => {
  const query = { driverId };
  
  if (date) {
    query.saleDate = {
      $gte: new Date(date).setHours(0, 0, 0, 0),
      $lt: new Date(date).setHours(23, 59, 59, 999)
    };
  }
  
  const sales = await Sale.find(query)
    .populate('retailerId', 'name address phone route')
    .populate('productsSold.productId', 'name size')
    .sort({ saleDate: -1 });
  
  return sales;
};

/**
 * Get daily sales summary for a driver
 */
export const getDailySalesSummary = async (driverId, date) => {
  const startDate = new Date(date).setHours(0, 0, 0, 0);
  const endDate = new Date(date).setHours(23, 59, 59, 999);
  
  const summary = await Sale.aggregate([
    {
      $match: {
        driverId: new mongoose.Types.ObjectId(driverId),
        saleDate: { $gte: new Date(startDate), $lt: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalCash: { $sum: '$payments.cash' },
        totalCredit: { $sum: '$payments.credit' },
        totalEmptyBottles: { $sum: '$emptyBottlesReturned' }
      }
    }
  ]);
  
  // Get total cheque amount separately
  const chequeTotal = await Sale.aggregate([
    {
      $match: {
        driverId: new mongoose.Types.ObjectId(driverId),
        saleDate: { $gte: new Date(startDate), $lt: new Date(endDate) }
      }
    },
    { $unwind: { path: '$payments.cheque', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        totalCheque: { $sum: '$payments.cheque.amount' }
      }
    }
  ]);
  
  const result = summary[0] || {
    totalSales: 0,
    totalAmount: 0,
    totalCash: 0,
    totalCredit: 0,
    totalEmptyBottles: 0
  };
  
  result.totalCheque = chequeTotal[0]?.totalCheque || 0;
  result.totalPaid = result.totalCash + result.totalCheque;
  
  return result;
};

/**
 * Get reconciliation report for driver dispatch
 */
export const getReconciliationReport = async (dispatchId) => {
  const dispatch = await DriverDispatch.findById(dispatchId)
    .populate('driverId', 'name phone');
  
  if (!dispatch) {
    throw new Error('Dispatch not found');
  }
  
  // Get dispatch items
  const dispatchItems = await DriverDispatchItem.find({ dispatchId })
    .populate('productId', 'name size');
  
  // Get sales for this dispatch
  const sales = await Sale.find({ dispatchId })
    .populate('retailerId', 'name')
    .populate('productsSold.productId', 'name size');
  
  // Calculate stock reconciliation
  const stockReconciliation = dispatchItems.map(item => {
    const soldQuantity = item.quantity - item.remainingQuantity;
    const returnedQuantity = item.remainingQuantity;
    
    return {
      product: item.productId,
      dispatched: item.quantity,
      sold: soldQuantity,
      returned: returnedQuantity,
      value: soldQuantity * item.ratePerUnit
    };
  });
  
  // Calculate payment reconciliation
  const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalCash = sales.reduce((sum, sale) => sum + sale.payments.cash, 0);
  const totalCredit = sales.reduce((sum, sale) => sum + sale.payments.credit, 0);
  
  let totalCheque = 0;
  sales.forEach(sale => {
    sale.payments.cheque.forEach(cheque => {
      totalCheque += cheque.amount;
    });
  });
  
  const totalEmptyBottles = sales.reduce((sum, sale) => sum + sale.emptyBottlesReturned, 0);
  
  return {
    dispatch: {
      id: dispatch._id,
      driver: dispatch.driverId,
      date: dispatch.date,
      status: dispatch.status,
      totalStockValue: dispatch.totalStockValue,
      totalCashValue: dispatch.totalCashValue
    },
    stockReconciliation,
    paymentReconciliation: {
      totalSalesAmount,
      totalCash,
      totalCheque,
      totalCredit,
      totalCollected: totalCash + totalCheque,
      expectedCollection: totalSalesAmount - totalCredit,
      variance: (totalCash + totalCheque) - (totalSalesAmount - totalCredit)
    },
    emptyBottlesReturned: totalEmptyBottles,
    totalSales: sales.length,
    sales: sales.map(sale => ({
      id: sale._id,
      retailer: sale.retailerId.name,
      amount: sale.totalAmount,
      paid: sale.totalPaid,
      credit: sale.payments.credit
    }))
  };
};

/**
 * Get sale statistics
 */
export const getSaleStats = async (startDate, endDate) => {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.saleDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  const stats = await Sale.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalCash: { $sum: '$payments.cash' },
        totalCredit: { $sum: '$payments.credit' }
      }
    }
  ]);
  
  return stats[0] || {
    totalSales: 0,
    totalAmount: 0,
    totalCash: 0,
    totalCredit: 0
  };
};
