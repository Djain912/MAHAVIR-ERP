/**
 * Database Seeding Script
 * Cleans and populates database with comprehensive test data
 * Preserves User/Admin credentials
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Driver from '../src/models/Driver.js';
import Retailer from '../src/models/Retailer.js';
import Wholesaler from '../src/models/Wholesaler.js';
import Product from '../src/models/Product.js';
import StockIn from '../src/models/StockIn.js';
import DriverDispatch from '../src/models/DriverDispatch.js';
import DriverDispatchItem from '../src/models/DriverDispatchItem.js';
import Sale from '../src/models/Sale.js';
import CashCollection from '../src/models/CashCollection.js';
import ChequeManagement from '../src/models/ChequeManagement.js';
import PickListExtracted from '../src/models/PickListExtracted.js';
import Attendance from '../src/models/Attendance.js';
import Leave from '../src/models/Leave.js';
import Expense from '../src/models/Expense.js';
import SalaryAdvance from '../src/models/SalaryAdvance.js';
import SalarySlip from '../src/models/SalarySlip.js';
import CounterSale from '../src/models/CounterSale.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clean all collections (except Admin users)
const cleanDatabase = async () => {
  console.log('\n🧹 Cleaning database...');
  
  // Delete all drivers except Admin role
  const deletedDrivers = await Driver.deleteMany({ role: { $ne: 'Admin' } });
  const deletedRetailers = await Retailer.deleteMany({});
  const deletedWholesalers = await Wholesaler.deleteMany({});
  const deletedProducts = await Product.deleteMany({});
  const deletedStock = await StockIn.deleteMany({});
  const deletedDispatches = await DriverDispatch.deleteMany({});
  const deletedDispatchItems = await DriverDispatchItem.deleteMany({});
  const deletedSales = await Sale.deleteMany({});
  const deletedCashCollections = await CashCollection.deleteMany({});
  const deletedCheques = await ChequeManagement.deleteMany({});
  const deletedPickListsExtracted = await PickListExtracted.deleteMany({});
  const deletedAttendance = await Attendance.deleteMany({});
  const deletedLeaves = await Leave.deleteMany({});
  const deletedExpenses = await Expense.deleteMany({});
  const deletedSalaryAdvances = await SalaryAdvance.deleteMany({});
  const deletedSalarySlips = await SalarySlip.deleteMany({});
  const deletedCounterSales = await CounterSale.deleteMany({});
  
  console.log('✅ Database cleaned:');
  console.log(`   - Drivers (non-admin): ${deletedDrivers.deletedCount}`);
  console.log(`   - Retailers: ${deletedRetailers.deletedCount}`);
  console.log(`   - Wholesalers: ${deletedWholesalers.deletedCount}`);
  console.log(`   - Products: ${deletedProducts.deletedCount}`);
  console.log(`   - Stock: ${deletedStock.deletedCount}`);
  console.log(`   - Dispatches: ${deletedDispatches.deletedCount}`);
  console.log(`   - Dispatch Items: ${deletedDispatchItems.deletedCount}`);
  console.log(`   - Sales: ${deletedSales.deletedCount}`);
  console.log(`   - Cash Collections: ${deletedCashCollections.deletedCount}`);
  console.log(`   - Cheques: ${deletedCheques.deletedCount}`);
  console.log(`   - PickLists Extracted: ${deletedPickListsExtracted.deletedCount}`);
  console.log(`   - Attendance: ${deletedAttendance.deletedCount}`);
  console.log(`   - Leaves: ${deletedLeaves.deletedCount}`);
  console.log(`   - Expenses: ${deletedExpenses.deletedCount}`);
  console.log(`   - Salary Advances: ${deletedSalaryAdvances.deletedCount}`);
  console.log(`   - Salary Slips: ${deletedSalarySlips.deletedCount}`);
  console.log(`   - Counter Sales: ${deletedCounterSales.deletedCount}`);
  console.log('   ✅ Admin users preserved');
};

// Seed data
const seedData = async () => {
  console.log('\n🌱 Seeding database...\n');

  // 0. Create/Ensure Admin User exists
  console.log('👤 Creating admin user...');
  let adminUser = await Driver.findOne({ role: 'Admin', phone: '9999999999' });
  if (!adminUser) {
    adminUser = await Driver.create({
      name: 'Admin User',
      phone: '9999999999',
      password: 'admin123',
      role: 'Admin',
      active: true
    });
    console.log('✅ Admin user created (Phone: 9999999999, Password: admin123)');
  } else {
    console.log('✅ Admin user already exists (Phone: 9999999999)');
  }

  // 1. Create Products
  console.log('\n📦 Creating products...');
  const products = await Product.insertMany([
    { name: 'Coca-Cola', size: '300ml', pricePerUnit: 20, active: true },
    { name: 'Coca-Cola', size: '500ml', pricePerUnit: 35, active: true },
    { name: 'Coca-Cola', size: '1L', pricePerUnit: 60, active: true },
    { name: 'Sprite', size: '300ml', pricePerUnit: 20, active: true },
    { name: 'Sprite', size: '500ml', pricePerUnit: 35, active: true },
    { name: 'Fanta', size: '300ml', pricePerUnit: 20, active: true },
    { name: 'Fanta', size: '500ml', pricePerUnit: 35, active: true },
    { name: 'Minute Maid', size: '300ml', pricePerUnit: 25, active: true },
    { name: 'Thums Up', size: '500ml', pricePerUnit: 35, active: true },
    { name: 'Limca', size: '500ml', pricePerUnit: 35, active: true }
  ]);
  console.log(`✅ Created ${products.length} products`);

  // 2. Create Stock Entries
  console.log('\n📊 Creating stock entries...');
  const stockEntries = [];
  const stockDates = [
    new Date('2025-10-01'),
    new Date('2025-10-08'),
    new Date('2025-10-15'),
    new Date('2025-10-22')
  ];

  for (let i = 0; i < stockDates.length; i++) {
    const date = stockDates[i];
    for (let j = 0; j < products.length; j++) {
      const product = products[j];
      const quantity = Math.floor(Math.random() * 500) + 200;
      const batchNo = `BATCH-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}-${(j+1).toString().padStart(3,'0')}`;
      const expiryDate = new Date(date);
      expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months expiry
      
      stockEntries.push({
        productId: product._id,
        quantity: quantity,
        batchNo: batchNo,
        dateReceived: date,
        expiryDate: expiryDate,
        purchaseRate: product.pricePerUnit * 0.85, // 85% of selling price
        sellingRate: product.pricePerUnit,
        remainingQuantity: quantity
      });
    }
  }
  await StockIn.insertMany(stockEntries);
  console.log(`✅ Created ${stockEntries.length} stock entries`);

  // 3. Create Drivers
  console.log('\n🚚 Creating drivers...');
  const driverData = [
    {
      name: 'Rajesh Kumar',
      phone: '9876543210',
      password: '123456',
      role: 'Driver',
      salary: 15000,
      active: true
    },
    {
      name: 'Amit Sharma',
      phone: '9876543211',
      password: '123456',
      role: 'Driver',
      salary: 14000,
      active: true
    },
    {
      name: 'Vikram Singh',
      phone: '9876543212',
      password: '123456',
      role: 'Driver',
      salary: 16000,
      active: true
    },
    {
      name: 'Pradeep Verma',
      phone: '9876543213',
      password: '123456',
      role: 'Driver',
      salary: 13500,
      active: true
    },
    {
      name: 'Sunil Yadav',
      phone: '9876543214',
      password: '123456',
      role: 'Driver',
      salary: 14500,
      active: true
    },
    {
      name: 'Ramesh Pal (Inactive)',
      phone: '9876543215',
      password: '123456',
      role: 'Driver',
      salary: 12000,
      active: false
    }
  ];
  
  // Create drivers one by one to trigger password hashing middleware
  const drivers = [];
  for (const data of driverData) {
    const driver = await Driver.create(data);
    drivers.push(driver);
  }
  console.log(`✅ Created ${drivers.length} drivers (1 inactive)`);

  // 4. Create Retailers
  console.log('\n🏪 Creating retailers...');
  const retailers = await Retailer.insertMany([
    {
      name: 'Khan General Store',
      ownerName: 'Mohammad Khan',
      phone: '9123456780',
      address: 'Shop 12, Connaught Place, New Delhi',
      route: 'Route A - Central Delhi',
      gstNumber: 'GST001',
      creditLimit: 50000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Gupta Supermart',
      ownerName: 'Ramesh Gupta',
      phone: '9123456781',
      address: 'Block C, Lajpat Nagar, New Delhi',
      route: 'Route A - Central Delhi',
      gstNumber: 'GST002',
      creditLimit: 75000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Sharma Provisions',
      ownerName: 'Vijay Sharma',
      phone: '9123456782',
      address: 'Market Road, Karol Bagh, New Delhi',
      route: 'Route B - West Delhi',
      gstNumber: 'GST003',
      creditLimit: 40000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Singh Mart',
      ownerName: 'Harpreet Singh',
      phone: '9123456783',
      address: '45, Rajouri Garden, New Delhi',
      route: 'Route B - West Delhi',
      gstNumber: 'GST004',
      creditLimit: 60000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Verma Stores',
      ownerName: 'Sunil Verma',
      phone: '9123456784',
      address: 'Mayur Vihar Phase 1, New Delhi',
      route: 'Route C - East Delhi',
      gstNumber: 'GST005',
      creditLimit: 55000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Jain Supermarket',
      ownerName: 'Ashok Jain',
      phone: '9123456785',
      address: 'Preet Vihar, New Delhi',
      route: 'Route C - East Delhi',
      gstNumber: 'GST006',
      creditLimit: 70000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Bansal Retail',
      ownerName: 'Manoj Bansal',
      phone: '9123456786',
      address: 'Dwarka Sector 10, New Delhi',
      route: 'Route D - South Delhi',
      gstNumber: 'GST007',
      creditLimit: 45000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Agarwal Stores',
      ownerName: 'Rakesh Agarwal',
      phone: '9123456787',
      address: 'Saket, New Delhi',
      route: 'Route D - South Delhi',
      gstNumber: 'GST008',
      creditLimit: 80000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Chopra General Store',
      ownerName: 'Ravi Chopra',
      phone: '9123456788',
      address: 'Rohini Sector 7, New Delhi',
      route: 'Route E - North Delhi',
      gstNumber: 'GST009',
      creditLimit: 35000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Malhotra Mart',
      ownerName: 'Sanjay Malhotra',
      phone: '9123456789',
      address: 'Pitampura, New Delhi',
      route: 'Route E - North Delhi',
      gstNumber: 'GST010',
      creditLimit: 50000,
      outstandingBalance: 0,
      active: false // Inactive retailer
    }
  ]);
  console.log(`✅ Created ${retailers.length} retailers (1 inactive)`);

  // 5. Create Wholesalers
  console.log('\n🏭 Creating wholesalers...');
  const wholesalers = await Wholesaler.insertMany([
    {
      name: 'Metro Cash & Carry',
      ownerName: 'Rajiv Mehta',
      phone: '9111222333',
      address: 'Sector 18, Noida, UP',
      gstNumber: '09AAAAA1234A1Z5',
      creditLimit: 500000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Big Bazaar Wholesale',
      ownerName: 'Kishore Kumar',
      phone: '9111222334',
      address: 'Gurgaon Industrial Area, Haryana',
      gstNumber: '06BBBBB5678B2Z6',
      creditLimit: 750000,
      outstandingBalance: 0,
      active: true
    },
    {
      name: 'Reliance Wholesale',
      ownerName: 'Amit Desai',
      phone: '9111222335',
      address: 'Faridabad Commercial Hub, Haryana',
      gstNumber: '06CCCCC9012C3Z7',
      creditLimit: 1000000,
      outstandingBalance: 0,
      active: true
    }
  ]);
  console.log(`✅ Created ${wholesalers.length} wholesalers`);

  // 6. Create Driver Dispatches with Items (Retail & Wholesale)
  console.log('\n📋 Creating driver dispatches...');
  const dispatches = [];
  const dispatchItems = [];
  
  // Generate dispatches for October and November 2025
  const startDate = new Date('2025-10-01');
  const endDate = new Date('2025-11-30');
  const dispatchDates = [];
  
  // Create dispatch for each working day (Mon-Sat)
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0) { // Skip Sundays
      dispatchDates.push(new Date(d));
    }
  }
  
  console.log(`   Generating ${dispatchDates.length} dispatches for Oct-Nov 2025...`);

  for (let i = 0; i < dispatchDates.length; i++) {
    const driver = drivers[i % (drivers.length - 1)]; // Exclude inactive, rotate drivers
    const date = dispatchDates[i];
    
    // Set dispatch time to 8 AM
    date.setHours(8, 0, 0, 0);
    
    // Create dispatch
    const dispatch = new DriverDispatch({
      driverId: driver._id,
      date: date,
      totalStockValue: 50000 + Math.floor(Math.random() * 30000), // Random stock value
      totalCashValue: 10000 + Math.floor(Math.random() * 5000), // Random initial cash
      status: date < new Date() ? 'Completed' : 'Active' // Past dates are completed
    });
    
    const savedDispatch = await dispatch.save();
    dispatches.push(savedDispatch);
    
    // Create items for this dispatch (mix of retail and wholesale)
    const numRetailItems = Math.floor(Math.random() * 5) + 3; // 3-7 retail items
    const numWholesaleItems = Math.floor(Math.random() * 3) + 1; // 1-3 wholesale items
    
    // Retail items
    for (let j = 0; j < numRetailItems; j++) {
      const product = products[j % products.length];
      const quantity = Math.floor(Math.random() * 50) + 20;
      
      const item = new DriverDispatchItem({
        dispatchId: savedDispatch._id,
        productId: product._id,
        itemType: 'Retail',
        quantity: quantity,
        ratePerUnit: product.pricePerUnit
      });
      
      const savedItem = await item.save();
      dispatchItems.push(savedItem);
    }
    
    // Wholesale items
    for (let k = 0; k < numWholesaleItems; k++) {
      const product = products[(k + 5) % products.length];
      const quantity = Math.floor(Math.random() * 200) + 100;
      
      const item = new DriverDispatchItem({
        dispatchId: savedDispatch._id,
        productId: product._id,
        itemType: 'Wholesale',
        quantity: quantity,
        ratePerUnit: product.pricePerUnit * 0.9 // 10% discount for wholesale
      });
      
      const savedItem = await item.save();
      dispatchItems.push(savedItem);
    }
  }
  console.log(`✅ Created ${dispatches.length} dispatches with ${dispatchItems.length} items`);

  // 7. Create Sales (Retail)
  console.log('\n💰 Creating sales...');
  const sales = [];
  
  console.log(`   Generating sales for ${dispatches.length} dispatches...`);
  
  // Create 2-4 sales per dispatch
  for (const dispatch of dispatches) {
    const numSales = Math.floor(Math.random() * 3) + 2; // 2-4 sales per dispatch
    const driver = drivers.find(d => d._id.equals(dispatch.driverId));
    
    for (let i = 0; i < numSales; i++) {
      const retailer = retailers[Math.floor(Math.random() * (retailers.length - 1))]; // Exclude inactive
      
      const saleDate = new Date(dispatch.date.getTime() + (i + 1) * 2 * 60 * 60 * 1000); // Spread sales throughout day
      
      // Select products sold
      const numProducts = Math.floor(Math.random() * 4) + 2;
      const productsSold = [];
      let totalAmount = 0;
      
      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 20) + 5;
        const ratePerUnit = product.pricePerUnit;
        const amount = quantity * ratePerUnit;
        totalAmount += amount;
        
        productsSold.push({
          productId: product._id,
          quantity,
          ratePerUnit,
          amount
        });
      }
      
      // Payment methods
      const paymentMethod = ['Cash', 'Cheque', 'Mixed'][Math.floor(Math.random() * 3)];
      const payments = {};
      
      if (paymentMethod === 'Cash') {
        payments.cash = totalAmount;
      } else if (paymentMethod === 'Cheque') {
        payments.cheque = [{
          chequeNumber: `CHQ${String(100000 + sales.length).padStart(6, '0')}`,
          amount: totalAmount,
          bankName: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'PNB'][Math.floor(Math.random() * 5)],
          photoUrl: `https://example.com/cheque${sales.length}.jpg`,
          uploadedAt: saleDate
        }];
      } else {
        const cashAmount = Math.floor(totalAmount * 0.4);
        payments.cash = cashAmount;
        payments.cheque = [{
          chequeNumber: `CHQ${String(100000 + sales.length).padStart(6, '0')}`,
          amount: totalAmount - cashAmount,
          bankName: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'PNB'][Math.floor(Math.random() * 5)],
          photoUrl: `https://example.com/cheque${sales.length}.jpg`,
          uploadedAt: saleDate
        }];
      }
      
      const sale = await Sale.create({
        retailerId: retailer._id,
        driverId: driver._id,
        dispatchId: dispatch._id,
        saleDate: saleDate,
        productsSold: productsSold,
        payments: payments,
        totalAmount: totalAmount,
        totalPaid: totalAmount // Assuming full payment
      });
      
      sales.push(sale);
    }
  }
  console.log(`✅ Created ${sales.length} sales`);

  // 8. Create Cheque Management entries from sales
  console.log('\n💳 Creating cheque management entries...');
  const cheques = [];
  
  const bounceReasons = [
    'Insufficient funds',
    'Signature mismatch',
    'Account closed',
    'Payment stopped by drawer',
    'Post-dated cheque'
  ];
  
  const banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'PNB', 'Kotak Mahindra', 'Yes Bank', 'IndusInd Bank'];
  
  for (const sale of sales) {
    if (sale.payments.cheque && sale.payments.cheque.length > 0) {
      for (let idx = 0; idx < sale.payments.cheque.length; idx++) {
        const cheque = sale.payments.cheque[idx];
        
        // Distribute statuses evenly: ~25% each for Pending, Deposited, Cleared, Bounced
        const statusIndex = cheques.length % 4;
        const statusOptions = ['Pending', 'Deposited', 'Cleared', 'Bounced'];
        const status = statusOptions[statusIndex];
        
        const bankName = cheque.bankName || banks[cheques.length % banks.length];
        
        const chequeEntry = {
          chequeNumber: cheque.chequeNumber,
          amount: cheque.amount,
          depositDate: new Date(sale.saleDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000),
          bankName: bankName,
          branchName: `${bankName} - ${['Main', 'South Delhi', 'Noida', 'Gurgaon', 'East Delhi'][cheques.length % 5]} Branch`,
          saleId: sale._id,
          retailerId: sale.retailerId,
          driverId: sale.driverId,
          status: status,
          chequePhotoUrl: cheque.photoUrl,
          statusHistory: [{
            status: 'Pending',
            changedAt: sale.saleDate,
            remarks: 'Cheque received from retailer'
          }]
        };
        
        if (status === 'Deposited' || status === 'Cleared' || status === 'Bounced') {
          chequeEntry.depositedAt = new Date(chequeEntry.depositDate.getTime() + 1 * 24 * 60 * 60 * 1000);
          chequeEntry.statusHistory.push({
            status: 'Deposited',
            changedAt: chequeEntry.depositedAt,
            remarks: 'Deposited to bank account'
          });
        }
        
        if (status === 'Cleared') {
          chequeEntry.clearedAt = new Date(chequeEntry.depositedAt.getTime() + 3 * 24 * 60 * 60 * 1000);
          chequeEntry.statusHistory.push({
            status: 'Cleared',
            changedAt: chequeEntry.clearedAt,
            remarks: 'Payment successfully cleared'
          });
        }
        
        if (status === 'Bounced') {
          chequeEntry.bouncedAt = new Date(chequeEntry.depositedAt.getTime() + 2 * 24 * 60 * 60 * 1000);
          chequeEntry.bounceReason = bounceReasons[cheques.length % bounceReasons.length];
          chequeEntry.statusHistory.push({
            status: 'Bounced',
            changedAt: chequeEntry.bouncedAt,
            remarks: chequeEntry.bounceReason
          });
        }
        
        const savedCheque = await ChequeManagement.create(chequeEntry);
        cheques.push(savedCheque);
      }
    }
  }
  console.log(`✅ Created ${cheques.length} cheque entries`);

  // 9. Create Cash Collections
  console.log('\n💵 Creating cash collections...');
  const cashCollections = [];
  
  const completedDispatches = dispatches.filter(d => d.status === 'Completed');
  console.log(`   Generating cash collections for ${completedDispatches.length} completed dispatches...`);
  
  for (const dispatch of completedDispatches) {
    const driver = drivers.find(d => d._id.equals(dispatch.driverId));
    
    // Calculate total cash from sales
    const dispatchSales = sales.filter(s => s.dispatchId.equals(dispatch._id));
    const totalCash = dispatchSales.reduce((sum, sale) => sum + (sale.payments.cash || 0), 0);
    
    if (totalCash > 0) {
      const collectionDate = new Date(dispatch.date.getTime() + 8 * 60 * 60 * 1000); // 8 hours after dispatch
      
      // Create denomination breakdown
      const denominations = [
        { noteValue: 2000, noteCount: Math.floor(totalCash / 2000), totalValue: Math.floor(totalCash / 2000) * 2000 },
        { noteValue: 500, noteCount: Math.floor((totalCash % 2000) / 500), totalValue: Math.floor((totalCash % 2000) / 500) * 500 },
        { noteValue: 100, noteCount: Math.floor((totalCash % 500) / 100), totalValue: Math.floor((totalCash % 500) / 100) * 100 },
        { noteValue: 50, noteCount: Math.floor((totalCash % 100) / 50), totalValue: Math.floor((totalCash % 100) / 50) * 50 },
        { noteValue: 20, noteCount: Math.floor((totalCash % 50) / 20), totalValue: Math.floor((totalCash % 50) / 20) * 20 },
        { noteValue: 10, noteCount: Math.floor((totalCash % 20) / 10), totalValue: Math.floor((totalCash % 20) / 10) * 10 }
      ].filter(d => d.noteCount > 0); // Only include notes that were actually collected
      
      const collection = await CashCollection.create({
        driverId: driver._id,
        dispatchId: dispatch._id,
        collectionDate: collectionDate,
        denominations: denominations,
        totalCashCollected: totalCash,
        expectedCash: totalCash,
        variance: 0,
        status: 'Verified'
      });
      
      cashCollections.push(collection);
    }
  }
  console.log(`✅ Created ${cashCollections.length} cash collections`);

  // 10. Create PickList Extracted entries
  console.log('\n📄 Creating picklist extracted entries...');
  const pickLists = [];
  
  // Generate picklists for October and November 2025
  const plStartDate = new Date('2025-10-01');
  const plEndDate = new Date('2025-11-30');
  
  for (let i = 0; i < 10; i++) {
    // Random extraction date within Oct-Nov range
    const randomDays = Math.floor(Math.random() * 61); // 0-60 days
    const date = new Date(plStartDate);
    date.setDate(date.getDate() + randomDays);
    
    const items = [];
    
    for (let j = 0; j < 6; j++) {
      const product = products[j % products.length];
      items.push({
        itemCode: `ITEM-${String(j + 1).padStart(4, '0')}`,
        itemName: `${product.name} ${product.size}`,
        category1: 'Beverages',
        category2: 'Soft Drinks',
        mrp: product.pricePerUnit,
        loQty: Math.floor(Math.random() * 50) + 20,
        sellQty: Math.floor(Math.random() * 30) + 10,
        totalLoadInQty: Math.floor(Math.random() * 100) + 50
      });
    }
    
    const pickList = await PickListExtracted.create({
      pickListNumber: `PL-2025-${String(1000 + i).padStart(5, '0')}`,
      loadoutNumber: `LO-2025-${String(2000 + i).padStart(5, '0')}`,
      vehicleNumber: `DL${String(10 + i).padStart(2, '0')}CA${String(1000 + i)}`,
      createdDate: date,
      loadOutDate: new Date(date.getTime() + 2 * 60 * 60 * 1000), // 2 hours after creation
      loadoutType: 'Regular',
      route: `Route ${String.fromCharCode(65 + (i % 5))}`,
      salesMan: `Salesman ${i + 1}`,
      items: items,
      totalItems: items.length,
      totalLoQty: items.reduce((sum, item) => sum + item.loQty, 0),
      totalSellQty: items.reduce((sum, item) => sum + item.sellQty, 0),
      totalLoadInQty: items.reduce((sum, item) => sum + item.totalLoadInQty, 0),
      pdfFileName: `picklist_${date.toISOString().split('T')[0]}_${i}.pdf`
    });
    
    pickLists.push(pickList);
  }
  console.log(`✅ Created ${pickLists.length} picklist entries (Oct-Nov 2025)`);

  // 11. Create Attendance Records
  console.log('\n📅 Creating attendance records...');
  const attendanceRecords = [];
  const attendanceDates = [];
  
  // Generate attendance for October and November 2025
  const attStartDate = new Date('2025-10-01');
  const attEndDate = new Date('2025-11-30');
  
  for (let d = new Date(attStartDate); d <= attEndDate; d.setDate(d.getDate() + 1)) {
    attendanceDates.push(new Date(d));
  }
  
  console.log(`   Generating attendance for ${attendanceDates.length} days (Oct-Nov 2025)...`);
  
  for (const date of attendanceDates) {
    for (const driver of drivers.filter(d => d.active)) {
      // 90% attendance rate
      if (Math.random() > 0.1) {
        const checkInTime = new Date(date);
        checkInTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
        
        const checkOutTime = new Date(date);
        checkOutTime.setHours(18 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0);
        
        const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        
        const attendance = await Attendance.create({
          employeeId: driver._id,
          date: date,
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          status: workingHours >= 8 ? 'Present' : 'Half-Day',
          workingHours: workingHours,
          remarks: workingHours >= 8 ? 'Full day' : 'Half day'
        });
        
        attendanceRecords.push(attendance);
      } else {
        // Absent
        const attendance = await Attendance.create({
          employeeId: driver._id,
          date: date,
          status: 'Absent',
          workingHours: 0,
          remarks: 'Absent'
        });
        
        attendanceRecords.push(attendance);
      }
    }
  }
  console.log(`✅ Created ${attendanceRecords.length} attendance records (61 days)`);

  // 12. Create Leave Applications
  console.log('\n🏖️ Creating leave applications...');
  const leaves = [];
  const leaveTypes = ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave'];
  const leaveStatuses = ['Pending', 'Approved', 'Rejected'];
  
  // Generate leave applications for October and November 2025
  const leaveStartDate = new Date('2025-10-01');
  const leaveEndDate = new Date('2025-11-30');
  
  for (let i = 0; i < 25; i++) {
    const driver = drivers[i % (drivers.length - 1)]; // Exclude inactive
    const leaveType = leaveTypes[i % leaveTypes.length];
    const status = leaveStatuses[i % leaveStatuses.length];
    
    // Random start date within Oct-Nov range
    const randomDays = Math.floor(Math.random() * 61); // 0-60 days
    const fromDate = new Date(leaveStartDate);
    fromDate.setDate(fromDate.getDate() + randomDays);
    
    const toDate = new Date(fromDate);
    const daysCount = Math.floor(Math.random() * 3) + 1;
    toDate.setDate(toDate.getDate() + daysCount - 1);
    
    const leave = await Leave.create({
      employeeId: driver._id,
      leaveType: leaveType,
      fromDate: fromDate,
      toDate: toDate,
      numberOfDays: daysCount,
      reason: `${leaveType} - ${['Family emergency', 'Medical appointment', 'Personal work', 'Feeling unwell'][i % 4]}`,
      status: status,
      appliedAt: new Date(fromDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      approvedBy: status !== 'Pending' ? adminUser._id : undefined,
      approvedAt: status !== 'Pending' ? new Date(fromDate.getTime() - 1 * 24 * 60 * 60 * 1000) : undefined
    });
    
    leaves.push(leave);
  }
  console.log(`✅ Created ${leaves.length} leave applications (Oct-Nov 2025)`);

  // 13. Create Expense Entries
  console.log('\n💸 Creating expense entries...');
  const expenses = [];
  const expenseCategories = ['COIN', 'TEA', 'Loder Lunch', 'Extra Loder', 'Office Supplies', 'Transport', 'Maintenance'];
  
  // Generate expenses for October and November 2025
  const expStartDate = new Date('2025-10-01');
  const expEndDate = new Date('2025-11-30');
  
  for (let i = 0; i < 80; i++) {
    const driver = drivers[i % (drivers.length - 1)]; // Exclude inactive
    const category = expenseCategories[i % expenseCategories.length];
    
    // Random expense date within Oct-Nov range
    const randomDays = Math.floor(Math.random() * 61); // 0-60 days
    const expenseDate = new Date(expStartDate);
    expenseDate.setDate(expenseDate.getDate() + randomDays);
    
    const amount = category === 'Transport' || category === 'Maintenance'
      ? Math.floor(Math.random() * 2000) + 1000 
      : Math.floor(Math.random() * 500) + 100;
    
    const expense = await Expense.create({
      date: expenseDate,
      category: category,
      description: `${category} - ${['Regular expense', 'Emergency', 'Scheduled', 'Route expense'][i % 4]}`,
      amount: amount,
      paymentMode: ['Cash', 'Bank Transfer', 'UPI'][i % 3],
      paidTo: `Vendor ${i + 1}`,
      createdBy: driver._id,
      approvedBy: i % 3 !== 0 ? adminUser._id : undefined
    });
    
    expenses.push(expense);
  }
  console.log(`✅ Created ${expenses.length} expense entries (Oct-Nov 2025)`);

  // 14. Create Salary Advances
  console.log('\n💰 Creating salary advances...');
  const salaryAdvances = [];
  
  // Generate salary advances for October and November 2025
  const advStartDate = new Date('2025-10-01');
  const advEndDate = new Date('2025-11-30');
  
  for (let i = 0; i < 20; i++) {
    const driver = drivers[i % (drivers.length - 1)]; // Exclude inactive
    
    // Random advance date within Oct-Nov range
    const randomDays = Math.floor(Math.random() * 61); // 0-60 days
    const requestDate = new Date(advStartDate);
    requestDate.setDate(requestDate.getDate() + randomDays);
    
    const amount = Math.floor(Math.random() * 5000) + 2000;
    
    // Past advances are likely Approved/Recovering, future are Pending
    const isPast = requestDate < new Date();
    const status = isPast 
      ? (Math.random() > 0.3 ? 'Recovering' : 'Approved')
      : 'Pending';
    
    const advance = await SalaryAdvance.create({
      employeeId: driver._id,
      amount: amount,
      advanceDate: requestDate,
      reason: ['Emergency', 'Medical expenses', 'Family function', 'Personal need'][i % 4],
      paymentMethod: 'Cash',
      status: status,
      createdBy: driver._id,
      approvedBy: status !== 'Pending' ? adminUser._id : undefined,
      approvedAt: status !== 'Pending' ? new Date(requestDate.getTime() + 1 * 24 * 60 * 60 * 1000) : undefined
    });
    
    salaryAdvances.push(advance);
  }
  console.log(`✅ Created ${salaryAdvances.length} salary advances (Oct-Nov 2025)`);

  // 15. Create Salary Slips
  console.log('\n📄 Creating salary slips...');
  const salarySlips = [];
  
  // Generate salary slips for October and November 2025
  const salaryMonths = [
    { month: 10, year: 2025 }, // October
    { month: 11, year: 2025 }  // November
  ];
  
  for (const { month, year } of salaryMonths) {
    for (const driver of drivers.filter(d => d.active)) {
      const baseSalary = driver.salary || 15000;
      const hra = baseSalary * 0.3;
      const da = baseSalary * 0.15;
      const bonus = Math.floor(Math.random() * 2000) + 500;
      const grossSalary = baseSalary + hra + da + bonus;
      
      const pf = baseSalary * 0.12;
      const esi = baseSalary * 0.0075;
      
      // Simple advance deduction (random 0-2000)
      const totalAdvance = Math.floor(Math.random() * 2000);
      const totalDeductions = pf + esi + totalAdvance;
      const netSalary = grossSalary - totalDeductions;
      
      // Count working days
      const totalDays = 26; // Standard working days
      const presentDays = attendanceRecords.filter(att => 
        att.employeeId.equals(driver._id) && 
        att.status === 'Present' &&
        att.date.getMonth() === (month - 1) && // JavaScript months are 0-indexed
        att.date.getFullYear() === year
      ).length;
      
      // October is in the past (status: Paid), November is current (status: Draft)
      const isPaid = month === 10;
      
      const slip = await SalarySlip.create({
        employeeId: driver._id,
        month: month,
        year: year,
        basicSalary: baseSalary,
        attendance: {
          totalDays: totalDays,
          presentDays: presentDays,
          absentDays: totalDays - presentDays,
          halfDays: 0,
          leaveDays: 0,
          paidLeaveDays: 0,
          workingDays: presentDays
        },
        earnings: {
          basicAmount: baseSalary,
          commission: 0,
          bonus: bonus,
          allowances: hra + da,
          overtime: 0
        },
        deductions: {
          absentDeduction: 0,
          unpaidLeaveDeduction: 0,
          advanceDeduction: totalAdvance,
          loanDeduction: 0,
          lateFine: 0,
          other: pf + esi
        },
        grossSalary: grossSalary,
        totalDeductions: totalDeductions,
        netSalary: netSalary,
        paymentStatus: isPaid ? 'Paid' : 'Pending',
        status: isPaid ? 'Paid' : 'Draft',
        paymentDate: isPaid ? new Date(year, month - 1, 30) : undefined
      });
      
      salarySlips.push(slip);
    }
  }
  console.log(`✅ Created ${salarySlips.length} salary slips (Oct-Nov 2025)`);

  // 16. Create Counter Sales
  console.log('\n🏪 Creating counter sales...');
  const counterSales = [];
  
  // Generate counter sales for October and November 2025
  const csStartDate = new Date('2025-10-01');
  const csEndDate = new Date('2025-11-30');
  
  for (let i = 0; i < 60; i++) {
    // Random sale date within Oct-Nov range
    const randomDays = Math.floor(Math.random() * 61); // 0-60 days
    const saleDate = new Date(csStartDate);
    saleDate.setDate(saleDate.getDate() + randomDays);
    
    const customerName = ['Walk-in Customer', 'Ramesh Kumar', 'Priya Sharma', 'Vijay Singh', 'Anjali Verma'][i % 5];
    const customerPhone = i % 5 === 0 ? undefined : `98765432${10 + (i % 90)}`;
    
    // Select products
    const numProducts = Math.floor(Math.random() * 5) + 2;
    const items = [];
    let total = 0;
    
    for (let j = 0; j < numProducts; j++) {
      const product = products[j % products.length];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const price = product.pricePerUnit;
      const subtotal = quantity * price;
      total += subtotal;
      
      items.push({
        productId: product._id,
        quantity: quantity,
        ratePerUnit: price,
        totalAmount: subtotal
      });
    }
    
    const paymentMethod = ['Cash', 'Card', 'UPI'][i % 3];
    
    const counterSale = await CounterSale.create({
      saleNumber: `CS-${String(10000 + i).padStart(5, '0')}`,
      saleDate: saleDate,
      items: items,
      totalAmount: total,
      discount: 0,
      finalAmount: total,
      paymentMethod: paymentMethod,
      totalCashReceived: total,
      changeGiven: 0,
      customerName: customerName,
      customerPhone: customerPhone,
      recordedBy: adminUser._id
    });
    
    counterSales.push(counterSale);
  }
  console.log(`✅ Created ${counterSales.length} counter sales (Oct-Nov 2025)`);

  // Summary
  console.log('\n\n📊 DATABASE SEEDING SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Products: ${products.length}`);
  console.log(`✅ Stock Entries: ${stockEntries.length}`);
  console.log(`✅ Drivers: ${drivers.length} (1 inactive)`);
  console.log(`✅ Retailers: ${retailers.length} (1 inactive)`);
  console.log(`✅ Wholesalers: ${wholesalers.length}`);
  console.log(`✅ Dispatches: ${dispatches.length}`);
  console.log(`✅ Dispatch Items: ${dispatchItems.length} (Retail + Wholesale)`);
  console.log(`✅ Sales: ${sales.length}`);
  console.log(`✅ Cheques: ${cheques.length} (Pending/Deposited/Cleared/Bounced)`);
  console.log(`✅ Cash Collections: ${cashCollections.length}`);
  console.log(`✅ PickLists: ${pickLists.length}`);
  console.log(`✅ Attendance: ${attendanceRecords.length} (30 days)`);
  console.log(`✅ Leaves: ${leaves.length}`);
  console.log(`✅ Expenses: ${expenses.length}`);
  console.log(`✅ Salary Advances: ${salaryAdvances.length}`);
  console.log(`✅ Salary Slips: ${salarySlips.length} (3 months)`);
  console.log(`✅ Counter Sales: ${counterSales.length}`);
  console.log('═══════════════════════════════════════');
  console.log('\n✨ Database seeded successfully!\n');
  console.log('🔐 LOGIN CREDENTIALS:');
  console.log('   Admin: Phone: 9999999999 | Password: admin123');
  console.log('   Driver: Phone: 9876543210 | Password: 123456');
  console.log('═══════════════════════════════════════\n');
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await cleanDatabase();
    await seedData();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

main();
