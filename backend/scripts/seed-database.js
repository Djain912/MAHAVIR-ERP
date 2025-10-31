import mongoose from 'mongoose';/**

import dotenv from 'dotenv'; * Database Seeding Script

import bcrypt from 'bcryptjs'; * Cleans and populates database with comprehensive test data

 * Preserves User/Admin credentials

// Import models */

import User from '../src/models/User.js';

import Driver from '../src/models/Driver.js';import mongoose from 'mongoose';

import Retailer from '../src/models/Retailer.js';import dotenv from 'dotenv';

import Wholesaler from '../src/models/Wholesaler.js';import { fileURLToPath } from 'url';

import Product from '../src/models/Product.js';import { dirname, join } from 'path';

import StockIn from '../src/models/StockIn.js';import Driver from '../src/models/Driver.js';

import DriverDispatch from '../src/models/DriverDispatch.js';import Retailer from '../src/models/Retailer.js';

import CashCollection from '../src/models/CashCollection.js';import Wholesaler from '../src/models/Wholesaler.js';

import Sale from '../src/models/Sale.js';import Product from '../src/models/Product.js';

import CounterSale from '../src/models/CounterSale.js';import StockIn from '../src/models/StockIn.js';

import Cheque from '../src/models/Cheque.js';import DriverDispatch from '../src/models/DriverDispatch.js';

import Attendance from '../src/models/Attendance.js';import DriverDispatchItem from '../src/models/DriverDispatchItem.js';

import Expense from '../src/models/Expense.js';import Sale from '../src/models/Sale.js';

import CashCollection from '../src/models/CashCollection.js';

dotenv.config();import ChequeManagement from '../src/models/ChequeManagement.js';

import PickListExtracted from '../src/models/PickListExtracted.js';

const clearAndSeedDatabase = async () => {import Attendance from '../src/models/Attendance.js';

  try {import Leave from '../src/models/Leave.js';

    console.log('🔌 Connecting to MongoDB...\n');import Expense from '../src/models/Expense.js';

    await mongoose.connect(process.env.MONGODB_URI);import SalaryAdvance from '../src/models/SalaryAdvance.js';

    console.log('✅ Connected to MongoDB\n');import SalarySlip from '../src/models/SalarySlip.js';

import CounterSale from '../src/models/CounterSale.js';

    // Save admin data

    console.log('💾 Saving admin user data...');const __filename = fileURLToPath(import.meta.url);

    const adminUser = await User.findOne({ phone: '9999999999' });const __dirname = dirname(__filename);

    const adminData = adminUser ? {

      name: adminUser.name,// Load environment variables from parent directory

      phone: adminUser.phone,dotenv.config({ path: join(__dirname, '..', '.env') });

      password: adminUser.password,

      role: adminUser.role// Connect to MongoDB

    } : null;const connectDB = async () => {

      try {

    if (adminData) {    await mongoose.connect(process.env.MONGODB_URI);

      console.log(`✅ Admin user saved: ${adminData.name} (${adminData.phone})\n`);    console.log('✅ MongoDB Connected');

    }  } catch (error) {

    console.error('❌ MongoDB connection error:', error);

    // Clear all collections    process.exit(1);

    console.log('🗑️  Clearing database...');  }

    await User.deleteMany({});};

    await Driver.deleteMany({});

    await Retailer.deleteMany({});// Clean all collections (except Admin users)

    await Wholesaler.deleteMany({});const cleanDatabase = async () => {

    await Product.deleteMany({});  console.log('\n🧹 Cleaning database...');

    await StockIn.deleteMany({});  

    await DriverDispatch.deleteMany({});  // Delete all drivers except Admin role

    await CashCollection.deleteMany({});  const deletedDrivers = await Driver.deleteMany({ role: { $ne: 'Admin' } });

    await Sale.deleteMany({});  const deletedRetailers = await Retailer.deleteMany({});

    await CounterSale.deleteMany({});  const deletedWholesalers = await Wholesaler.deleteMany({});

    await Cheque.deleteMany({});  const deletedProducts = await Product.deleteMany({});

    await Attendance.deleteMany({});  const deletedStock = await StockIn.deleteMany({});

    await Expense.deleteMany({});  const deletedDispatches = await DriverDispatch.deleteMany({});

    console.log('✅ All collections cleared\n');  const deletedDispatchItems = await DriverDispatchItem.deleteMany({});

  const deletedSales = await Sale.deleteMany({});

    // Restore admin  const deletedCashCollections = await CashCollection.deleteMany({});

    console.log('👤 Restoring admin user...');  const deletedCheques = await ChequeManagement.deleteMany({});

    const restoredAdmin = new User({  const deletedPickListsExtracted = await PickListExtracted.deleteMany({});

      name: adminData?.name || 'Admin User',  const deletedAttendance = await Attendance.deleteMany({});

      phone: adminData?.phone || '9999999999',  const deletedLeaves = await Leave.deleteMany({});

      password: adminData?.password || await bcrypt.hash('admin123', 10),  const deletedExpenses = await Expense.deleteMany({});

      role: 'Admin'  const deletedSalaryAdvances = await SalaryAdvance.deleteMany({});

    });  const deletedSalarySlips = await SalarySlip.deleteMany({});

    await restoredAdmin.save();  const deletedCounterSales = await CounterSale.deleteMany({});

    console.log(`✅ Admin restored: ${restoredAdmin.name} (${restoredAdmin.phone})\n`);  

  console.log('✅ Database cleaned:');

    // Create Products  console.log(`   - Drivers (non-admin): ${deletedDrivers.deletedCount}`);

    console.log('📦 Creating products...');  console.log(`   - Retailers: ${deletedRetailers.deletedCount}`);

    const products = [  console.log(`   - Wholesalers: ${deletedWholesalers.deletedCount}`);

      { name: 'Coca-Cola 200ml', category: 'Soft Drink', price: 10, wholesalePrice: 8, unit: 'bottle' },  console.log(`   - Products: ${deletedProducts.deletedCount}`);

      { name: 'Coca-Cola 300ml', category: 'Soft Drink', price: 15, wholesalePrice: 12, unit: 'bottle' },  console.log(`   - Stock: ${deletedStock.deletedCount}`);

      { name: 'Coca-Cola 500ml', category: 'Soft Drink', price: 20, wholesalePrice: 16, unit: 'bottle' },  console.log(`   - Dispatches: ${deletedDispatches.deletedCount}`);

      { name: 'Coca-Cola 750ml', category: 'Soft Drink', price: 35, wholesalePrice: 28, unit: 'bottle' },  console.log(`   - Dispatch Items: ${deletedDispatchItems.deletedCount}`);

      { name: 'Coca-Cola 1L', category: 'Soft Drink', price: 40, wholesalePrice: 32, unit: 'bottle' },  console.log(`   - Sales: ${deletedSales.deletedCount}`);

      { name: 'Coca-Cola 2L', category: 'Soft Drink', price: 80, wholesalePrice: 65, unit: 'bottle' },  console.log(`   - Cash Collections: ${deletedCashCollections.deletedCount}`);

      { name: 'Sprite 200ml', category: 'Soft Drink', price: 10, wholesalePrice: 8, unit: 'bottle' },  console.log(`   - Cheques: ${deletedCheques.deletedCount}`);

      { name: 'Sprite 500ml', category: 'Soft Drink', price: 20, wholesalePrice: 16, unit: 'bottle' },  console.log(`   - PickLists Extracted: ${deletedPickListsExtracted.deletedCount}`);

      { name: 'Sprite 1L', category: 'Soft Drink', price: 40, wholesalePrice: 32, unit: 'bottle' },  console.log(`   - Attendance: ${deletedAttendance.deletedCount}`);

      { name: 'Thums Up 200ml', category: 'Soft Drink', price: 10, wholesalePrice: 8, unit: 'bottle' },  console.log(`   - Leaves: ${deletedLeaves.deletedCount}`);

      { name: 'Thums Up 500ml', category: 'Soft Drink', price: 20, wholesalePrice: 16, unit: 'bottle' },  console.log(`   - Expenses: ${deletedExpenses.deletedCount}`);

      { name: 'Fanta 200ml', category: 'Soft Drink', price: 10, wholesalePrice: 8, unit: 'bottle' },  console.log(`   - Salary Advances: ${deletedSalaryAdvances.deletedCount}`);

      { name: 'Fanta 500ml', category: 'Soft Drink', price: 20, wholesalePrice: 16, unit: 'bottle' },  console.log(`   - Salary Slips: ${deletedSalarySlips.deletedCount}`);

      { name: 'Maaza 200ml', category: 'Juice', price: 15, wholesalePrice: 12, unit: 'bottle' },  console.log(`   - Counter Sales: ${deletedCounterSales.deletedCount}`);

      { name: 'Maaza 600ml', category: 'Juice', price: 30, wholesalePrice: 24, unit: 'bottle' },  console.log('   ✅ Admin users preserved');

      { name: 'Limca 200ml', category: 'Soft Drink', price: 10, wholesalePrice: 8, unit: 'bottle' },};

      { name: 'Limca 500ml', category: 'Soft Drink', price: 20, wholesalePrice: 16, unit: 'bottle' },

    ];// Seed data

    const createdProducts = await Product.insertMany(products);const seedData = async () => {

    console.log(`✅ Created ${createdProducts.length} products\n`);  console.log('\n🌱 Seeding database...\n');



    // Create Drivers  // 0. Create/Ensure Admin User exists

    console.log('🚗 Creating drivers...');  console.log('👤 Creating admin user...');

    const driverData = [  let adminUser = await Driver.findOne({ role: 'Admin', phone: '9999999999' });

      { name: 'Rajesh Kumar', phone: '9876543210', salary: 15000 },  if (!adminUser) {

      { name: 'Amit Singh', phone: '9876543211', salary: 14000 },    adminUser = await Driver.create({

      { name: 'Vijay Sharma', phone: '9876543212', salary: 15500 },      name: 'Admin User',

      { name: 'Manoj Yadav', phone: '9876543213', salary: 14500 },      phone: '9999999999',

      { name: 'Suresh Verma', phone: '9876543214', salary: 15000 },      password: 'admin123',

    ];      role: 'Admin',

      active: true

    const drivers = [];    });

    const defaultPassword = await bcrypt.hash('123456', 10);    console.log('✅ Admin user created (Phone: 9999999999, Password: admin123)');

  } else {

    for (const dData of driverData) {    console.log('✅ Admin user already exists (Phone: 9999999999)');

      const user = new User({  }

        name: dData.name,

        phone: dData.phone,  // 1. Create Products

        password: defaultPassword,  console.log('\n📦 Creating products...');

        role: 'Driver'  const products = await Product.insertMany([

      });    { name: 'Coca-Cola', size: '300ml', pricePerUnit: 20, active: true },

      await user.save();    { name: 'Coca-Cola', size: '500ml', pricePerUnit: 35, active: true },

    { name: 'Coca-Cola', size: '1L', pricePerUnit: 60, active: true },

      const driver = new Driver({    { name: 'Sprite', size: '300ml', pricePerUnit: 20, active: true },

        name: dData.name,    { name: 'Sprite', size: '500ml', pricePerUnit: 35, active: true },

        phone: dData.phone,    { name: 'Fanta', size: '300ml', pricePerUnit: 20, active: true },

        userId: user._id,    { name: 'Fanta', size: '500ml', pricePerUnit: 35, active: true },

        monthlySalary: dData.salary,    { name: 'Minute Maid', size: '300ml', pricePerUnit: 25, active: true },

        active: true    { name: 'Thums Up', size: '500ml', pricePerUnit: 35, active: true },

      });    { name: 'Limca', size: '500ml', pricePerUnit: 35, active: true }

      await driver.save();  ]);

      drivers.push(driver);  console.log(`✅ Created ${products.length} products`);

    }

    console.log(`✅ Created ${drivers.length} drivers\n`);  // 2. Create Stock Entries

  console.log('\n📊 Creating stock entries...');

    // Create Retailers  const stockEntries = [];

    console.log('🏪 Creating retailers...');  const stockDates = [

    const retailerData = [    new Date('2025-10-01'),

      { name: 'ABC Store', ownerName: 'Ramesh Kumar', phone: '9123456780', address: 'Shop 12, Main Market, Delhi', gst: 'GST001' },    new Date('2025-10-08'),

      { name: 'XYZ Mart', ownerName: 'Suresh Patel', phone: '9123456781', address: 'Plot 45, Sector 15, Noida', gst: 'GST002' },    new Date('2025-10-15'),

      { name: 'City Bazaar', ownerName: 'Vijay Sharma', phone: '9123456782', address: '23, Mall Road, Gurgaon', gst: 'GST003' },    new Date('2025-10-22')

      { name: 'Quick Shop', ownerName: 'Anil Verma', phone: '9123456783', address: '78, Commercial Street, Delhi', gst: 'GST004' },  ];

      { name: 'Super Market', ownerName: 'Manoj Singh', phone: '9123456784', address: '56, Central Avenue, Faridabad', gst: 'GST005' },

    ];  for (let i = 0; i < stockDates.length; i++) {

    const retailers = await Retailer.insertMany(retailerData.map(r => ({    const date = stockDates[i];

      ...r,    for (let j = 0; j < products.length; j++) {

      creditLimit: Math.floor(Math.random() * 50000) + 20000,      const product = products[j];

      currentBalance: 0,      const quantity = Math.floor(Math.random() * 500) + 200;

      active: true      const batchNo = `BATCH-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}-${(j+1).toString().padStart(3,'0')}`;

    })));      const expiryDate = new Date(date);

    console.log(`✅ Created ${retailers.length} retailers\n`);      expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months expiry

      

    // Create Wholesalers      stockEntries.push({

    console.log('🏭 Creating wholesalers...');        productId: product._id,

    const wholesalerData = [        quantity: quantity,

      { name: 'Delhi Beverages', ownerName: 'Ramesh Enterprises', phone: '9876500001', address: 'Warehouse 45, Industrial Area, Delhi', gst: 'GSTW001' },        batchNo: batchNo,

      { name: 'NCR Distributors', ownerName: 'Singh Trading Co.', phone: '9876500002', address: 'Plot 78, Sector 25, Noida', gst: 'GSTW002' },        dateReceived: date,

      { name: 'Capital Drinks', ownerName: 'Gupta Brothers', phone: '9876500003', address: '234, Main Road, Gurgaon', gst: 'GSTW003' },        expiryDate: expiryDate,

    ];        purchaseRate: product.pricePerUnit * 0.85, // 85% of selling price

    const wholesalers = await Wholesaler.insertMany(wholesalerData.map(w => ({        sellingRate: product.pricePerUnit,

      ...w,        remainingQuantity: quantity

      creditLimit: Math.floor(Math.random() * 200000) + 100000,      });

      currentBalance: 0,    }

      active: true  }

    })));  await StockIn.insertMany(stockEntries);

    console.log(`✅ Created ${wholesalers.length} wholesalers\n`);  console.log(`✅ Created ${stockEntries.length} stock entries`);



    // Create Stock  // 3. Create Drivers

    console.log('📊 Creating stock entries...');  console.log('\n🚚 Creating drivers...');

    const stockEntries = [];  const driverData = [

    for (const product of createdProducts) {    {

      const quantity = Math.floor(Math.random() * 500) + 200;      name: 'Rajesh Kumar',

      stockEntries.push({      phone: '9876543210',

        productId: product._id,      password: '123456',

        quantity,      role: 'Driver',

        pricePerUnit: product.wholesalePrice,      salary: 15000,

        totalCost: quantity * product.wholesalePrice,      active: true

        supplier: wholesalers[0].name,    },

        receivedDate: new Date(),    {

        batchNumber: `BATCH-${Math.floor(Math.random() * 9000) + 1000}`,      name: 'Amit Sharma',

        status: 'Received'      phone: '9876543211',

      });      password: '123456',

    }      role: 'Driver',

    await StockIn.insertMany(stockEntries);      salary: 14000,

    console.log(`✅ Created ${stockEntries.length} stock entries\n`);      active: true

    },

    // Create Dispatches (last 10 days)    {

    console.log('🚚 Creating dispatches...');      name: 'Vikram Singh',

    const dispatches = [];      phone: '9876543212',

    const today = new Date();      password: '123456',

          role: 'Driver',

    for (let day = 0; day < 10; day++) {      salary: 16000,

      const dispatchDate = new Date(today);      active: true

      dispatchDate.setDate(today.getDate() - day);    },

          {

      for (let i = 0; i < 2; i++) {      name: 'Pradeep Verma',

        const driver = drivers[Math.floor(Math.random() * drivers.length)];      phone: '9876543213',

        const productCount = Math.floor(Math.random() * 5) + 3;      password: '123456',

              role: 'Driver',

        const products = [];      salary: 13500,

        let totalValue = 0;      active: true

            },

        for (let j = 0; j < productCount; j++) {    {

          const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];      name: 'Sunil Yadav',

          const quantity = Math.floor(Math.random() * 30) + 10;      phone: '9876543214',

          const value = quantity * product.price;      password: '123456',

                role: 'Driver',

          products.push({      salary: 14500,

            productId: product._id,      active: true

            quantity,    },

            pricePerUnit: product.price,    {

            totalValue: value      name: 'Ramesh Pal (Inactive)',

          });      phone: '9876543215',

                password: '123456',

          totalValue += value;      role: 'Driver',

        }      salary: 12000,

              active: false

        dispatches.push({    }

          driverId: driver._id,  ];

          dispatchDate,  

          products,  // Create drivers one by one to trigger password hashing middleware

          totalStockValue: totalValue,  const drivers = [];

          status: day === 0 ? 'Active' : 'Completed'  for (const data of driverData) {

        });    const driver = await Driver.create(data);

      }    drivers.push(driver);

    }  }

    const createdDispatches = await DriverDispatch.insertMany(dispatches);  console.log(`✅ Created ${drivers.length} drivers (1 inactive)`);

    console.log(`✅ Created ${createdDispatches.length} dispatches\n`);

  // 4. Create Retailers

    // Create Cash Collections with variance  console.log('\n🏪 Creating retailers...');

    console.log('💰 Creating cash collections...');  const retailers = await Retailer.insertMany([

    const collections = [];    {

    const completedDispatches = createdDispatches.filter(d => d.status === 'Completed');      name: 'Khan General Store',

          ownerName: 'Mohammad Khan',

    for (const dispatch of completedDispatches) {      phone: '9123456780',

      const expectedCash = dispatch.totalStockValue;      address: 'Shop 12, Connaught Place, New Delhi',

      const varianceAmount = Math.floor((Math.random() - 0.5) * 1000);      route: 'Route A - Central Delhi',

      const actualCash = expectedCash + varianceAmount;      gstNumber: 'GST001',

            creditLimit: 50000,

      const denominations = [];      outstandingBalance: 0,

      let remaining = Math.abs(actualCash);      active: true

      const denoms = [2000, 500, 200, 100, 50, 20, 10];    },

          {

      for (const denom of denoms) {      name: 'Gupta Supermart',

        if (remaining >= denom) {      ownerName: 'Ramesh Gupta',

          const count = Math.floor(remaining / denom);      phone: '9123456781',

          if (count > 0) {      address: 'Block C, Lajpat Nagar, New Delhi',

            denominations.push({      route: 'Route A - Central Delhi',

              noteValue: denom,      gstNumber: 'GST002',

              noteCount: count,      creditLimit: 75000,

              totalValue: count * denom      outstandingBalance: 0,

            });      active: true

            remaining -= count * denom;    },

          }    {

        }      name: 'Sharma Provisions',

      }      ownerName: 'Vijay Sharma',

            phone: '9123456782',

      collections.push({      address: 'Market Road, Karol Bagh, New Delhi',

        driverId: dispatch.driverId,      route: 'Route B - West Delhi',

        dispatchId: dispatch._id,      gstNumber: 'GST003',

        collectionDate: dispatch.dispatchDate,      creditLimit: 40000,

        denominations,      outstandingBalance: 0,

        coins: remaining,      active: true

        totalCashCollected: actualCash,    },

        totalChequeReceived: 0,    {

        totalOnlineReceived: 0,      name: 'Singh Mart',

        totalCreditGiven: 0,      ownerName: 'Harpreet Singh',

        expectedCash,      phone: '9123456783',

        status: 'Verified',      address: '45, Rajouri Garden, New Delhi',

        creditReceivedCash: 0,      route: 'Route B - West Delhi',

        creditReceivedCheque: 0,      gstNumber: 'GST004',

        bounceReceivedCash: 0,      creditLimit: 60000,

        bounceReceivedCheque: 0,      outstandingBalance: 0,

        emptyBottlesReceived: Math.floor(Math.random() * 20)      active: true

      });    },

    }    {

    await CashCollection.insertMany(collections);      name: 'Verma Stores',

          ownerName: 'Sunil Verma',

    // Calculate cumulative variance      phone: '9123456784',

    console.log('🔄 Calculating cumulative variance...');      address: 'Mayur Vihar Phase 1, New Delhi',

    const driverIds = await CashCollection.distinct('driverId');      route: 'Route C - East Delhi',

          gstNumber: 'GST005',

    for (const driverId of driverIds) {      creditLimit: 55000,

      const driverCollections = await CashCollection.find({ driverId })      outstandingBalance: 0,

        .sort({ collectionDate: 1, createdAt: 1 });      active: true

    },

      let runningVariance = 0;    {

      name: 'Jain Supermarket',

      for (const collection of driverCollections) {      ownerName: 'Ashok Jain',

        const totalReceived =       phone: '9123456785',

          (collection.totalCashCollected || 0) +       address: 'Preet Vihar, New Delhi',

          (collection.totalChequeReceived || 0) +       route: 'Route C - East Delhi',

          (collection.totalOnlineReceived || 0);      gstNumber: 'GST006',

      creditLimit: 70000,

        const dailyVariance =       outstandingBalance: 0,

          (totalReceived + (collection.totalCreditGiven || 0)) -       active: true

          (collection.expectedCash || 0);    },

    {

        await CashCollection.updateOne(      name: 'Bansal Retail',

          { _id: collection._id },      ownerName: 'Manoj Bansal',

          {      phone: '9123456786',

            $set: {      address: 'Dwarka Sector 10, New Delhi',

              previousVariance: runningVariance,      route: 'Route D - South Delhi',

              variance: dailyVariance,      gstNumber: 'GST007',

              cumulativeVariance: runningVariance + dailyVariance,      creditLimit: 45000,

              totalReceived: totalReceived      outstandingBalance: 0,

            }      active: true

          }    },

        );    {

      name: 'Agarwal Stores',

        runningVariance += dailyVariance;      ownerName: 'Rakesh Agarwal',

      }      phone: '9123456787',

    }      address: 'Saket, New Delhi',

    console.log(`✅ Created ${collections.length} cash collections\n`);      route: 'Route D - South Delhi',

      gstNumber: 'GST008',

    // Summary      creditLimit: 80000,

    console.log('\n' + '='.repeat(60));      outstandingBalance: 0,

    console.log('✨ DATABASE SEEDED SUCCESSFULLY!');      active: true

    console.log('='.repeat(60));    },

    console.log('\n📊 Summary:');    {

    console.log(`   👤 Admin: ${restoredAdmin.phone} / admin123`);      name: 'Chopra General Store',

    console.log(`   🚗 Drivers: ${drivers.length} (phone / 123456)`);      ownerName: 'Ravi Chopra',

    console.log(`   🏪 Retailers: ${retailers.length}`);      phone: '9123456788',

    console.log(`   🏭 Wholesalers: ${wholesalers.length}`);      address: 'Rohini Sector 7, New Delhi',

    console.log(`   📦 Products: ${createdProducts.length}`);      route: 'Route E - North Delhi',

    console.log(`   🚚 Dispatches: ${createdDispatches.length}`);      gstNumber: 'GST009',

    console.log(`   💰 Collections: ${collections.length} (with cumulative variance)`);      creditLimit: 35000,

    console.log('\n' + '='.repeat(60));      outstandingBalance: 0,

      active: true

  } catch (error) {    },

    console.error('\n❌ Error:', error);    {

    throw error;      name: 'Malhotra Mart',

  } finally {      ownerName: 'Sanjay Malhotra',

    await mongoose.disconnect();      phone: '9123456789',

    console.log('\n🔌 Disconnected from MongoDB');      address: 'Pitampura, New Delhi',

  }      route: 'Route E - North Delhi',

};      gstNumber: 'GST010',

      creditLimit: 50000,

clearAndSeedDatabase()      outstandingBalance: 0,

  .then(() => {      active: false // Inactive retailer

    console.log('\n✨ Done!');    }

    process.exit(0);  ]);

  })  console.log(`✅ Created ${retailers.length} retailers (1 inactive)`);

  .catch((error) => {

    console.error('\n💥 Fatal error:', error);  // 5. Create Wholesalers

    process.exit(1);  console.log('\n🏭 Creating wholesalers...');

  });  const wholesalers = await Wholesaler.insertMany([

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
