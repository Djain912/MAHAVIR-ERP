import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import StockIn from '../src/models/StockIn.js';
import DriverDispatch from '../src/models/DriverDispatch.js';
import Product from '../src/models/Product.js';
import Driver from '../src/models/Driver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkPopulateIssue() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Products
    console.log('=== CHECKING PRODUCTS ===');
    const productCount = await Product.countDocuments();
    console.log(`Total products: ${productCount}`);
    const sampleProducts = await Product.find().limit(3).lean();
    console.log('Sample products:', JSON.stringify(sampleProducts, null, 2));

    // Check Drivers
    console.log('\n=== CHECKING DRIVERS ===');
    const driverCount = await Driver.countDocuments();
    console.log(`Total drivers: ${driverCount}`);
    const sampleDrivers = await Driver.find().limit(3).lean();
    console.log('Sample drivers:', JSON.stringify(sampleDrivers, null, 2));

    // Check StockIn without populate
    console.log('\n=== CHECKING STOCK IN (RAW) ===');
    const stockCount = await StockIn.countDocuments();
    console.log(`Total stock records: ${stockCount}`);
    const sampleStock = await StockIn.findOne().lean();
    console.log('Sample stock (raw):', JSON.stringify(sampleStock, null, 2));

    // Check StockIn WITH populate
    console.log('\n=== CHECKING STOCK IN (POPULATED) ===');
    const stockPopulated = await StockIn.findOne()
      .populate('productId', 'name size pricePerUnit category')
      .lean();
    console.log('Sample stock (populated):', JSON.stringify(stockPopulated, null, 2));

    // Check DriverDispatch without populate
    console.log('\n=== CHECKING DRIVER DISPATCH (RAW) ===');
    const dispatchCount = await DriverDispatch.countDocuments();
    console.log(`Total dispatch records: ${dispatchCount}`);
    const sampleDispatch = await DriverDispatch.findOne().lean();
    console.log('Sample dispatch (raw):', JSON.stringify(sampleDispatch, null, 2));

    // Check DriverDispatch WITH populate
    console.log('\n=== CHECKING DRIVER DISPATCH (POPULATED) ===');
    const dispatchPopulated = await DriverDispatch.findOne()
      .populate('driverId', 'name phone role')
      .lean();
    console.log('Sample dispatch (populated):', JSON.stringify(dispatchPopulated, null, 2));

    // Check if productId in stock matches any product
    if (sampleStock && sampleStock.productId) {
      console.log('\n=== VALIDATING PRODUCT REFERENCE ===');
      const productExists = await Product.findById(sampleStock.productId);
      if (productExists) {
        console.log('✅ Product reference is valid:', productExists.name);
      } else {
        console.log('❌ Product reference is INVALID - Product not found!');
        console.log('Stock productId:', sampleStock.productId);
      }
    }

    // Check if driverId in dispatch matches any driver
    if (sampleDispatch && sampleDispatch.driverId) {
      console.log('\n=== VALIDATING DRIVER REFERENCE ===');
      const driverExists = await Driver.findById(sampleDispatch.driverId);
      if (driverExists) {
        console.log('✅ Driver reference is valid:', driverExists.name);
      } else {
        console.log('❌ Driver reference is INVALID - Driver not found!');
        console.log('Dispatch driverId:', sampleDispatch.driverId);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPopulateIssue();
