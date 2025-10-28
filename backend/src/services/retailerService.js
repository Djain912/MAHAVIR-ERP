/**
 * Retailer Service
 * Business logic for retailer management
 */

import Retailer from '../models/Retailer.js';

/**
 * Create a new retailer
 */
export const createRetailer = async (retailerData) => {
  const retailer = new Retailer(retailerData);
  await retailer.save();
  return retailer;
};

/**
 * Get all retailers with optional filters and pagination
 */
export const getAllRetailers = async (filters = {}, page = 1, limit = 50) => {
  const query = {};
  
  if (filters.route) {
    query.route = filters.route;
  }
  
  if (filters.active !== undefined) {
    query.active = filters.active;
  }
  
  const skip = (page - 1) * limit;
  
  const [retailers, total] = await Promise.all([
    Retailer.find(query)
      .select('name address phone route active createdAt')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Retailer.countDocuments(query)
  ]);
  
  return {
    retailers,
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
 * Get retailer by ID
 */
export const getRetailerById = async (retailerId) => {
  const retailer = await Retailer.findById(retailerId)
    .select('name address phone route active createdAt')
    .lean();
  
  if (!retailer) {
    throw new Error('Retailer not found');
  }
  
  return retailer;
};

/**
 * Update retailer
 */
export const updateRetailer = async (retailerId, updateData) => {
  const retailer = await Retailer.findByIdAndUpdate(
    retailerId,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  
  if (!retailer) {
    throw new Error('Retailer not found');
  }
  
  return retailer;
};

/**
 * Delete (deactivate) retailer
 */
export const deleteRetailer = async (retailerId) => {
  const retailer = await Retailer.findByIdAndUpdate(
    retailerId,
    { active: false, updatedAt: Date.now() },
    { new: true }
  );
  
  if (!retailer) {
    throw new Error('Retailer not found');
  }
  
  return retailer;
};

/**
 * Get all routes
 */
export const getAllRoutes = async () => {
  const routes = await Retailer.distinct('route', { active: true });
  return routes.sort();
};

/**
 * Get retailer statistics
 */
export const getRetailerStats = async () => {
  const totalRetailers = await Retailer.countDocuments();
  const activeRetailers = await Retailer.countDocuments({ active: true });
  
  const routeStats = await Retailer.aggregate([
    { $match: { active: true } },
    {
      $group: {
        _id: '$route',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return {
    totalRetailers,
    activeRetailers,
    inactiveRetailers: totalRetailers - activeRetailers,
    routeDistribution: routeStats.map(stat => ({
      route: stat._id,
      count: stat.count
    }))
  };
};
