/**
 * Wholesaler Bill Controller
 * Handles bill generation for wholesalers based on dispatch data
 */

import DriverDispatch from '../models/DriverDispatch.js';
import DriverDispatchItem from '../models/DriverDispatchItem.js';
import Wholesaler from '../models/Wholesaler.js';
import Driver from '../models/Driver.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/response.js';
import PDFDocument from 'pdfkit';

/**
 * Get all wholesale dispatch summary for bill generation
 * GET /api/wholesalers/bill-data
 */
export const getAllWholesaleBillData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('Fetching wholesale bill data with filters:', { startDate, endDate });

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Find all dispatches
    const dispatches = await DriverDispatch.find(
      Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}
    )
      .populate('driverId', 'name phone vehicleNumber')
      .sort({ date: -1 })
      .lean();

    console.log(`Found ${dispatches?.length || 0} dispatches`);

    if (!dispatches || dispatches.length === 0) {
      return successResponse(res, 200, 'No dispatches found', {
        dispatches: [],
        totalAmount: 0,
        itemCount: 0
      });
    }

    const dispatchIds = dispatches.map(d => d._id);

    // Find all wholesale items from these dispatches
    const wholesaleItems = await DriverDispatchItem.find({
      dispatchId: { $in: dispatchIds },
      itemType: 'Wholesale'
    })
      .populate('productId', 'name category mrp wholesalePrice')
      .lean();

    console.log(`Found ${wholesaleItems?.length || 0} wholesale items`);

    // Group items by dispatch
    const dispatchWithItems = dispatches.map(dispatch => {
      const items = wholesaleItems.filter(
        item => item.dispatchId.toString() === dispatch._id.toString()
      );

      const totalAmount = items.reduce((sum, item) => sum + (item.totalValue || 0), 0);

      return {
        ...dispatch,
        items,
        totalAmount
      };
    }).filter(d => d.items.length > 0); // Only include dispatches with wholesale items

    const grandTotal = dispatchWithItems.reduce((sum, d) => sum + d.totalAmount, 0);

    console.log(`Returning ${dispatchWithItems.length} dispatches with wholesale items, total: ${grandTotal}`);

    return successResponse(res, 200, 'Bill data retrieved successfully', {
      dispatches: dispatchWithItems,
      totalAmount: grandTotal,
      itemCount: wholesaleItems.length
    });
  } catch (error) {
    console.error('Error in getAllWholesaleBillData:', error);
    next(error);
  }
};

/**
 * Get wholesaler dispatch summary for bill generation
 * GET /api/wholesalers/bill-data/:wholesalerId
 */
export const getWholesalerBillData = async (req, res, next) => {
  try {
    const { wholesalerId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Find all dispatches with wholesale items
    const dispatches = await DriverDispatch.find(
      Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}
    )
      .populate('driverId', 'name phone vehicleNumber')
      .sort({ date: -1 })
      .lean();

    if (!dispatches || dispatches.length === 0) {
      return successResponse(res, 200, 'No dispatches found', {
        dispatches: [],
        totalAmount: 0
      });
    }

    const dispatchIds = dispatches.map(d => d._id);

    // Find all wholesale items from these dispatches
    const wholesaleItems = await DriverDispatchItem.find({
      dispatchId: { $in: dispatchIds },
      itemType: 'Wholesale'
    })
      .populate('productId', 'name category mrp wholesalePrice')
      .populate('dispatchId')
      .lean();

    // Group items by dispatch
    const dispatchWithItems = dispatches.map(dispatch => {
      const items = wholesaleItems.filter(
        item => item.dispatchId._id.toString() === dispatch._id.toString()
      );

      const totalAmount = items.reduce((sum, item) => sum + (item.totalValue || 0), 0);

      return {
        ...dispatch,
        items,
        totalAmount
      };
    }).filter(d => d.items.length > 0); // Only include dispatches with wholesale items

    const grandTotal = dispatchWithItems.reduce((sum, d) => sum + d.totalAmount, 0);

    return successResponse(res, 200, 'Bill data retrieved successfully', {
      dispatches: dispatchWithItems,
      totalAmount: grandTotal,
      itemCount: wholesaleItems.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate PDF bill for all wholesale dispatches
 * POST /api/wholesalers/generate-bill
 */
export const generateAllWholesaleBill = async (req, res, next) => {
  try {
    const { billDate, startDate, endDate, dispatchIds } = req.body;

    if (!billDate) {
      return errorResponse(res, 400, 'Bill date is required');
    }

    // Build query for dispatches
    let query = {};
    if (dispatchIds && dispatchIds.length > 0) {
      query._id = { $in: dispatchIds };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get dispatches
    const dispatches = await DriverDispatch.find(query)
      .populate('driverId', 'name phone vehicleNumber')
      .sort({ date: 1 })
      .lean();

    if (!dispatches || dispatches.length === 0) {
      return errorResponse(res, 400, 'No dispatches found for the selected criteria');
    }

    const dispatchIdsList = dispatches.map(d => d._id);

    // Get wholesale items
    const wholesaleItems = await DriverDispatchItem.find({
      dispatchId: { $in: dispatchIdsList },
      itemType: 'Wholesale'
    })
      .populate('productId', 'name category mrp wholesalePrice')
      .lean();

    if (wholesaleItems.length === 0) {
      return errorResponse(res, 400, 'No wholesale items found in selected dispatches');
    }

    // Group items by product for summary
    const productSummary = {};
    wholesaleItems.forEach(item => {
      const productId = item.productId._id.toString();
      if (!productSummary[productId]) {
        productSummary[productId] = {
          product: item.productId,
          totalQuantity: 0,
          totalAmount: 0
        };
      }
      productSummary[productId].totalQuantity += item.quantity;
      productSummary[productId].totalAmount += item.totalValue;
    });

    const products = Object.values(productSummary);
    const grandTotal = products.reduce((sum, p) => sum + p.totalAmount, 0);

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=wholesale-bill-${billDate}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('MAHAVIR ENTERPRISE', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Coca-Cola Wholesale Distributor', { align: 'center' });
    doc.moveDown();

    // Bill Info
    doc.fontSize(12).font('Helvetica-Bold').text('WHOLESALE BILL', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).font('Helvetica');
    doc.text(`Bill Date: ${new Date(billDate).toLocaleDateString('en-IN')}`, 50, doc.y);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, 50, doc.y);
    
    if (startDate || endDate) {
      const dateRange = startDate && endDate 
        ? `${new Date(startDate).toLocaleDateString('en-IN')} - ${new Date(endDate).toLocaleDateString('en-IN')}`
        : startDate 
        ? `From ${new Date(startDate).toLocaleDateString('en-IN')}`
        : `Until ${new Date(endDate).toLocaleDateString('en-IN')}`;
      doc.text(`Period: ${dateRange}`, 50, doc.y);
    }

    doc.moveDown(2);

    // Table headers
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 300;
    const rateX = 380;
    const amountX = 480;

    doc.font('Helvetica-Bold');
    doc.text('Product', itemX, tableTop);
    doc.text('Qty', qtyX, tableTop);
    doc.text('Rate', rateX, tableTop);
    doc.text('Amount', amountX, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table rows
    let yPosition = tableTop + 25;
    doc.font('Helvetica');

    products.forEach((item, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.text(item.product.name, itemX, yPosition, { width: 240 });
      doc.text(item.totalQuantity.toString(), qtyX, yPosition);
      doc.text(`₹${(item.totalAmount / item.totalQuantity).toFixed(2)}`, rateX, yPosition);
      doc.text(`₹${item.totalAmount.toFixed(2)}`, amountX, yPosition);

      yPosition += 20;
    });

    // Total
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Grand Total:', amountX - 100, yPosition);
    doc.text(`₹${grandTotal.toFixed(2)}`, amountX, yPosition);

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      'Thank you for your business!',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error('Error generating wholesale bill:', error);
    next(error);
  }
};

/**
 * Generate PDF bill for wholesaler
 * POST /api/wholesalers/generate-bill/:wholesalerId
 */
export const generateWholesalerBill = async (req, res, next) => {
  try {
    const { wholesalerId } = req.params;
    const { billDate, startDate, endDate, dispatchIds } = req.body;

    if (!billDate) {
      return errorResponse(res, 400, 'Bill date is required');
    }

    // Get wholesaler details
    const wholesaler = await Wholesaler.findById(wholesalerId);
    if (!wholesaler) {
      return errorResponse(res, 404, 'Wholesaler not found');
    }

    // Build query for dispatches
    let query = {};
    if (dispatchIds && dispatchIds.length > 0) {
      query._id = { $in: dispatchIds };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get dispatches
    const dispatches = await DriverDispatch.find(query)
      .populate('driverId', 'name phone vehicleNumber')
      .sort({ date: 1 })
      .lean();

    if (!dispatches || dispatches.length === 0) {
      return errorResponse(res, 400, 'No dispatches found for the selected criteria');
    }

    const dispatchIdsList = dispatches.map(d => d._id);

    // Get wholesale items
    const wholesaleItems = await DriverDispatchItem.find({
      dispatchId: { $in: dispatchIdsList },
      itemType: 'Wholesale'
    })
      .populate('productId', 'name category mrp wholesalePrice')
      .populate('dispatchId')
      .lean();

    if (wholesaleItems.length === 0) {
      return errorResponse(res, 400, 'No wholesale items found in selected dispatches');
    }

    // Group items by product for summary
    const productSummary = {};
    wholesaleItems.forEach(item => {
      const productId = item.productId._id.toString();
      if (!productSummary[productId]) {
        productSummary[productId] = {
          product: item.productId,
          totalQuantity: 0,
          totalAmount: 0,
          dispatches: []
        };
      }
      productSummary[productId].totalQuantity += item.quantity;
      productSummary[productId].totalAmount += item.totalValue;
      productSummary[productId].dispatches.push({
        date: item.dispatchId.date,
        quantity: item.quantity,
        amount: item.totalValue,
        driver: dispatches.find(d => d._id.toString() === item.dispatchId._id.toString())?.driverId
      });
    });

    const products = Object.values(productSummary);
    const grandTotal = products.reduce((sum, p) => sum + p.totalAmount, 0);

    // Generate PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=bill-${wholesaler.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('MAHAVIR ENTERPRISE', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Coca-Cola Distributor', { align: 'center' });
    doc.moveDown();

    // Bill title
    doc.fontSize(16).font('Helvetica-Bold').text('WHOLESALE BILL', { align: 'center' });
    doc.moveDown();

    // Bill details
    const formattedBillDate = new Date(billDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    doc.fontSize(10).font('Helvetica');
    doc.text(`Bill Date: ${formattedBillDate}`, 50, doc.y);
    doc.text(`Bill No: WB-${Date.now()}`, 400, doc.y - 12);
    doc.moveDown();

    // Wholesaler details
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, doc.y);
    doc.fontSize(10).font('Helvetica');
    doc.text(wholesaler.businessName || wholesaler.name, 50, doc.y);
    doc.text(wholesaler.address, 50, doc.y);
    if (wholesaler.city || wholesaler.state) {
      doc.text(`${wholesaler.city || ''}, ${wholesaler.state || ''} - ${wholesaler.pincode || ''}`, 50, doc.y);
    }
    doc.text(`Phone: ${wholesaler.phone}`, 50, doc.y);
    if (wholesaler.gstNumber) {
      doc.text(`GST: ${wholesaler.gstNumber}`, 50, doc.y);
    }
    doc.moveDown(2);

    // Table header
    const tableTop = doc.y;
    const colX = {
      sno: 50,
      product: 90,
      quantity: 300,
      rate: 380,
      amount: 460
    };

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('S.No', colX.sno, tableTop);
    doc.text('Product', colX.product, tableTop);
    doc.text('Qty', colX.quantity, tableTop);
    doc.text('Rate', colX.rate, tableTop);
    doc.text('Amount', colX.amount, tableTop);

    // Draw line
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table rows
    let yPos = tableTop + 25;
    doc.font('Helvetica');

    products.forEach((item, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      doc.text(index + 1, colX.sno, yPos);
      doc.text(item.product.name, colX.product, yPos, { width: 200 });
      doc.text(item.totalQuantity.toString(), colX.quantity, yPos);
      doc.text(`₹${item.product.wholesalePrice.toFixed(2)}`, colX.rate, yPos);
      doc.text(`₹${item.totalAmount.toFixed(2)}`, colX.amount, yPos);

      yPos += 20;
    });

    // Draw line before total
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 10;

    // Grand total
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Grand Total:', colX.rate - 50, yPos);
    doc.text(`₹${grandTotal.toFixed(2)}`, colX.amount, yPos);

    yPos += 30;

    // Dispatch details section
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Dispatch Details:', 50, yPos);
    yPos += 15;

    doc.font('Helvetica').fontSize(9);
    doc.text(`Total Dispatches: ${dispatches.length}`, 50, yPos);
    yPos += 12;
    doc.text(`Date Range: ${new Date(dispatches[0].date).toLocaleDateString('en-IN')} to ${new Date(dispatches[dispatches.length - 1].date).toLocaleDateString('en-IN')}`, 50, yPos);

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      'Thank you for your business!',
      50,
      750,
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error('Error generating bill:', error);
    next(error);
  }
};

/**
 * Get available dispatch date range for wholesaler bills
 * GET /api/wholesalers/bill-date-range
 */
export const getDispatchDateRange = async (req, res, next) => {
  try {
    // Get all dispatches
    const dispatches = await DriverDispatch.find()
      .sort({ date: 1 })
      .select('date')
      .lean();

    if (!dispatches || dispatches.length === 0) {
      return successResponse(res, 200, 'No dispatches found', {
        minDate: null,
        maxDate: null
      });
    }

    return successResponse(res, 200, 'Date range retrieved successfully', {
      minDate: dispatches[0].date,
      maxDate: dispatches[dispatches.length - 1].date
    });
  } catch (error) {
    next(error);
  }
};
