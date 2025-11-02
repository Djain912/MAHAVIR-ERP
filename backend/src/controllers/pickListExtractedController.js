/**
 * PickList Extracted Controller
 * Handles HTTP requests for extracted pick list operations
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import PickListExtracted from '../models/PickListExtracted.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { reduceStockForPickList, reverseStockReduction } from '../services/stockService.js';
import { processRGBReturns, getRGBTrackingRecords, getRGBTrackingById, verifyRGBReturns, settleRGBReturns, getRGBStatistics } from '../services/rgbTrackingService.js';
import { reconcilePickList, getReconciliationReports, getReconciliationStatistics, getVarianceBreakdown } from '../services/reconciliationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract and save pick list from PDF
 * POST /api/picklists-extracted/upload
 */
export const extractAndSavePickList = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No PDF file uploaded');
    }

    const pdfPath = req.file.path;
    const pythonScript = path.join(__dirname, '../../extract_picklist_advanced.py');

    console.log('📄 Extracting PDF:', pdfPath);

    // Execute Python extraction script
    const python = spawn('python', [pythonScript, pdfPath]);
    
    let dataString = '';
    let errorString = '';

    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    python.on('close', async (code) => {
      if (code !== 0) {
        console.error('❌ Python extraction failed:', errorString);
        return errorResponse(res, 500, 'PDF extraction failed', { error: errorString });
      }

      try {
        const extractedData = JSON.parse(dataString);
        console.log('✅ Extracted data:', extractedData.pickListNumber);

        // Check if pick list already exists
        const existing = await PickListExtracted.findOne({ 
          pickListNumber: extractedData.pickListNumber 
        });

        if (existing) {
          // Update existing picklist instead of throwing error
          console.log('⚠️ Pick list already exists, updating:', extractedData.pickListNumber);
          Object.assign(existing, extractedData);
          await existing.save();
          
          return successResponse(res, 200, 'Pick list updated successfully', existing);
        }

        // Save to database
        const pickList = new PickListExtracted(extractedData);
        await pickList.save();

        // AUTO-REDUCE STOCK ✅
        try {
          const stockResult = await reduceStockForPickList(pickList._id);
          console.log('✅ Stock reduced for pick list:', pickList.pickListNumber, stockResult.message);
          
          return successResponse(res, 201, 'Pick list extracted and stock reduced', {
            pickList,
            stockReduction: stockResult
          });
        } catch (stockError) {
          console.error('❌ Stock reduction failed:', stockError.message);
          pickList.stockReductionError = stockError.message;
          await pickList.save();
          
          return successResponse(res, 201, 'Pick list extracted but stock reduction failed', {
            pickList,
            stockReductionError: stockError.message
          });
        }
      } catch (error) {
        console.error('❌ Error saving pick list:', error);
        return errorResponse(res, 500, 'Failed to save extracted data', { error: error.message });
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all extracted pick lists
 * GET /api/picklists-extracted
 */
export const getAllPickLists = async (req, res, next) => {
  try {
    const filters = {
      active: req.query.active !== undefined ? req.query.active === 'true' : undefined,
      vehicleNumber: req.query.vehicleNumber,
      salesMan: req.query.salesMan,
      loadoutType: req.query.loadoutType,
      search: req.query.search
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (filters.active !== undefined) {
      query.active = filters.active;
    }

    if (filters.vehicleNumber) {
      query.vehicleNumber = new RegExp(filters.vehicleNumber, 'i');
    }

    if (filters.salesMan) {
      query.salesMan = new RegExp(filters.salesMan, 'i');
    }

    if (filters.loadoutType) {
      query.loadoutType = new RegExp(filters.loadoutType, 'i');
    }

    if (filters.search) {
      query.$or = [
        { pickListNumber: new RegExp(filters.search, 'i') },
        { loadoutNumber: new RegExp(filters.search, 'i') },
        { vehicleNumber: new RegExp(filters.search, 'i') },
        { salesMan: new RegExp(filters.search, 'i') },
        { route: new RegExp(filters.search, 'i') }
      ];
    }

    const [pickLists, total] = await Promise.all([
      PickListExtracted.find(query)
        .sort({ loadOutDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PickListExtracted.countDocuments(query)
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return res.status(200).json({
      success: true,
      message: 'Pick lists retrieved successfully',
      data: pickLists,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pick list by ID
 * GET /api/picklists-extracted/:id
 */
export const getPickListById = async (req, res, next) => {
  try {
    const pickList = await PickListExtracted.findById(req.params.id);
    
    if (!pickList) {
      return errorResponse(res, 404, 'Pick list not found');
    }

    return successResponse(res, 200, 'Pick list retrieved successfully', pickList);
  } catch (error) {
    next(error);
  }
};

/**
 * Get pick list by pick list number
 * GET /api/picklists-extracted/number/:pickListNumber
 */
export const getPickListByNumber = async (req, res, next) => {
  try {
    const pickList = await PickListExtracted.findOne({ 
      pickListNumber: req.params.pickListNumber 
    });
    
    if (!pickList) {
      return errorResponse(res, 404, 'Pick list not found');
    }

    return successResponse(res, 200, 'Pick list retrieved successfully', pickList);
  } catch (error) {
    next(error);
  }
};

/**
 * Update pick list
 * PUT /api/picklists-extracted/:id
 */
export const updatePickList = async (req, res, next) => {
  try {
    const pickList = await PickListExtracted.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!pickList) {
      return errorResponse(res, 404, 'Pick list not found');
    }

    return successResponse(res, 200, 'Pick list updated successfully', pickList);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete pick list
 * DELETE /api/picklists-extracted/:id
 */
export const deletePickList = async (req, res, next) => {
  try {
    const pickList = await PickListExtracted.findByIdAndDelete(req.params.id);

    if (!pickList) {
      return errorResponse(res, 404, 'Pick list not found');
    }

    return successResponse(res, 200, 'Pick list deleted successfully', pickList);
  } catch (error) {
    next(error);
  }
};

/**
 * Get pick list statistics
 * GET /api/picklists-extracted/stats/summary
 */
export const getPickListStats = async (req, res, next) => {
  try {
    const stats = await PickListExtracted.aggregate([
      {
        $group: {
          _id: null,
          totalPickLists: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          totalLoQty: { $sum: '$totalLoQty' },
          totalSellQty: { $sum: '$totalSellQty' },
          totalLoadInQty: { $sum: '$totalLoadInQty' },
          uniqueVehicles: { $addToSet: '$vehicleNumber' },
          uniqueSalesMen: { $addToSet: '$salesMan' }
        }
      },
      {
        $project: {
          _id: 0,
          totalPickLists: 1,
          totalItems: 1,
          totalLoQty: { $round: ['$totalLoQty', 2] },
          totalSellQty: { $round: ['$totalSellQty', 2] },
          totalLoadInQty: { $round: ['$totalLoadInQty', 2] },
          uniqueVehicles: { $size: '$uniqueVehicles' },
          uniqueSalesMen: { $size: '$uniqueSalesMen' }
        }
      }
    ]);

    return successResponse(res, 200, 'Statistics retrieved successfully', stats[0] || {});
  } catch (error) {
    next(error);
  }
};

/**
 * Manually reduce stock for pick list
 * POST /api/picklists-extracted/:id/reduce-stock
 */
export const manualReduceStock = async (req, res, next) => {
  try {
    const result = await reduceStockForPickList(req.params.id);
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Reverse stock reduction
 * POST /api/picklists-extracted/:id/reverse-stock
 */
export const reverseStock = async (req, res, next) => {
  try {
    const result = await reverseStockReduction(req.params.id);
    return successResponse(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Process RGB returns
 * POST /api/picklists-extracted/:id/rgb-returns
 */
export const processRGBReturnsHandler = async (req, res, next) => {
  try {
    const { driverId, returnedFullCrates, returnedEmptyCrates } = req.body;
    
    if (!driverId) {
      return errorResponse(res, 400, 'Driver ID is required');
    }
    
    const rgbData = {
      pickListId: req.params.id,
      driverId,
      returnedFullCrates: parseInt(returnedFullCrates) || 0,
      returnedEmptyCrates: parseInt(returnedEmptyCrates) || 0
    };
    
    const result = await processRGBReturns(rgbData);
    return successResponse(res, 200, 'RGB returns processed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get RGB tracking records
 * GET /api/picklists-extracted/rgb-tracking
 */
export const getRGBTracking = async (req, res, next) => {
  try {
    const filters = {
      driverId: req.query.driverId,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const records = await getRGBTrackingRecords(filters);
    return successResponse(res, 200, 'RGB tracking records retrieved', records);
  } catch (error) {
    next(error);
  }
};

/**
 * Get RGB tracking by ID
 * GET /api/picklists-extracted/rgb-tracking/:id
 */
export const getRGBTrackingByIdHandler = async (req, res, next) => {
  try {
    const record = await getRGBTrackingById(req.params.id);
    return successResponse(res, 200, 'RGB tracking record retrieved', record);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify RGB returns
 * POST /api/picklists-extracted/rgb-tracking/:id/verify
 */
export const verifyRGBReturnsHandler = async (req, res, next) => {
  try {
    const { verifiedById } = req.body;
    
    if (!verifiedById) {
      return errorResponse(res, 400, 'Verified by ID is required');
    }
    
    const result = await verifyRGBReturns(req.params.id, verifiedById);
    return successResponse(res, 200, 'RGB returns verified successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Settle RGB returns
 * POST /api/picklists-extracted/rgb-tracking/:id/settle
 */
export const settleRGBReturnsHandler = async (req, res, next) => {
  try {
    const result = await settleRGBReturns(req.params.id);
    return successResponse(res, 200, 'RGB returns settled successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get RGB statistics
 * GET /api/picklists-extracted/rgb-tracking/stats/summary
 */
export const getRGBStats = async (req, res, next) => {
  try {
    const filters = {
      driverId: req.query.driverId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const stats = await getRGBStatistics(filters);
    return successResponse(res, 200, 'RGB statistics retrieved', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Reconcile pick list with collection
 * POST /api/picklists-extracted/:id/reconcile
 */
export const reconcilePickListHandler = async (req, res, next) => {
  try {
    const { collectionId } = req.body;
    
    if (!collectionId) {
      return errorResponse(res, 400, 'Collection ID is required');
    }
    
    const result = await reconcilePickList(req.params.id, collectionId);
    return successResponse(res, 200, 'Reconciliation completed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reconciliation reports
 * GET /api/picklists-extracted/reconciliation/reports
 */
export const getReconciliationReportsHandler = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      vehicleNumber: req.query.vehicleNumber,
      varianceStatus: req.query.varianceStatus
    };
    
    const reports = await getReconciliationReports(filters);
    return successResponse(res, 200, 'Reconciliation reports retrieved', reports);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reconciliation statistics
 * GET /api/picklists-extracted/reconciliation/stats
 */
export const getReconciliationStatsHandler = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const stats = await getReconciliationStatistics(filters);
    return successResponse(res, 200, 'Reconciliation statistics retrieved', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get variance breakdown
 * GET /api/picklists-extracted/:id/variance-breakdown
 */
export const getVarianceBreakdownHandler = async (req, res, next) => {
  try {
    const breakdown = await getVarianceBreakdown(req.params.id);
    return successResponse(res, 200, 'Variance breakdown retrieved', breakdown);
  } catch (error) {
    next(error);
  }
};
