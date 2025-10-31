import * as cashCollectionService from '../services/cashCollectionService.js';

/**
 * Submit a new cash collection
 */
export const submitCashCollection = async (req, res, next) => {
  try {
    const collectionData = {
      ...req.body,
      driverId: req.user.role === 'Driver' ? req.user._id : req.body.driverId
    };

    const collection = await cashCollectionService.submitCashCollection(collectionData);

    res.status(201).json({
      success: true,
      message: 'Cash collection submitted successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all cash collections
 */
export const getAllCashCollections = async (req, res, next) => {
  try {
    const filters = {
      driverId: req.query.driverId,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    // If driver, only show their own collections
    if (req.user.role === 'Driver') {
      filters.driverId = req.user._id;
    }

    const result = await cashCollectionService.getAllCashCollections(filters);

    res.status(200).json({
      success: true,
      data: result.collections,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cash collection by ID
 */
export const getCashCollectionById = async (req, res, next) => {
  try {
    const collection = await cashCollectionService.getCashCollectionById(req.params.id);

    // If driver, ensure they can only see their own collection
    if (req.user.role === 'Driver' && collection.driverId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a cash collection
 */
export const verifyCashCollection = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const collection = await cashCollectionService.verifyCashCollection(
      req.params.id,
      req.user._id,
      notes
    );

    res.status(200).json({
      success: true,
      message: 'Cash collection verified successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reconcile a cash collection
 */
export const reconcileCashCollection = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const collection = await cashCollectionService.reconcileCashCollection(
      req.params.id,
      req.user._id,
      notes
    );

    res.status(200).json({
      success: true,
      message: 'Cash collection reconciled successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cash collection
 */
export const updateCashCollection = async (req, res, next) => {
  try {
    const collection = await cashCollectionService.updateCashCollection(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Cash collection updated successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver cash statistics
 */
export const getDriverCashStats = async (req, res, next) => {
  try {
    const driverId = req.user.role === 'Driver' ? req.user._id : req.params.driverId;
    const { startDate, endDate } = req.query;

    const stats = await cashCollectionService.getDriverCashStats(driverId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update collection details (cheque, credit, bounce)
 */
export const updateCollectionDetails = async (req, res, next) => {
  try {
    const collection = await cashCollectionService.updateCollectionDetails(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Collection details updated successfully',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete cash collection
 */
export const deleteCashCollection = async (req, res, next) => {
  try {
    const result = await cashCollectionService.deleteCashCollection(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a bill/collection
 */
export const cancelBill = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    
    if (!cancellationReason || cancellationReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    const collection = await cashCollectionService.cancelBill(
      req.params.id,
      req.user._id,
      cancellationReason
    );

    res.status(200).json({
      success: true,
      message: 'Bill cancelled successfully. Stock will be returned to inventory.',
      data: collection
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cancelled bills
 */
export const getCancelledBills = async (req, res, next) => {
  try {
    const filters = {
      driverId: req.query.driverId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    // If driver, only show their own cancelled bills
    if (req.user.role === 'Driver') {
      filters.driverId = req.user._id;
    }

    const result = await cashCollectionService.getCancelledBills(filters);

    res.status(200).json({
      success: true,
      data: result.bills,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};
