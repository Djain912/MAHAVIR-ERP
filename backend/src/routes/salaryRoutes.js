/**
 * Salary Management Routes
 * Comprehensive routes for salary slips, advances, and leaves
 */

import express from 'express';
import {
  // Salary Slip Operations
  generateSalarySlip,
  generateAllSalarySlips,
  getAllSalarySlips,
  getSalarySlipById,
  updateSalarySlip,
  markSalaryAsPaid,
  deleteSalarySlip,
  getMonthlySalaryReport,
  
  // Salary Advance Operations
  createAdvance,
  getAllAdvances,
  getAdvanceById,
  updateAdvance,
  approveAdvance,
  rejectAdvance,
  getEmployeePendingAdvances,
  deleteAdvance,
  
  // Leave Operations
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  approveLeave,
  rejectLeave,
  getEmployeeLeaveBalance,
  deleteLeave,
  
  // Employee Summary
  getEmployeeSalarySummary
} from '../controllers/salaryController.js';

import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============= SALARY SLIP ROUTES =============
router.post('/generate', generateSalarySlip);
router.post('/generate-all', generateAllSalarySlips);
router.get('/slips', getAllSalarySlips);
router.get('/slips/:id', getSalarySlipById);
router.put('/slips/:id', updateSalarySlip);
router.post('/slips/:id/pay', markSalaryAsPaid);
router.delete('/slips/:id', deleteSalarySlip);
router.get('/report/:month/:year', getMonthlySalaryReport);

// ============= SALARY ADVANCE ROUTES =============
router.post('/advances', createAdvance);
router.get('/advances', getAllAdvances);
router.get('/advances/:id', getAdvanceById);
router.put('/advances/:id', updateAdvance);
router.post('/advances/:id/approve', approveAdvance);
router.post('/advances/:id/reject', rejectAdvance);
router.get('/advances/employee/:employeeId/pending', getEmployeePendingAdvances);
router.delete('/advances/:id', deleteAdvance);

// ============= LEAVE ROUTES =============
router.post('/leaves', createLeave);
router.get('/leaves', getAllLeaves);
router.get('/leaves/:id', getLeaveById);
router.put('/leaves/:id', updateLeave);
router.post('/leaves/:id/approve', approveLeave);
router.post('/leaves/:id/reject', rejectLeave);
router.get('/leaves/employee/:employeeId/balance', getEmployeeLeaveBalance);
router.delete('/leaves/:id', deleteLeave);

// ============= EMPLOYEE SUMMARY =============
router.get('/employee/:employeeId/summary', getEmployeeSalarySummary);

export default router;
