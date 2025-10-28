/**
 * PickList Extracted Controller
 * Handles HTTP requests for extracted pick list operations
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import PickListExtracted from '../models/PickListExtracted.js';
import { successResponse, errorResponse } from '../utils/response.js';

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

        return successResponse(res, 201, 'Pick list extracted and saved successfully', pickList);
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
