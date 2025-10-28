/**
 * Product Model
 * Represents Coca-Cola products with different sizes
 */

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  size: {
    type: String,
    required: [true, 'Product size is required'],
    trim: true,
    maxlength: [50, 'Size cannot exceed 50 characters']
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price cannot be negative']
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
productSchema.index({ name: 1, size: 1 }, { unique: true }); // Prevent duplicates
productSchema.index({ active: 1 }); // Active products filtering
productSchema.index({ name: 1 }); // Name-based search
productSchema.index({ active: 1, name: 1, size: 1 }); // Active products sorted
productSchema.index({ name: 'text' }); // Text search

const Product = mongoose.model('Product', productSchema);

export default Product;
