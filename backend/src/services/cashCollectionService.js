import CashCollection from '../models/CashCollection.js';
import DriverDispatch from '../models/DriverDispatch.js';
import Driver from '../models/Driver.js';

/**
 * Submit a new cash collection
 */
export const submitCashCollection = async (collectionData) => {
  const { 
    driverId, 
    dispatchId, 
    collectionDate, 
    denominations, 
    totalCashCollected,
    totalChequeReceived,
    totalOnlineReceived,
    totalCreditGiven,
    expectedCash, 
    notes 
  } = collectionData;

  console.log('📝 Cash collection data received:', {
    driverId,
    dispatchId,
    hasDriver: !!driverId,
    hasDispatch: !!dispatchId,
    denominationsCount: denominations?.length
  });

  if (!driverId) {
    throw new Error('Driver ID is required');
  }

  if (!dispatchId) {
    throw new Error('Dispatch ID is required');
  }

  // Validate dispatch exists and belongs to driver
  const dispatch = await DriverDispatch.findById(dispatchId);
  if (!dispatch) {
    throw new Error('Dispatch not found');
  }

  console.log('✅ Dispatch found:', {
    dispatchDriverId: dispatch.driverId,
    providedDriverId: driverId
  });

  if (dispatch.driverId.toString() !== driverId.toString()) {
    throw new Error('Dispatch does not belong to this driver');
  }

  // Check if collection already exists for this dispatch
  const existingCollection = await CashCollection.findOne({ dispatchId });
  if (existingCollection) {
    throw new Error('Cash collection already submitted for this dispatch');
  }

  // Create cash collection
  const cashCollection = new CashCollection({
    driverId,
    dispatchId,
    collectionDate: collectionDate || new Date(),
    denominations,
    totalCashCollected,
    totalChequeReceived: totalChequeReceived || 0,
    totalOnlineReceived: totalOnlineReceived || 0,
    totalCreditGiven: totalCreditGiven || 0,
    expectedCash,
    notes,
    status: 'Submitted'
  });

  await cashCollection.save();

  return await CashCollection.findById(cashCollection._id)
    .populate('driverId', 'name phone')
    .populate('dispatchId');
};

/**
 * Get all cash collections with filters
 */
export const getAllCashCollections = async (filters = {}) => {
  const {
    driverId,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = filters;

  const query = {};

  if (driverId) {
    query.driverId = driverId;
  }

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.collectionDate = {};
    if (startDate) {
      query.collectionDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.collectionDate.$lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;

  const [collections, total] = await Promise.all([
    CashCollection.find(query)
      .populate('driverId', 'name phone')
      .populate('dispatchId')
      .populate('verifiedBy', 'name')
      .sort({ collectionDate: -1 })
      .skip(skip)
      .limit(limit),
    CashCollection.countDocuments(query)
  ]);

  return {
    collections,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get cash collection by ID
 */
export const getCashCollectionById = async (collectionId) => {
  const collection = await CashCollection.findById(collectionId)
    .populate('driverId', 'name phone')
    .populate('dispatchId')
    .populate('verifiedBy', 'name');

  if (!collection) {
    throw new Error('Cash collection not found');
  }

  return collection;
};

/**
 * Verify a cash collection
 */
export const verifyCashCollection = async (collectionId, verifiedBy, notes) => {
  const collection = await CashCollection.findById(collectionId);

  if (!collection) {
    throw new Error('Cash collection not found');
  }

  if (collection.status !== 'Submitted') {
    throw new Error('Only submitted collections can be verified');
  }

  collection.status = 'Verified';
  collection.verifiedBy = verifiedBy;
  collection.verifiedAt = new Date();
  
  if (notes) {
    collection.notes = collection.notes ? `${collection.notes}\n\nVerification Notes: ${notes}` : `Verification Notes: ${notes}`;
  }

  await collection.save();

  return await CashCollection.findById(collectionId)
    .populate('driverId', 'name phone')
    .populate('dispatchId')
    .populate('verifiedBy', 'name');
};

/**
 * Reconcile a cash collection
 */
export const reconcileCashCollection = async (collectionId, reconciledBy, notes) => {
  const collection = await CashCollection.findById(collectionId);

  if (!collection) {
    throw new Error('Cash collection not found');
  }

  if (collection.status !== 'Verified') {
    throw new Error('Only verified collections can be reconciled');
  }

  collection.status = 'Reconciled';
  
  if (notes) {
    collection.notes = collection.notes ? `${collection.notes}\n\nReconciliation Notes: ${notes}` : `Reconciliation Notes: ${notes}`;
  }

  await collection.save();

  return await CashCollection.findById(collectionId)
    .populate('driverId', 'name phone')
    .populate('dispatchId')
    .populate('verifiedBy', 'name');
};

/**
 * Update cash collection (only if not verified yet)
 */
export const updateCashCollection = async (collectionId, updateData) => {
  const collection = await CashCollection.findById(collectionId);

  if (!collection) {
    throw new Error('Cash collection not found');
  }

  if (collection.status !== 'Submitted') {
    throw new Error('Only submitted collections can be updated');
  }

  const { denominations, expectedCash, notes } = updateData;

  if (denominations) {
    collection.denominations = denominations;
  }

  if (expectedCash !== undefined) {
    collection.expectedCash = expectedCash;
  }

  if (notes) {
    collection.notes = notes;
  }

  await collection.save();

  return await CashCollection.findById(collectionId)
    .populate('driverId', 'name phone')
    .populate('dispatchId');
};

/**
 * Get driver's cash collection statistics
 */
export const getDriverCashStats = async (driverId, startDate, endDate) => {
  const query = { driverId };

  if (startDate || endDate) {
    query.collectionDate = {};
    if (startDate) {
      query.collectionDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.collectionDate.$lte = new Date(endDate);
    }
  }

  const collections = await CashCollection.find(query);

  const stats = {
    totalCollections: collections.length,
    totalCashCollected: 0,
    totalExpectedCash: 0,
    totalVariance: 0,
    submitted: 0,
    verified: 0,
    reconciled: 0
  };

  collections.forEach(collection => {
    stats.totalCashCollected += collection.totalCashCollected;
    stats.totalExpectedCash += collection.expectedCash;
    stats.totalVariance += collection.variance;

    if (collection.status === 'Submitted') stats.submitted++;
    if (collection.status === 'Verified') stats.verified++;
    if (collection.status === 'Reconciled') stats.reconciled++;
  });

  return stats;
};

/**
 * Delete cash collection (only if not verified)
 */
export const deleteCashCollection = async (collectionId) => {
  const collection = await CashCollection.findById(collectionId);

  if (!collection) {
    throw new Error('Cash collection not found');
  }

  if (collection.status !== 'Submitted') {
    throw new Error('Only submitted collections can be deleted');
  }

  await CashCollection.findByIdAndDelete(collectionId);

  return { message: 'Cash collection deleted successfully' };
};
