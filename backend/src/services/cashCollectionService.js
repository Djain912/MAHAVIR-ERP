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
    creditReceivedCash,
    creditReceivedCheque,
    bounceReceivedCash,
    bounceReceivedCheque,
    emptyBottlesReceived,
    // NEW FIELDS
    invoiceNumber,
    outletName,
    salesmanName,
    dailyExpenseAmount,
    expenseNotes,
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

  // Get the last collection for this driver to get previous cumulative variance
  const lastCollection = await CashCollection.findOne({ driverId })
    .sort({ collectionDate: -1, createdAt: -1 })
    .select('cumulativeVariance');
  
  const previousVariance = lastCollection?.cumulativeVariance || 0;

  // Create cash collection
  const cashCollection = new CashCollection({
    driverId,
    dispatchId,
    collectionDate: collectionDate || new Date(),
    denominations,
    coins: collectionData.coins || 0,
    totalCashCollected,
    totalChequeReceived: totalChequeReceived || 0,
    totalOnlineReceived: totalOnlineReceived || 0,
    totalCreditGiven: totalCreditGiven || 0,
    creditReceivedCash: creditReceivedCash || 0,
    creditReceivedCheque: creditReceivedCheque || 0,
    bounceReceivedCash: bounceReceivedCash || 0,
    bounceReceivedCheque: bounceReceivedCheque || 0,
    emptyBottlesReceived: emptyBottlesReceived || 0,
    // NEW FIELDS
    invoiceNumber: invoiceNumber || '',
    outletName: outletName || '',
    salesmanName: salesmanName || '',
    dailyExpenseAmount: dailyExpenseAmount || 0,
    expenseNotes: expenseNotes || '',
    expectedCash,
    previousVariance,
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

  const collections = await CashCollection.find(query).sort({ collectionDate: -1, createdAt: -1 });

  console.log(`📊 Getting stats for driver ${driverId}, found ${collections.length} collections`);

  const stats = {
    totalCollections: collections.length,
    totalCashCollected: 0,
    totalExpectedCash: 0,
    totalVariance: 0,
    cumulativeVariance: 0,
    submitted: 0,
    verified: 0,
    reconciled: 0
  };

  // Get the latest cumulative variance (from most recent collection)
  if (collections.length > 0) {
    stats.cumulativeVariance = collections[0].cumulativeVariance || 0;
    console.log(`📊 Latest collection cumulative variance: ${stats.cumulativeVariance}`);
    console.log(`📊 Latest collection data:`, {
      id: collections[0]._id,
      date: collections[0].collectionDate,
      variance: collections[0].variance,
      previousVariance: collections[0].previousVariance,
      cumulativeVariance: collections[0].cumulativeVariance
    });
  }

  collections.forEach(collection => {
    stats.totalCashCollected += collection.totalCashCollected;
    stats.totalExpectedCash += collection.expectedCash;
    stats.totalVariance += collection.variance;

    if (collection.status === 'Submitted') stats.submitted++;
    if (collection.status === 'Verified') stats.verified++;
    if (collection.status === 'Reconciled') stats.reconciled++;
  });

  console.log(`📊 Returning stats:`, stats);
  return stats;
};

/**
 * Update collection details (cheque, credit, bounce)
 */
export const updateCollectionDetails = async (collectionId, details, updatedBy) => {
  const collection = await CashCollection.findById(collectionId);

  if (!collection) {
    throw new Error('Cash collection not found');
  }

  // Update fields based on what's provided
  const updateData = {};

  // Cheque details
  if (details.chequeDetails) {
    updateData.chequeNumber = details.chequeDetails.chequeNumber;
    updateData.bankName = details.chequeDetails.bankName;
    updateData.chequeDate = details.chequeDetails.chequeDate;
  }

  // Credit details
  if (details.creditDetails) {
    updateData.creditCustomerName = details.creditDetails.customerName;
    updateData.creditNotes = details.creditDetails.notes;
    if (details.creditDetails.amount !== undefined) {
      updateData.totalCreditGiven = details.creditDetails.amount;
    }
  }

  // Bounce details
  if (details.bounceDetails) {
    updateData.bounceChequeNumber = details.bounceDetails.chequeNumber;
    updateData.bounceDate = details.bounceDetails.bounceDate;
    updateData.bounceReason = details.bounceDetails.reason;
  }

  // Bottles details
  if (details.bottlesDetails) {
    updateData.emptyBottlesReceived = details.bottlesDetails.count;
    updateData.bottlesNotes = details.bottlesDetails.notes;
  }

  // General notes
  if (details.notes !== undefined) {
    updateData.notes = details.notes;
  }

  // Update the collection
  const updatedCollection = await CashCollection.findByIdAndUpdate(
    collectionId,
    { ...updateData, updatedBy, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('driverId', 'name phone')
    .populate('dispatchId');

  return updatedCollection;
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

/**
 * Cancel a bill/collection (marks as cancelled, returns stock to inventory)
 */
export const cancelBill = async (collectionId, cancelledBy, cancellationReason) => {
  const collection = await CashCollection.findById(collectionId)
    .populate('dispatchId')
    .populate('driverId', 'name phone');

  if (!collection) {
    throw new Error('Cash collection not found');
  }

  if (collection.isCancelled) {
    throw new Error('Bill is already cancelled');
  }

  // Only allow cancellation if not reconciled
  if (collection.status === 'Reconciled') {
    throw new Error('Cannot cancel reconciled bills. Please contact admin.');
  }

  // Calculate the amount that was collected in this bill
  const cancelledAmount = collection.totalReceived || 0;

  // Mark collection as cancelled
  collection.isCancelled = true;
  collection.cancelledAt = new Date();
  collection.cancelledBy = cancelledBy;
  collection.cancellationReason = cancellationReason;
  collection.cancelledAmount = cancelledAmount;
  collection.status = 'Submitted'; // Keep as submitted but marked cancelled

  await collection.save();

  // TODO: Return stock to inventory (future implementation)
  // This would involve:
  // 1. Getting the products from the dispatch
  // 2. Adding them back to stock intake inventory
  // 3. Updating warehouse inventory

  return await CashCollection.findById(collectionId)
    .populate('driverId', 'name phone')
    .populate('dispatchId')
    .populate('cancelledBy', 'name');
};

/**
 * Get cancelled bills
 */
export const getCancelledBills = async (filters = {}) => {
  const { driverId, startDate, endDate, page = 1, limit = 20 } = filters;

  const query = { isCancelled: true };

  if (driverId) {
    query.driverId = driverId;
  }

  if (startDate || endDate) {
    query.cancelledAt = {};
    if (startDate) {
      query.cancelledAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.cancelledAt.$lte = new Date(endDate);
    }
  }

  const skip = (page - 1) * limit;

  const [bills, total] = await Promise.all([
    CashCollection.find(query)
      .populate('driverId', 'name phone')
      .populate('dispatchId')
      .populate('cancelledBy', 'name')
      .sort({ cancelledAt: -1 })
      .skip(skip)
      .limit(limit),
    CashCollection.countDocuments(query)
  ]);

  return {
    bills,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
