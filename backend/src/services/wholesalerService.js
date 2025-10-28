/**
 * Wholesaler Service
 * Business logic for wholesaler management
 */

import Wholesaler from '../models/Wholesaler.js';

/**
 * Create a new wholesaler
 */
export const createWholesaler = async (wholesalerData) => {
  const wholesaler = new Wholesaler(wholesalerData);
  await wholesaler.save();
  return wholesaler;
};

/**
 * Get all wholesalers with pagination and filters
 */
export const getAllWholesalers = async (filters = {}, page = 1, limit = 50) => {
  const query = {};
  
  console.log('🔍 Service filters received:', filters);
  
  if (filters.active !== undefined) {
    query.active = filters.active;
    console.log('🔍 Active filter applied:', query.active);
  }
  
  if (filters.city) {
    query.city = new RegExp(filters.city, 'i');
  }
  
  if (filters.state) {
    query.state = new RegExp(filters.state, 'i');
  }
  
  if (filters.search) {
    query.$or = [
      { name: new RegExp(filters.search, 'i') },
      { businessName: new RegExp(filters.search, 'i') },
      { phone: new RegExp(filters.search, 'i') }
    ];
  }
  
  console.log('🔍 Final MongoDB query:', query);
  
  const skip = (page - 1) * limit;
  
  const [wholesalers, total] = await Promise.all([
    Wholesaler.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Wholesaler.countDocuments(query)
  ]);
  
  return {
    wholesalers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get wholesaler by ID
 */
export const getWholesalerById = async (id) => {
  const wholesaler = await Wholesaler.findById(id);
  if (!wholesaler) {
    throw new Error('Wholesaler not found');
  }
  return wholesaler;
};

/**
 * Update wholesaler
 */
export const updateWholesaler = async (id, updateData) => {
  const wholesaler = await Wholesaler.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!wholesaler) {
    throw new Error('Wholesaler not found');
  }
  
  return wholesaler;
};

/**
 * Delete wholesaler
 */
export const deleteWholesaler = async (id) => {
  const wholesaler = await Wholesaler.findByIdAndDelete(id);
  if (!wholesaler) {
    throw new Error('Wholesaler not found');
  }
  return wholesaler;
};

/**
 * Update wholesaler outstanding balance
 */
export const updateOutstandingBalance = async (id, amount) => {
  const wholesaler = await Wholesaler.findById(id);
  if (!wholesaler) {
    throw new Error('Wholesaler not found');
  }
  
  wholesaler.outstandingBalance += amount;
  await wholesaler.save();
  
  return wholesaler;
};
