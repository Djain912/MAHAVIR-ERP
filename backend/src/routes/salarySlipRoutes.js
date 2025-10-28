/**
 * Salary Slip Routes
 */

import express from 'express';
import * as salarySlipController from '../controllers/salarySlipController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate salary slip
router.post('/generate', salarySlipController.generateSalarySlip);

// Bulk generate salary slips
router.post('/bulk-generate', salarySlipController.bulkGenerateSalarySlips);

// Get all salary slips
router.get('/', salarySlipController.getAllSalarySlips);

// Get monthly report
router.get('/report/monthly', salarySlipController.getMonthlyReport);

// Get single salary slip
router.get('/:id', salarySlipController.getSalarySlipById);

// Update salary slip
router.put('/:id', salarySlipController.updateSalarySlip);

// Approve salary slip
router.put('/:id/approve', salarySlipController.approveSalarySlip);

// Mark as paid
router.put('/:id/pay', salarySlipController.markAsPaid);

// Delete salary slip
router.delete('/:id', salarySlipController.deleteSalarySlip);

export default router;
