/**
 * Product Service
 * Business logic for product management
 */

import Product from '../models/Product.js';

/**
 * Create a new product
 */
export const createProduct = async (productData) => {
  const product = new Product(productData);
  await product.save();
  return product;
};

/**
 * Get all products
 */
export const getAllProducts = async (activeOnly = false, page = 1, limit = 100) => {
  const query = activeOnly ? { active: true } : {};
  const skip = (page - 1) * limit;
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .select('name size pricePerUnit active createdAt')
      .sort({ name: 1, size: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);
  
  return {
    products,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

/**
 * Get product by ID
 */
export const getProductById = async (productId) => {
  const product = await Product.findById(productId)
    .select('name size pricePerUnit active createdAt')
    .lean();
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return product;
};

/**
 * Update product
 */
export const updateProduct = async (productId, updateData) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return product;
};

/**
 * Delete (deactivate) product
 */
export const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { active: false, updatedAt: Date.now() },
    { new: true }
  );
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return product;
};

/**
 * Search products by name or size
 */
export const searchProducts = async (searchTerm) => {
  const products = await Product.find({
    active: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { size: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ name: 1, size: 1 });
  
  return products;
};

/**
 * Get product statistics
 */
export const getProductStats = async () => {
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ active: true });
  
  return {
    totalProducts,
    activeProducts,
    inactiveProducts: totalProducts - activeProducts
  };
};
