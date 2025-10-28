/**
 * Cheque Management Controller
 * Handles all cheque-related operations including bulk updates and PDF generation
 */

import * as chequeService from '../services/chequeManagementService.js';
import PDFDocument from 'pdfkit';

/**
 * Get all cheques with filters
 * GET /api/cheques
 */
export const getAllCheques = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      bankName: req.query.bankName,
      retailerId: req.query.retailerId,
      driverId: req.query.driverId,
      chequeNumber: req.query.chequeNumber,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      sortBy: req.query.sortBy || 'depositDate',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await chequeService.getAllCheques(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching cheques:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single cheque by ID
 * GET /api/cheques/:id
 */
export const getChequeById = async (req, res) => {
  try {
    const cheque = await chequeService.getChequeById(req.params.id);
    res.json(cheque);
  } catch (error) {
    console.error('Error fetching cheque:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * Create new cheque
 * POST /api/cheques
 */
export const createCheque = async (req, res) => {
  try {
    const cheque = await chequeService.createCheque(req.body);
    res.status(201).json(cheque);
  } catch (error) {
    console.error('Error creating cheque:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update cheque status
 * PUT /api/cheques/:id/status
 */
export const updateChequeStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const userId = req.user?._id; // From auth middleware
    
    const cheque = await chequeService.updateChequeStatus(
      req.params.id,
      status,
      userId,
      remarks
    );
    
    res.json(cheque);
  } catch (error) {
    console.error('Error updating cheque status:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Bulk update cheque status (for select all → mark cleared)
 * PUT /api/cheques/bulk-status
 */
export const bulkUpdateChequeStatus = async (req, res) => {
  try {
    const { chequeIds, status, remarks } = req.body;
    const userId = req.user?._id;
    
    if (!chequeIds || !Array.isArray(chequeIds) || chequeIds.length === 0) {
      return res.status(400).json({ error: 'chequeIds array is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const results = await chequeService.bulkUpdateChequeStatus(
      chequeIds,
      status,
      userId,
      remarks
    );
    
    res.json(results);
  } catch (error) {
    console.error('Error bulk updating cheque status:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete cheque (admin only)
 * DELETE /api/cheques/:id
 */
export const deleteCheque = async (req, res) => {
  try {
    const result = await chequeService.deleteCheque(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting cheque:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get cheque summary
 * GET /api/cheques/summary
 */
export const getChequeSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await chequeService.getChequeSummary(startDate, endDate);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching cheque summary:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get bank-wise summary
 * GET /api/cheques/bank-summary
 */
export const getBankWiseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await chequeService.getBankWiseSummary(startDate, endDate);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching bank-wise summary:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get cheque statistics
 * GET /api/cheques/stats
 */
export const getChequeStats = async (req, res) => {
  try {
    const stats = await chequeService.getChequeStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching cheque stats:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Import cheques from sales
 * POST /api/cheques/import-from-sales
 */
export const importChequesFromSales = async (req, res) => {
  try {
    const result = await chequeService.importChequesFromSales();
    res.json({ 
      message: 'Cheques imported successfully', 
      ...result 
    });
  } catch (error) {
    console.error('Error importing cheques:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate PDF report for cheques
 * GET /api/cheques/pdf
 */
export const generateChequePDF = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      bankName: req.query.bankName,
      retailerId: req.query.retailerId,
      driverId: req.query.driverId
    };

    // Get all cheques matching filters (no pagination)
    const { cheques } = await chequeService.getAllCheques({
      ...filters,
      limit: 10000 // Get all
    });

    // Get summary
    const summary = await chequeService.getChequeSummary(
      filters.startDate,
      filters.endDate
    );

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cheque-report-${Date.now()}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Cheque Management Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Filters applied
    doc.fontSize(12).text('Filters Applied:', { underline: true });
    doc.fontSize(10);
    if (filters.startDate) doc.text(`Start Date: ${new Date(filters.startDate).toLocaleDateString()}`);
    if (filters.endDate) doc.text(`End Date: ${new Date(filters.endDate).toLocaleDateString()}`);
    if (filters.status) doc.text(`Status: ${filters.status}`);
    if (filters.bankName) doc.text(`Bank: ${filters.bankName}`);
    doc.moveDown();

    // Summary section
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(10);
    doc.text(`Total Cheques: ${summary.totalCheques}`);
    doc.text(`Total Amount: ₹${summary.totalAmount.toLocaleString()}`);
    doc.moveDown();
    doc.text(`Pending: ${summary.pending.count} (₹${summary.pending.amount.toLocaleString()})`);
    doc.text(`Deposited: ${summary.deposited.count} (₹${summary.deposited.amount.toLocaleString()})`);
    doc.text(`Cleared: ${summary.cleared.count} (₹${summary.cleared.amount.toLocaleString()})`);
    doc.text(`Bounced: ${summary.bounced.count} (₹${summary.bounced.amount.toLocaleString()})`);
    doc.moveDown(2);

    // Cheques table
    doc.fontSize(12).text('Cheque Details', { underline: true });
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    const rowHeight = 20;
    const colWidths = {
      date: 70,
      cheque: 70,
      retailer: 120,
      bank: 90,
      amount: 70,
      status: 60
    };

    doc.fontSize(9).fillColor('#333');
    let x = 50;
    doc.text('Date', x, tableTop, { width: colWidths.date });
    x += colWidths.date;
    doc.text('Cheque #', x, tableTop, { width: colWidths.cheque });
    x += colWidths.cheque;
    doc.text('Retailer', x, tableTop, { width: colWidths.retailer });
    x += colWidths.retailer;
    doc.text('Bank', x, tableTop, { width: colWidths.bank });
    x += colWidths.bank;
    doc.text('Amount', x, tableTop, { width: colWidths.amount });
    x += colWidths.amount;
    doc.text('Status', x, tableTop, { width: colWidths.status });

    // Draw header line
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();

    // Table rows
    let y = tableTop + rowHeight;
    
    cheques.forEach((cheque, index) => {
      // Check if need new page
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.fontSize(8).fillColor('#000');
      x = 50;
      
      doc.text(
        new Date(cheque.depositDate).toLocaleDateString(),
        x,
        y,
        { width: colWidths.date }
      );
      x += colWidths.date;
      
      doc.text(cheque.chequeNumber, x, y, { width: colWidths.cheque });
      x += colWidths.cheque;
      
      doc.text(
        cheque.retailerId?.name || 'N/A',
        x,
        y,
        { width: colWidths.retailer }
      );
      x += colWidths.retailer;
      
      doc.text(cheque.bankName, x, y, { width: colWidths.bank });
      x += colWidths.bank;
      
      doc.text(
        `₹${cheque.amount.toLocaleString()}`,
        x,
        y,
        { width: colWidths.amount }
      );
      x += colWidths.amount;
      
      // Color code status
      const statusColors = {
        'Pending': '#f59e0b',
        'Deposited': '#3b82f6',
        'Cleared': '#10b981',
        'Bounced': '#ef4444',
        'Cancelled': '#6b7280'
      };
      doc.fillColor(statusColors[cheque.status] || '#000');
      doc.text(cheque.status, x, y, { width: colWidths.status });
      doc.fillColor('#000');

      y += rowHeight;
    });

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .fillColor('#666')
         .text(
           `Page ${i + 1} of ${pageCount}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
};
