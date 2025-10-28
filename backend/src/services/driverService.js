/**
 * Driver Service
 * Business logic for driver management
 */

import Driver from '../models/Driver.js';
import { generateToken } from '../utils/jwtUtils.js';

/**
 * Create a new driver
 */
export const createDriver = async (driverData) => {
  const driver = new Driver(driverData);
  await driver.save();
  return driver.toSafeObject();
};

/**
 * Get all drivers with optional filters and pagination
 */
export const getAllDrivers = async (filters = {}, page = 1, limit = 50) => {
  const query = {};
  
  if (filters.role) {
    query.role = filters.role;
  }
  
  if (filters.active !== undefined) {
    query.active = filters.active;
  }
  
  const skip = (page - 1) * limit;
  
  // Execute query with pagination
  const [drivers, total] = await Promise.all([
    Driver.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Driver.countDocuments(query)
  ]);
  
  return {
    drivers,
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
 * Get driver by ID
 */
export const getDriverById = async (driverId) => {
  const driver = await Driver.findById(driverId).select('-password').lean();
  
  if (!driver) {
    throw new Error('Driver not found');
  }
  
  return driver;
};

/**
 * Update driver
 */
export const updateDriver = async (driverId, updateData) => {
  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!driver) {
    throw new Error('Driver not found');
  }
  
  return driver;
};

/**
 * Delete (deactivate) driver
 */
export const deleteDriver = async (driverId) => {
  const driver = await Driver.findByIdAndUpdate(
    driverId,
    { active: false, updatedAt: Date.now() },
    { new: true }
  ).select('-password');
  
  if (!driver) {
    throw new Error('Driver not found');
  }
  
  return driver;
};

/**
 * Update driver password
 */
export const updateDriverPassword = async (driverId, newPassword) => {
  const driver = await Driver.findById(driverId);
  
  if (!driver) {
    throw new Error('Driver not found');
  }
  
  driver.password = newPassword;
  await driver.save();
  
  return driver.toSafeObject();
};

/**
 * Authenticate driver (login)
 */
export const authenticateDriver = async (phone, password) => {
  // Find driver by phone and include password field
  const driver = await Driver.findOne({ phone }).select('+password');
  
  if (!driver) {
    const error = new Error('Invalid phone number or password');
    error.statusCode = 401;
    throw error;
  }
  
  if (!driver.active) {
    const error = new Error('Account is deactivated. Contact administrator.');
    error.statusCode = 403;
    throw error;
  }
  
  // Check password
  const isPasswordValid = await driver.comparePassword(password);
  
  if (!isPasswordValid) {
    const error = new Error('Invalid phone number or password');
    error.statusCode = 401;
    throw error;
  }
  
  // Generate JWT token
  const token = generateToken({
    id: driver._id,
    phone: driver.phone,
    role: driver.role
  });
  
  return {
    token,
    user: driver.toSafeObject()
  };
};

/**
 * Get driver statistics
 */
export const getDriverStats = async () => {
  const totalDrivers = await Driver.countDocuments();
  const activeDrivers = await Driver.countDocuments({ active: true });
  const adminCount = await Driver.countDocuments({ role: 'Admin' });
  const supervisorCount = await Driver.countDocuments({ role: 'Supervisor' });
  const driverCount = await Driver.countDocuments({ role: 'Driver' });
  
  return {
    totalDrivers,
    activeDrivers,
    inactiveDrivers: totalDrivers - activeDrivers,
    roleDistribution: {
      admins: adminCount,
      supervisors: supervisorCount,
      drivers: driverCount
    }
  };
};
