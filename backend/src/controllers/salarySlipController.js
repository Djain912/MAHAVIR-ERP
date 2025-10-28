/**
 * Salary Slip Controller
 * Handles salary slip generation, viewing, and payment
 */

import SalarySlip from '../models/SalarySlip.js';
import Driver from '../models/Driver.js';

/**
 * Generate salary slip for employee
 * POST /api/salary-slips/generate
 */
export const generateSalarySlip = async (req, res) => {
  try {
    const { employeeId, month, year, commission } = req.body;
    const generatedBy = req.user.id;
    
    const salarySlip = await SalarySlip.generateSlip(
      employeeId,
      month,
      year,
      commission || 0,
      generatedBy
    );
    
    res.json(salarySlip);
  } catch (error) {
    console.error('Error generating salary slip:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Bulk generate salary slips for all employees
 * POST /api/salary-slips/bulk-generate
 */
export const bulkGenerateSalarySlips = async (req, res) => {
  try {
    const { month, year, commissions } = req.body;
    // commissions = { employeeId: commissionAmount, ... }
    
    const generatedBy = req.user.id;
    
    // Get all active employees
    const employees = await Driver.find({ active: true });
    
    const results = [];
    
    for (const employee of employees) {
      try {
        const commission = commissions?.[employee._id.toString()] || 0;
        
        const salarySlip = await SalarySlip.generateSlip(
          employee._id,
          month,
          year,
          commission,
          generatedBy
        );
        
        results.push({ success: true, employeeId: employee._id, salarySlip });
      } catch (error) {
        results.push({ 
          success: false, 
          employeeId: employee._id, 
          error: error.message 
        });
      }
    }
    
    res.json({ results });
  } catch (error) {
    console.error('Error in bulk salary slip generation:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all salary slips with filters
 * GET /api/salary-slips?month=10&year=2025&status=Pending
 */
export const getAllSalarySlips = async (req, res) => {
  try {
    const { month, year, status, paymentStatus, employeeId } = req.query;
    
    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (employeeId) filter.employeeId = employeeId;
    
    const salarySlips = await SalarySlip.find(filter)
      .populate('employeeId', 'name phone role salary')
      .populate('generatedBy', 'name')
      .sort({ year: -1, month: -1, 'employeeId.name': 1 });
    
    // Calculate summary
    const summary = {
      totalSlips: salarySlips.length,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      totalPaid: 0,
      totalPending: 0
    };
    
    salarySlips.forEach(slip => {
      summary.totalGross += slip.grossSalary;
      summary.totalDeductions += slip.totalDeductions;
      summary.totalNet += slip.netSalary;
      summary.totalPaid += slip.paidAmount || 0;
      
      if (slip.paymentStatus === 'Pending') {
        summary.totalPending += slip.netSalary;
      } else if (slip.paymentStatus === 'Partially-Paid') {
        summary.totalPending += slip.netSalary - slip.paidAmount;
      }
    });
    
    res.json({
      salarySlips,
      summary
    });
  } catch (error) {
    console.error('Error fetching salary slips:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single salary slip by ID
 * GET /api/salary-slips/:id
 */
export const getSalarySlipById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salarySlip = await SalarySlip.findById(id)
      .populate('employeeId', 'name phone role salary')
      .populate('generatedBy', 'name');
    
    if (!salarySlip) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }
    
    res.json(salarySlip);
  } catch (error) {
    console.error('Error fetching salary slip:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update salary slip (for adjustments before approval)
 * PUT /api/salary-slips/:id
 */
export const updateSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const salarySlip = await SalarySlip.findById(id);
    
    if (!salarySlip) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }
    
    // Only allow updates if status is Draft
    if (salarySlip.status !== 'Draft') {
      return res.status(400).json({ error: 'Cannot update approved/paid salary slip' });
    }
    
    // Update allowed fields
    if (updates.earnings) Object.assign(salarySlip.earnings, updates.earnings);
    if (updates.deductions) Object.assign(salarySlip.deductions, updates.deductions);
    if (updates.remarks) salarySlip.remarks = updates.remarks;
    
    await salarySlip.save();
    
    res.json(salarySlip);
  } catch (error) {
    console.error('Error updating salary slip:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Approve salary slip
 * PUT /api/salary-slips/:id/approve
 */
export const approveSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salarySlip = await SalarySlip.findByIdAndUpdate(
      id,
      { status: 'Approved' },
      { new: true }
    ).populate('employeeId', 'name phone role salary');
    
    if (!salarySlip) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }
    
    res.json(salarySlip);
  } catch (error) {
    console.error('Error approving salary slip:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Mark salary slip as paid
 * PUT /api/salary-slips/:id/pay
 */
export const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMode, paymentReference, paidAmount } = req.body;
    
    const salarySlip = await SalarySlip.findById(id);
    
    if (!salarySlip) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }
    
    await salarySlip.markAsPaid(paymentMode, paymentReference, parseFloat(paidAmount));
    
    res.json(salarySlip);
  } catch (error) {
    console.error('Error marking salary as paid:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get monthly salary report
 * GET /api/salary-slips/report/monthly?month=10&year=2025
 */
export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const report = await SalarySlip.getMonthlyReport(
      parseInt(month),
      parseInt(year)
    );
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching monthly salary report:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete salary slip (only drafts)
 * DELETE /api/salary-slips/:id
 */
export const deleteSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    
    const salarySlip = await SalarySlip.findById(id);
    
    if (!salarySlip) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }
    
    if (salarySlip.status !== 'Draft') {
      return res.status(400).json({ error: 'Cannot delete approved/paid salary slip' });
    }
    
    await salarySlip.deleteOne();
    
    res.json({ message: 'Salary slip deleted successfully' });
  } catch (error) {
    console.error('Error deleting salary slip:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  generateSalarySlip,
  bulkGenerateSalarySlips,
  getAllSalarySlips,
  getSalarySlipById,
  updateSalarySlip,
  approveSalarySlip,
  markAsPaid,
  getMonthlyReport,
  deleteSalarySlip
};
