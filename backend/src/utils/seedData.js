/**
 * Database Seed Script
 * Seeds the database with sample data for testing
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Driver from '../models/Driver.js';
import Retailer from '../models/Retailer.js';
import Product from '../models/Product.js';

dotenv.config();

// Sample data
const drivers = [
  {
    name: 'Admin User',
    phone: '9999999999',
    password: 'admin123',
    role: 'Admin'
  },
  {
    name: 'Rajesh Kumar',
    phone: '9876543210',
    password: 'driver123',
    role: 'Driver'
  },
  {
    name: 'Amit Sharma',
    phone: '9876543211',
    password: 'driver123',
    role: 'Driver'
  },
  {
    name: 'Priya Singh',
    phone: '9876543212',
    password: 'supervisor123',
    role: 'Supervisor'
  }
];

const retailers = [
  {
    name: 'Sharma General Store',
    address: '123 Main Street, Sector 1, New Delhi',
    phone: '9111111111',
    route: 'Route A'
  },
  {
    name: 'Patel Supermarket',
    address: '456 Market Road, Sector 2, New Delhi',
    phone: '9111111112',
    route: 'Route A'
  },
  {
    name: 'Krishna Beverages',
    address: '789 Station Road, Sector 3, New Delhi',
    phone: '9111111113',
    route: 'Route B'
  },
  {
    name: 'Gupta Trading Co.',
    address: '321 Mall Road, Sector 4, New Delhi',
    phone: '9111111114',
    route: 'Route B'
  },
  {
    name: 'Raj Enterprises',
    address: '654 Park Street, Sector 5, New Delhi',
    phone: '9111111115',
    route: 'Route C'
  },
  {
    name: 'Meena Retail Shop',
    address: '987 Church Road, Sector 6, New Delhi',
    phone: '9111111116',
    route: 'Route C'
  }
];

const products = [
  {
    name: 'Coca-Cola',
    size: '200ml',
    pricePerUnit: 10
  },
  {
    name: 'Coca-Cola',
    size: '300ml',
    pricePerUnit: 15
  },
  {
    name: 'Coca-Cola',
    size: '500ml',
    pricePerUnit: 20
  },
  {
    name: 'Coca-Cola',
    size: '750ml',
    pricePerUnit: 30
  },
  {
    name: 'Coca-Cola',
    size: '1L',
    pricePerUnit: 40
  },
  {
    name: 'Coca-Cola',
    size: '1.5L',
    pricePerUnit: 55
  },
  {
    name: 'Coca-Cola',
    size: '2L',
    pricePerUnit: 70
  },
  {
    name: 'Sprite',
    size: '500ml',
    pricePerUnit: 20
  },
  {
    name: 'Sprite',
    size: '1L',
    pricePerUnit: 40
  },
  {
    name: 'Sprite',
    size: '2L',
    pricePerUnit: 70
  },
  {
    name: 'Fanta',
    size: '500ml',
    pricePerUnit: 20
  },
  {
    name: 'Fanta',
    size: '1L',
    pricePerUnit: 40
  },
  {
    name: 'Thums Up',
    size: '500ml',
    pricePerUnit: 20
  },
  {
    name: 'Thums Up',
    size: '1L',
    pricePerUnit: 40
  },
  {
    name: 'Limca',
    size: '500ml',
    pricePerUnit: 20
  },
  {
    name: 'Limca',
    size: '1L',
    pricePerUnit: 40
  }
];

/**
 * Seed database
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Driver.deleteMany({});
    await Retailer.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Insert drivers (using create to trigger password hashing)
    console.log('👥 Seeding drivers...');
    await Driver.create(drivers);
    console.log(`✅ ${drivers.length} drivers created`);
    
    // Insert retailers
    console.log('🏪 Seeding retailers...');
    await Retailer.insertMany(retailers);
    console.log(`✅ ${retailers.length} retailers created`);
    
    // Insert products
    console.log('🥤 Seeding products...');
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products created`);
    
    console.log('\n✨ Database seeded successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('   Admin:');
    console.log('   - Phone: 9999999999');
    console.log('   - Password: admin123\n');
    console.log('   Driver:');
    console.log('   - Phone: 9876543210');
    console.log('   - Password: driver123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
