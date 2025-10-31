import express from 'express';
import * as cashCollectionController from '../controllers/cashCollectionController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Submit cash collection (Driver can submit their own, Admin/Supervisor can submit for any driver)
router.post('/', 
  authorize('Admin', 'Supervisor', 'Driver'),
  cashCollectionController.submitCashCollection
);

// Get all cash collections (Drivers see only their own, Admin/Supervisor see all)
router.get('/',
  authorize('Admin', 'Supervisor', 'Driver'),
  cashCollectionController.getAllCashCollections
);

// Get driver cash statistics
router.get('/stats/:driverId?',
  authorize('Admin', 'Supervisor', 'Driver'),
  cashCollectionController.getDriverCashStats
);

// Get cash collection by ID
router.get('/:id',
  authorize('Admin', 'Supervisor', 'Driver'),
  cashCollectionController.getCashCollectionById
);

// Update cash collection (only before verification)
router.put('/:id',
  authorize('Admin', 'Supervisor', 'Driver'),
  cashCollectionController.updateCashCollection
);

// Verify cash collection (Admin/Supervisor only)
router.patch('/:id/verify',
  authorize('Admin', 'Supervisor'),
  cashCollectionController.verifyCashCollection
);

// Reconcile cash collection (Admin only)
router.patch('/:id/reconcile',
  authorize('Admin'),
  cashCollectionController.reconcileCashCollection
);

// Update collection details (cheque, credit, bounce) - Admin only
router.patch('/:id/details',
  authorize('Admin', 'Supervisor'),
  cashCollectionController.updateCollectionDetails
);

// Cancel bill (Admin/Supervisor/Driver can cancel)
router.patch('/:id/cancel',
  authorize('Admin', 'Supervisor', 'Driver'),
  cashCollectionController.cancelBill
);

// Get cancelled bills
router.get('/cancelled/list',
  authorize('Admin', 'Supervisor', 'Driver'),
  cashCollectionController.getCancelledBills
);

// Delete cash collection (Admin only, only before verification)
router.delete('/:id',
  authorize('Admin'),
  cashCollectionController.deleteCashCollection
);

export default router;
