/**
 * Cheque Management Routes
 * API endpoints for cheque tracking and management
 */

import express from 'express';
import * as chequeController from '../controllers/chequeManagementController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes (before parameterized routes to avoid conflicts)
router.get('/summary', chequeController.getChequeSummary);
router.get('/bank-summary', chequeController.getBankWiseSummary);
router.get('/stats', chequeController.getChequeStats);
router.get('/pdf', chequeController.generateChequePDF);
router.get('/', chequeController.getAllCheques);
router.get('/:id', chequeController.getChequeById);

// POST routes
router.post('/', chequeController.createCheque);
router.post('/import-from-sales', chequeController.importChequesFromSales);

// PUT routes
router.put('/bulk-status', chequeController.bulkUpdateChequeStatus);
router.put('/:id/status', chequeController.updateChequeStatus);

// DELETE routes
router.delete('/:id', chequeController.deleteCheque);

export default router;
