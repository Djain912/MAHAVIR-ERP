/**
 * Counter Sale Controller
 * Handle on-the-spot cash sales
 */

import CounterSale from '../models/CounterSale.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Create new counter sale
 * POST /api/counter-sales
 */
export const createCounterSale = async (req, res) => {
  try {
    // Generate sale number
    const saleNumber = await CounterSale.generateSaleNumber();
    
    const saleData = {
      ...req.body,
      saleNumber,
      recordedBy: req.user.id
    };
    
    const sale = await CounterSale.create(saleData);
    const populatedSale = await CounterSale.findById(sale._id)
      .populate('items.productId', 'name size')
      .populate('wholesalerId', 'name phone')
      .populate('retailerId', 'name phone')
      .populate('recordedBy', 'name role');
    
    return successResponse(res, 201, 'Counter sale created successfully', populatedSale);
  } catch (error) {
    console.error('Error creating counter sale:', error);
    return errorResponse(res, 400, error.message);
  }
};

/**
 * Get all counter sales with filters
 * GET /api/counter-sales?startDate=&endDate=&customerType=
 */
export const getAllCounterSales = async (req, res) => {
  try {
    const { startDate, endDate, customerType, saleNumber } = req.query;
    
    const filter = {};
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    
    if (customerType) filter.customerType = customerType;
    if (saleNumber) filter.saleNumber = new RegExp(saleNumber, 'i');
    
    const sales = await CounterSale.find(filter)
      .populate('items.productId', 'name size')
      .populate('wholesalerId', 'name phone')
      .populate('retailerId', 'name phone')
      .populate('recordedBy', 'name role')
      .sort({ date: -1, createdAt: -1 });
    
    // Calculate summary
    const summary = {
      totalSales: sales.length,
      totalAmount: sales.reduce((sum, sale) => sum + sale.finalAmount, 0),
      totalCashCollected: sales.reduce((sum, sale) => sum + sale.totalCashReceived, 0),
      byCustomerType: {}
    };
    
    sales.forEach(sale => {
      if (!summary.byCustomerType[sale.customerType]) {
        summary.byCustomerType[sale.customerType] = { count: 0, amount: 0 };
      }
      summary.byCustomerType[sale.customerType].count++;
      summary.byCustomerType[sale.customerType].amount += sale.finalAmount;
    });
    
    return successResponse(res, 200, 'Counter sales retrieved successfully', {
      sales,
      summary
    });
  } catch (error) {
    console.error('Error fetching counter sales:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get counter sale by ID
 * GET /api/counter-sales/:id
 */
export const getCounterSaleById = async (req, res) => {
  try {
    const sale = await CounterSale.findById(req.params.id)
      .populate('items.productId', 'name size')
      .populate('wholesalerId', 'name phone address')
      .populate('retailerId', 'name phone address')
      .populate('recordedBy', 'name role');
    
    if (!sale) {
      return errorResponse(res, 404, 'Counter sale not found');
    }
    
    return successResponse(res, 200, 'Counter sale retrieved successfully', sale);
  } catch (error) {
    console.error('Error fetching counter sale:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Update counter sale
 * PUT /api/counter-sales/:id
 */
export const updateCounterSale = async (req, res) => {
  try {
    const sale = await CounterSale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('items.productId', 'name size')
     .populate('wholesalerId', 'name phone')
     .populate('retailerId', 'name phone')
     .populate('recordedBy', 'name role');
    
    if (!sale) {
      return errorResponse(res, 404, 'Counter sale not found');
    }
    
    return successResponse(res, 200, 'Counter sale updated successfully', sale);
  } catch (error) {
    console.error('Error updating counter sale:', error);
    return errorResponse(res, 400, error.message);
  }
};

/**
 * Delete counter sale
 * DELETE /api/counter-sales/:id
 */
export const deleteCounterSale = async (req, res) => {
  try {
    const sale = await CounterSale.findByIdAndDelete(req.params.id);
    
    if (!sale) {
      return errorResponse(res, 404, 'Counter sale not found');
    }
    
    return successResponse(res, 200, 'Counter sale deleted successfully');
  } catch (error) {
    console.error('Error deleting counter sale:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get daily summary
 * GET /api/counter-sales/summary/daily?date=2025-10-25
 */
export const getDailySummary = async (req, res) => {
  try {
    const date = req.query.date || new Date();
    const { sales, summary } = await CounterSale.getDailySummary(date);
    
    return successResponse(res, 200, 'Daily summary retrieved successfully', {
      date,
      sales,
      summary
    });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Get available products for counter sale
 * GET /api/counter-sales/products
 */
export const getAvailableProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .select('name size pricePerUnit')
      .sort({ name: 1 });
    
    return successResponse(res, 200, 'Products retrieved successfully', products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorResponse(res, 500, error.message);
  }
};

export default {
  createCounterSale,
  getAllCounterSales,
  getCounterSaleById,
  updateCounterSale,
  deleteCounterSale,
  getDailySummary,
  getAvailableProducts
};
