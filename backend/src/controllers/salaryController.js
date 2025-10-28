/**
 * Salary Management Controller
 * Handles comprehensive salary operations including advances, leaves, and slip generation
 */

import SalarySlip from '../models/SalarySlip.js';
import SalaryAdvance from '../models/SalaryAdvance.js';
import Leave from '../models/Leave.js';
import Driver from '../models/Driver.js';

// ============= SALARY SLIP OPERATIONS =============

/**
 * Generate salary slip for an employee
 * POST /api/salary/generate
 */
export const generateSalarySlip = async (req, res) => {
  try {
    const { employeeId, month, year, commission } = req.body;
    
    if (!employeeId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, month, and year are required'
      });
    }
    
    const salarySlip = await SalarySlip.generateSlip(
      employeeId,
      parseInt(month),
      parseInt(year),
      parseFloat(commission) || 0,
      req.user._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Salary slip generated successfully',
      data: salarySlip
    });
  } catch (error) {
    console.error('Error generating salary slip:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate salary slip'
    });
  }
};

/**
 * Generate salary slips for all employees
 * POST /api/salary/generate-all
 */
export const generateAllSalarySlips = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }
    
    // Get all active employees
    const employees = await Driver.find({ active: true });
    
    const results = [];
    const errors = [];
    
    for (const employee of employees) {
      try {
        const salarySlip = await SalarySlip.generateSlip(
          employee._id,
          parseInt(month),
          parseInt(year),
          0,
          req.user._id
        );
        results.push(salarySlip);
      } catch (error) {
        errors.push({
          employeeId: employee._id,
          employeeName: employee.name,
          error: error.message
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Generated ${results.length} salary slips`,
      data: {
        generated: results,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Error generating salary slips:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate salary slips'
    });
  }
};

/**
 * Get all salary slips with filters
 * GET /api/salary/slips
 */
export const getAllSalarySlips = async (req, res) => {
  try {
    const { month, year, employeeId, status } = req.query;
    
    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    
    const salarySlips = await SalarySlip.find(filter)
      .populate('employeeId', 'name phone role salary')
      .populate('generatedBy', 'name')
      .sort({ year: -1, month: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: salarySlips.length,
      data: salarySlips
    });
  } catch (error) {
    console.error('Error fetching salary slips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary slips'
    });
  }
};

/**
 * Get salary slip by ID
 * GET /api/salary/slips/:id
 */
export const getSalarySlipById = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id)
      .populate('employeeId', 'name phone role salary')
      .populate('generatedBy', 'name')
      .populate('advancePayments.advanceId');
    
    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: salarySlip
    });
  } catch (error) {
    console.error('Error fetching salary slip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch salary slip'
    });
  }
};

/**
 * Update salary slip
 * PUT /api/salary/slips/:id
 */
export const updateSalarySlip = async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow changing core fields
    delete updates.employeeId;
    delete updates.month;
    delete updates.year;
    delete updates.generatedBy;
    
    const salarySlip = await SalarySlip.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('employeeId', 'name phone role salary');
    
    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Salary slip updated successfully',
      data: salarySlip
    });
  } catch (error) {
    console.error('Error updating salary slip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salary slip'
    });
  }
};

/**
 * Mark salary as paid
 * POST /api/salary/slips/:id/pay
 */
export const markSalaryAsPaid = async (req, res) => {
  try {
    const { paymentMode, paymentReference, paidAmount } = req.body;
    
    if (!paymentMode || !paidAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment mode and amount are required'
      });
    }
    
    const salarySlip = await SalarySlip.findById(req.params.id)
      .populate('employeeId', 'name phone role salary');
    
    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found'
      });
    }
    
    await salarySlip.markAsPaid(paymentMode, paymentReference, parseFloat(paidAmount));
    
    // Update advance recovery records
    if (salarySlip.advancePayments && salarySlip.advancePayments.length > 0) {
      for (const payment of salarySlip.advancePayments) {
        const advance = await SalaryAdvance.findById(payment.advanceId);
        if (advance) {
          await advance.recordRecovery(
            salarySlip.month,
            salarySlip.year,
            payment.amount,
            salarySlip._id
          );
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Salary marked as paid successfully',
      data: salarySlip
    });
  } catch (error) {
    console.error('Error marking salary as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark salary as paid'
    });
  }
};

/**
 * Delete salary slip
 * DELETE /api/salary/slips/:id
 */
export const deleteSalarySlip = async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id);
    
    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found'
      });
    }
    
    // Only allow deleting draft slips
    if (salarySlip.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft salary slips can be deleted'
      });
    }
    
    await salarySlip.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Salary slip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting salary slip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete salary slip'
    });
  }
};

/**
 * Get monthly salary report
 * GET /api/salary/report/:month/:year
 */
export const getMonthlySalaryReport = async (req, res) => {
  try {
    const { month, year } = req.params;
    
    const salarySlips = await SalarySlip.getMonthlyReport(
      parseInt(month),
      parseInt(year)
    );
    
    const summary = {
      totalEmployees: salarySlips.length,
      totalGrossSalary: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      totalPaid: 0,
      totalPending: 0,
      statusBreakdown: {
        draft: 0,
        approved: 0,
        paid: 0
      }
    };
    
    salarySlips.forEach(slip => {
      summary.totalGrossSalary += slip.grossSalary;
      summary.totalDeductions += slip.totalDeductions;
      summary.totalNetSalary += slip.netSalary;
      summary.totalPaid += slip.paidAmount || 0;
      summary.totalPending += (slip.netSalary - (slip.paidAmount || 0));
      summary.statusBreakdown[slip.status.toLowerCase()]++;
    });
    
    res.status(200).json({
      success: true,
      data: {
        summary,
        slips: salarySlips
      }
    });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly report'
    });
  }
};

// ============= SALARY ADVANCE OPERATIONS =============

/**
 * Create salary advance request
 * POST /api/salary/advances
 */
export const createAdvance = async (req, res) => {
  try {
    const advanceData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const advance = new SalaryAdvance(advanceData);
    await advance.save();
    
    const populatedAdvance = await SalaryAdvance.findById(advance._id)
      .populate('employeeId', 'name phone role salary')
      .populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Advance request created successfully',
      data: populatedAdvance
    });
  } catch (error) {
    console.error('Error creating advance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create advance request'
    });
  }
};

/**
 * Get all advances with filters
 * GET /api/salary/advances
 */
export const getAllAdvances = async (req, res) => {
  try {
    const { employeeId, status, month, year } = req.query;
    
    const filter = {};
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      filter.advanceDate = { $gte: startDate, $lte: endDate };
    }
    
    const advances = await SalaryAdvance.find(filter)
      .populate('employeeId', 'name phone role salary')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ advanceDate: -1 });
    
    res.status(200).json({
      success: true,
      count: advances.length,
      data: advances
    });
  } catch (error) {
    console.error('Error fetching advances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advances'
    });
  }
};

/**
 * Get advance by ID
 * GET /api/salary/advances/:id
 */
export const getAdvanceById = async (req, res) => {
  try {
    const advance = await SalaryAdvance.findById(req.params.id)
      .populate('employeeId', 'name phone role salary')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .populate('recovery.recoveredMonths.salarySlipId');
    
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: advance
    });
  } catch (error) {
    console.error('Error fetching advance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advance'
    });
  }
};

/**
 * Update advance
 * PUT /api/salary/advances/:id
 */
export const updateAdvance = async (req, res) => {
  try {
    const advance = await SalaryAdvance.findById(req.params.id);
    
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance not found'
      });
    }
    
    // Only pending advances can be updated
    if (advance.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending advances can be updated'
      });
    }
    
    const updates = req.body;
    delete updates.status; // Status changes through approve/reject
    delete updates.createdBy;
    
    Object.assign(advance, updates);
    await advance.save();
    
    const populatedAdvance = await SalaryAdvance.findById(advance._id)
      .populate('employeeId', 'name phone role salary');
    
    res.status(200).json({
      success: true,
      message: 'Advance updated successfully',
      data: populatedAdvance
    });
  } catch (error) {
    console.error('Error updating advance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update advance'
    });
  }
};

/**
 * Approve advance
 * POST /api/salary/advances/:id/approve
 */
export const approveAdvance = async (req, res) => {
  try {
    const advance = await SalaryAdvance.findById(req.params.id);
    
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance not found'
      });
    }
    
    await advance.approve(req.user._id);
    
    const populatedAdvance = await SalaryAdvance.findById(advance._id)
      .populate('employeeId', 'name phone role salary')
      .populate('approvedBy', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Advance approved successfully',
      data: populatedAdvance
    });
  } catch (error) {
    console.error('Error approving advance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve advance'
    });
  }
};

/**
 * Reject advance
 * POST /api/salary/advances/:id/reject
 */
export const rejectAdvance = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const advance = await SalaryAdvance.findById(req.params.id);
    
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance not found'
      });
    }
    
    await advance.reject(req.user._id, reason);
    
    const populatedAdvance = await SalaryAdvance.findById(advance._id)
      .populate('employeeId', 'name phone role salary')
      .populate('approvedBy', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Advance rejected successfully',
      data: populatedAdvance
    });
  } catch (error) {
    console.error('Error rejecting advance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject advance'
    });
  }
};

/**
 * Get employee's pending advances
 * GET /api/salary/advances/employee/:employeeId/pending
 */
export const getEmployeePendingAdvances = async (req, res) => {
  try {
    const advances = await SalaryAdvance.getPendingAdvances(req.params.employeeId);
    const totalPending = await SalaryAdvance.getTotalPendingAmount(req.params.employeeId);
    
    res.status(200).json({
      success: true,
      data: {
        advances,
        totalPending
      }
    });
  } catch (error) {
    console.error('Error fetching pending advances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending advances'
    });
  }
};

/**
 * Delete advance
 * DELETE /api/salary/advances/:id
 */
export const deleteAdvance = async (req, res) => {
  try {
    const advance = await SalaryAdvance.findById(req.params.id);
    
    if (!advance) {
      return res.status(404).json({
        success: false,
        message: 'Advance not found'
      });
    }
    
    // Only pending or rejected advances can be deleted
    if (!['Pending', 'Rejected'].includes(advance.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or rejected advances can be deleted'
      });
    }
    
    await advance.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Advance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting advance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete advance'
    });
  }
};

// ============= LEAVE OPERATIONS =============

/**
 * Create leave application
 * POST /api/salary/leaves
 */
export const createLeave = async (req, res) => {
  try {
    const leave = new Leave(req.body);
    await leave.save();
    
    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'name phone role');
    
    res.status(201).json({
      success: true,
      message: 'Leave application created successfully',
      data: populatedLeave
    });
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create leave application'
    });
  }
};

/**
 * Get all leaves with filters
 * GET /api/salary/leaves
 */
export const getAllLeaves = async (req, res) => {
  try {
    const { employeeId, status, month, year, leaveType } = req.query;
    
    const filter = {};
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      filter.$or = [
        { fromDate: { $gte: startDate, $lte: endDate } },
        { toDate: { $gte: startDate, $lte: endDate } },
        { fromDate: { $lte: startDate }, toDate: { $gte: endDate } }
      ];
    }
    
    const leaves = await Leave.find(filter)
      .populate('employeeId', 'name phone role')
      .populate('approvedBy', 'name')
      .sort({ appliedDate: -1 });
    
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaves'
    });
  }
};

/**
 * Get leave by ID
 * GET /api/salary/leaves/:id
 */
export const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId', 'name phone role')
      .populate('approvedBy', 'name');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Error fetching leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave'
    });
  }
};

/**
 * Update leave
 * PUT /api/salary/leaves/:id
 */
export const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Only pending leaves can be updated
    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leaves can be updated'
      });
    }
    
    const updates = req.body;
    delete updates.status; // Status changes through approve/reject
    
    Object.assign(leave, updates);
    await leave.save();
    
    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'name phone role');
    
    res.status(200).json({
      success: true,
      message: 'Leave updated successfully',
      data: populatedLeave
    });
  } catch (error) {
    console.error('Error updating leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave'
    });
  }
};

/**
 * Approve leave
 * POST /api/salary/leaves/:id/approve
 */
export const approveLeave = async (req, res) => {
  try {
    const { remarks } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    await leave.approve(req.user._id, remarks);
    
    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'name phone role')
      .populate('approvedBy', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Leave approved successfully',
      data: populatedLeave
    });
  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve leave'
    });
  }
};

/**
 * Reject leave
 * POST /api/salary/leaves/:id/reject
 */
export const rejectLeave = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    await leave.reject(req.user._id, reason);
    
    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'name phone role')
      .populate('approvedBy', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Leave rejected successfully',
      data: populatedLeave
    });
  } catch (error) {
    console.error('Error rejecting leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject leave'
    });
  }
};

/**
 * Get employee leave balance
 * GET /api/salary/leaves/employee/:employeeId/balance
 */
export const getEmployeeLeaveBalance = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const balance = await Leave.getLeaveBalance(req.params.employeeId, currentYear);
    
    res.status(200).json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave balance'
    });
  }
};

/**
 * Delete leave
 * DELETE /api/salary/leaves/:id
 */
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Only pending or rejected leaves can be deleted
    if (!['Pending', 'Rejected'].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or rejected leaves can be deleted'
      });
    }
    
    await leave.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Leave deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave'
    });
  }
};

/**
 * Get employee salary summary
 * GET /api/salary/employee/:employeeId/summary
 */
export const getEmployeeSalarySummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Get employee details
    const employee = await Driver.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Get salary slips
    const salarySlips = await SalarySlip.find({
      employeeId,
      year: currentYear
    }).sort({ month: 1 });
    
    // Get pending advances
    const pendingAdvances = await SalaryAdvance.getPendingAdvances(employeeId);
    const totalPendingAdvance = await SalaryAdvance.getTotalPendingAmount(employeeId);
    
    // Get leave balance
    const leaveBalance = await Leave.getLeaveBalance(employeeId, currentYear);
    
    // Calculate summary
    const summary = {
      employee: {
        id: employee._id,
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        basicSalary: employee.salary
      },
      year: currentYear,
      totalGrossSalary: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      totalPaid: 0,
      totalPending: 0,
      totalAdvanceDeducted: 0,
      pendingAdvanceAmount: totalPendingAdvance,
      monthlyBreakdown: salarySlips,
      pendingAdvances,
      leaveBalance
    };
    
    salarySlips.forEach(slip => {
      summary.totalGrossSalary += slip.grossSalary;
      summary.totalDeductions += slip.totalDeductions;
      summary.totalNetSalary += slip.netSalary;
      summary.totalPaid += slip.paidAmount || 0;
      summary.totalPending += (slip.netSalary - (slip.paidAmount || 0));
      summary.totalAdvanceDeducted += slip.deductions?.advanceDeduction || 0;
    });
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching employee salary summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee salary summary'
    });
  }
};
