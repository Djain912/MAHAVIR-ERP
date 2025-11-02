/**
 * PickList Extracted Model
 * Stores extracted pick list data from PDF files
 */

import mongoose from 'mongoose';

const pickListItemSchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
    trim: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category1: {
    type: String,
    trim: true
  },
  category2: {
    type: String,
    trim: true
  },
  mrp: {
    type: Number,
    required: true
  },
  loQty: {
    type: Number,
    default: 0
  },
  sellQty: {
    type: Number,
    default: 0
  },
  totalLoadInQty: {
    type: Number,
    default: 0
  },
  // RGB tracking per item
  actualSoldQty: {
    type: Number,
    default: 0
  },
  returnedFullQty: {
    type: Number,
    default: 0
  },
  returnedEmptyQty: {
    type: Number,
    default: 0
  },
  missingEmptyQty: {
    type: Number,
    default: 0
  }
});

const pickListExtractedSchema = new mongoose.Schema({
  pickListNumber: {
    type: String,
    required: [true, 'Pick list number is required'],
    unique: true,
    trim: true,
    index: true
  },
  loadoutNumber: {
    type: String,
    required: true,
    trim: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true
  },
  createdDate: {
    type: Date,
    required: true
  },
  loadOutDate: {
    type: Date,
    required: true
  },
  loadoutType: {
    type: String,
    trim: true
  },
  route: {
    type: String,
    trim: true
  },
  salesMan: {
    type: String,
    trim: true
  },
  items: [pickListItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalLoQty: {
    type: Number,
    default: 0
  },
  totalSellQty: {
    type: Number,
    default: 0
  },
  totalLoadInQty: {
    type: Number,
    default: 0
  },
  pdfFileName: {
    type: String,
    required: true
  },
  extractedAt: {
    type: Date,
    default: Date.now
  },
  extractionStatus: {
    type: String,
    enum: ['success', 'partial', 'failed'],
    default: 'success'
  },
  extractionErrors: [{
    message: String,
    timestamp: Date
  }],
  active: {
    type: Boolean,
    default: true
  },
  
  // Stock reduction tracking
  stockReduced: {
    type: Boolean,
    default: false
  },
  stockReducedAt: {
    type: Date
  },
  stockReductionError: {
    type: String
  },
  
  // RGB (Returnable Glass Bottles) tracking
  rgbCratesLoaded: {
    type: Number,
    default: 0,
    min: [0, 'RGB crates loaded cannot be negative']
  },
  returnedFullCrates: {
    type: Number,
    default: 0,
    min: [0, 'Returned crates cannot be negative']
  },
  returnedEmptyCrates: {
    type: Number,
    default: 0,
    min: [0, 'Returned empty crates cannot be negative']
  },
  missingEmptyCrates: {
    type: Number,
    default: 0,
    min: [0, 'Missing crates cannot be negative']
  },
  actualSold: {
    type: Number,
    default: 0
  },
  
  // Financial reconciliation
  expectedTotal: {
    type: Number,
    default: 0
  },
  actualTotal: {
    type: Number,
    default: 0
  },
  variance: {
    type: Number,
    default: 0
  },
  variancePercentage: {
    type: Number,
    default: 0
  },
  
  // Status tracking
  returnStatus: {
    type: String,
    enum: ['pending', 'partial', 'complete'],
    default: 'pending'
  },
  isReconciled: {
    type: Boolean,
    default: false
  },
  reconciledAt: {
    type: Date
  },
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  // Linked records
  dispatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriverDispatch'
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CashCollection'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
pickListExtractedSchema.index({ vehicleNumber: 1 });
pickListExtractedSchema.index({ loadOutDate: -1 });
pickListExtractedSchema.index({ salesMan: 1 });
pickListExtractedSchema.index({ createdDate: -1 });

// Virtual for formatted dates
pickListExtractedSchema.virtual('formattedCreatedDate').get(function() {
  return this.createdDate ? this.createdDate.toLocaleDateString() : '';
});

pickListExtractedSchema.virtual('formattedLoadOutDate').get(function() {
  return this.loadOutDate ? this.loadOutDate.toLocaleDateString() : '';
});

const PickListExtracted = mongoose.model('PickListExtracted', pickListExtractedSchema);

export default PickListExtracted;
