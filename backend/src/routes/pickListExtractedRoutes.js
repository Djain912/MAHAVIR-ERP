/**
 * PickList Extracted Routes
 * API endpoints for extracted pick list operations
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth.js';
import * as pickListExtractedController from '../controllers/pickListExtractedController.js';

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/picklists/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'picklist-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/picklists-extracted/upload
 * @desc    Upload and extract pick list from PDF
 * @access  Private
 */
router.post('/upload', upload.single('pdf'), pickListExtractedController.extractAndSavePickList);

/**
 * @route   GET /api/picklists-extracted
 * @desc    Get all extracted pick lists
 * @access  Private
 */
router.get('/', pickListExtractedController.getAllPickLists);

/**
 * @route   GET /api/picklists-extracted/stats/summary
 * @desc    Get pick list statistics
 * @access  Private
 */
router.get('/stats/summary', pickListExtractedController.getPickListStats);

/**
 * @route   GET /api/picklists-extracted/number/:pickListNumber
 * @desc    Get pick list by pick list number
 * @access  Private
 */
router.get('/number/:pickListNumber', pickListExtractedController.getPickListByNumber);

/**
 * @route   GET /api/picklists-extracted/:id
 * @desc    Get pick list by ID
 * @access  Private
 */
router.get('/:id', pickListExtractedController.getPickListById);

/**
 * @route   PUT /api/picklists-extracted/:id
 * @desc    Update pick list
 * @access  Private
 */
router.put('/:id', pickListExtractedController.updatePickList);

/**
 * @route   DELETE /api/picklists-extracted/:id
 * @desc    Delete pick list
 * @access  Private
 */
router.delete('/:id', pickListExtractedController.deletePickList);

export default router;
