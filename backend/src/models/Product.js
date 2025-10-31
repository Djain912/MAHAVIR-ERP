/**
 * Product Model
 * Represents Coca-Cola products with different sizes
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  size: {
    type: String,
    trim: true,
    maxlength: [50, 'Size cannot exceed 50 characters']
  },
  pricePerUnit: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  // Additional fields from Excel data
  headBrand: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: Number
  },
  srNo: {
    type: Number
  },
  brandName: {
    type: String,
    trim: true
  },
  subSrNo: {
    type: Number
  },
  code: {
    type: String,
    trim: true,
    uppercase: true
  },
  brandFullName: {
    type: String,
    trim: true
  },
  ml: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  mrp: {
    type: String,
    trim: true
  },
  packSize: {
    type: String,
    trim: true
  },
  purchaseRate: {
    type: Number,
    default: 0,
    min: [0, 'Purchase rate cannot be negative']
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
productSchema.index({ brandFullName: 1 }, { unique: true }); // Use brandFullName as unique identifier
productSchema.index({ active: 1 }); // Active products filtering
productSchema.index({ name: 1 }); // Name-based search
productSchema.index({ active: 1, name: 1, size: 1 }); // Active products sorted
productSchema.index({ name: 'text', brandFullName: 'text' }); // Text search

const Product = mongoose.model('Product', productSchema);

export default Product;
