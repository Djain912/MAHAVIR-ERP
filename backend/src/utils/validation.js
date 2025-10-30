/**
 * Validation Schemas using Joi
 * Centralized validation rules for all API endpoints
 */

import Joi from 'joi';

// Driver Validation Schemas
export const driverValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Admin', 'Supervisor', 'Driver').default('Driver')
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    role: Joi.string().valid('Admin', 'Supervisor', 'Driver'),
    active: Joi.boolean()
  }).min(1),
  
  updatePassword: Joi.object({
    newPassword: Joi.string().min(6).required()
  }),
  
  login: Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().required()
  })
};

// Retailer Validation Schemas
export const retailerValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    address: Joi.string().max(500).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    route: Joi.string().max(100).required()
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(200),
    address: Joi.string().max(500),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    route: Joi.string().max(100),
    active: Joi.boolean()
  }).min(1)
};

// Product Validation Schemas
export const productValidation = {
  create: Joi.object({
    name: Joi.string().max(200).required(),
    size: Joi.string().max(50).required(),
    pricePerUnit: Joi.number().min(0).required()
  }),
  
  update: Joi.object({
    name: Joi.string().max(200),
    size: Joi.string().max(50),
    pricePerUnit: Joi.number().min(0),
    active: Joi.boolean()
  }).min(1)
};

// Stock Validation Schema
export const stockValidation = {
  create: Joi.object({
    productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product is required'
    }),
    product: Joi.string().optional(), // Allow but will be stripped
    quantity: Joi.number().integer().min(1).required().messages({
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required'
    }),
    batchNo: Joi.string().max(100).required().messages({
      'string.max': 'Batch number cannot exceed 100 characters',
      'any.required': 'Batch number is required'
    }),
    batchNumber: Joi.string().optional(), // Allow but will be stripped
    dateReceived: Joi.date().optional(),
    expiryDate: Joi.date().required().messages({
      'any.required': 'Expiry date is required'
    }),
    ratePerUnit: Joi.number().min(0).optional(),
    purchaseRate: Joi.number().min(0).required().messages({
      'number.min': 'Purchase rate cannot be negative',
      'any.required': 'Purchase rate is required'
    }),
    sellingRate: Joi.number().min(0).required().messages({
      'number.min': 'Selling rate cannot be negative',
      'any.required': 'Selling rate is required'
    })
  })
};

// Driver Dispatch Validation Schema
export const driverDispatchValidation = {
  create: Joi.object({
    driverId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    date: Joi.date().required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        quantity: Joi.number().integer().min(1).required()
      })
    ).min(1).required(),
    cashDenominations: Joi.array().items(
      Joi.object({
        noteValue: Joi.number().valid(1, 2, 5, 10, 20, 50, 100, 200, 500, 2000).required(),
        noteCount: Joi.number().integer().min(0).required()
      })
    ).optional().default([]) // Allow empty array or omit entirely
  })
};

// Sale Validation Schema
export const saleValidation = {
  create: Joi.object({
    driverId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    retailerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    dispatchId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    saleDate: Joi.date().default(Date.now),
    productsSold: Joi.array().items(
      Joi.object({
        productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        quantity: Joi.number().integer().min(1).required(),
        ratePerUnit: Joi.number().min(0).required(),
        amount: Joi.number().min(0).required()
      })
    ).min(1).required(),
    payments: Joi.object({
      cash: Joi.number().min(0).default(0),
      cheque: Joi.array().items(
        Joi.object({
          chequeNumber: Joi.string().required(),
          amount: Joi.number().min(0).required(),
          photoUrl: Joi.string().uri().required()
        })
      ).default([]),
      credit: Joi.number().min(0).default(0)
    }).required(),
    totalAmount: Joi.number().min(0).required(),
    totalPaid: Joi.number().min(0).required(),
    emptyBottlesReturned: Joi.number().integer().min(0).default(0),
    geoLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    }).optional()
  })
};

// Report Query Validation
export const reportValidation = {
  dateRange: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    driverId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional()
  })
};
