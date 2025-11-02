/**
 * Comprehensive Database Seeding Script
 * Fills 2 months (October & November 2025) of realistic data
 * Preserves: Drivers, Retailers, Wholesalers, Admin credentials, Products, Stock
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Driver from '../src/models/Driver.js';
import Product from '../src/models/Product.js';
import StockIn from '../src/models/StockIn.js';
import PickListExtracted from '../src/models/PickListExtracted.js';
import DriverDispatch from '../src/models/DriverDispatch.js';
import CashCollection from '../src/models/CashCollection.js';
import RGBTracking from '../src/models/RGBTracking.js';
import Attendance from '../src/models/Attendance.js';
import SalarySlip from '../src/models/SalarySlip.js';
import ChequeManagement from '../src/models/ChequeManagement.js';
import Expense from '../src/models/Expense.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

// Date ranges
const OCT_START = new Date('2025-10-01T00:00:00');
const OCT_END = new Date('2025-10-31T23:59:59');
const NOV_START = new Date('2025-11-01T00:00:00');
const NOV_END = new Date('2025-11-30T23:59:59');

// Helper function to generate random date in range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to generate random number in range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║     DATABASE SEEDING - OCTOBER & NOVEMBER 2025               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Step 1: Clean old data (preserve real data)
    console.log('🧹 STEP 1: Cleaning old data...\n');
    
    console.log('   Preserving:');
    console.log('   ✅ Drivers (all driver records)');
    console.log('   ✅ Products (product catalog)');
    console.log('   ✅ Admin credentials');
    console.log('   ✅ Current stock levels\n');
    
    console.log('   Cleaning:');
    
    const pickListCount = await PickListExtracted.countDocuments();
    await PickListExtracted.deleteMany({});
    console.log('   ✅ Pick Lists:', pickListCount, 'removed');
    
    const dispatchCount = await DriverDispatch.countDocuments();
    await DriverDispatch.deleteMany({});
    console.log('   ✅ Dispatches:', dispatchCount, 'removed');
    
    const collectionCount = await CashCollection.countDocuments();
    await CashCollection.deleteMany({});
    console.log('   ✅ Cash Collections:', collectionCount, 'removed');
    
    const rgbCount = await RGBTracking.countDocuments();
    await RGBTracking.deleteMany({});
    console.log('   ✅ RGB Tracking:', rgbCount, 'removed');
    
    const attendanceCount = await Attendance.countDocuments();
    await Attendance.deleteMany({});
    console.log('   ✅ Attendance:', attendanceCount, 'removed');
    
    const salaryCount = await SalarySlip.countDocuments();
    await SalarySlip.deleteMany({});
    console.log('   ✅ Salary Slips:', salaryCount, 'removed');
    
    const chequeCount = await ChequeManagement.countDocuments();
    await ChequeManagement.deleteMany({});
    console.log('   ✅ Cheques:', chequeCount, 'removed');
    
    const expenseCount = await Expense.countDocuments();
    await Expense.deleteMany({});
    console.log('   ✅ Expenses:', expenseCount, 'removed\n');

    // Step 2: Get existing data
    console.log('📊 STEP 2: Loading existing data...\n');
    
    const drivers = await Driver.find({ active: true });
    console.log('   ✅ Found', drivers.length, 'active drivers');
    
    const products = await Product.find({ active: true });
    console.log('   ✅ Found', products.length, 'active products');
    
    const admin = await Driver.findOne({ role: 'Admin' });
    console.log('   ✅ Found admin:', admin?.name || 'N/A');
    console.log('');

    if (drivers.length === 0) {
      console.log('❌ No drivers found! Cannot seed data.');
      return;
    }

    if (products.length === 0) {
      console.log('❌ No products found! Cannot seed data.');
      return;
    }

    // Step 3: Generate realistic data
    console.log('🌱 STEP 3: Seeding October 2025 data...\n');
    
    let stats = {
      pickLists: 0,
      dispatches: 0,
      collections: 0,
      rgbTracking: 0,
      attendance: 0,
      cheques: 0,
      expenses: 0,
      salarySlips: 0
    };

    // October data (31 days)
    for (let day = 1; day <= 31; day++) {
      const date = new Date(`2025-10-${day.toString().padStart(2, '0')}T08:00:00`);
      
      // Skip Sundays (less activity)
      if (date.getDay() === 0 && Math.random() > 0.3) continue;
      
      // Attendance for all drivers
      for (const driver of drivers) {
        // 85% attendance rate
        if (Math.random() > 0.15) {
          const shifts = driver.role === 'Driver' && Math.random() > 0.7 ? ['Shift-1', 'Shift-2'] : ['Single'];
          
          for (const shift of shifts) {
            await Attendance.create({
              employeeId: driver._id,
              date: new Date(date.setHours(0, 0, 0, 0)),
              shift,
              status: Math.random() > 0.1 ? 'Present' : (Math.random() > 0.5 ? 'Half-Day' : 'Absent'),
              shiftStartTime: shift === 'Shift-1' ? '06:00' : shift === 'Shift-2' ? '14:00' : '08:00',
              shiftEndTime: shift === 'Shift-1' ? '14:00' : shift === 'Shift-2' ? '22:00' : '18:00',
              markedBy: admin?._id,
              remarks: shift !== 'Single' ? `${shift} duty` : ''
            });
            stats.attendance++;
          }
        }
      }

      // Generate 3-8 pick lists per day
      const pickListsPerDay = randomInt(3, 8);
      
      for (let i = 0; i < pickListsPerDay; i++) {
        const driver = randomItem(drivers.filter(d => d.role === 'Driver'));
        const pickListNumber = `115210${day.toString().padStart(2, '0')}${i.toString().padStart(3, '0')}`;
        
        // Select 10-30 random products (ensure no duplicates)
        const itemCount = Math.min(randomInt(10, 30), products.length);
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        const selectedProducts = shuffled.slice(0, itemCount);
        
        const items = selectedProducts.filter(p => p && p.itemCode && p.itemName && p.sellingPrice).map(p => ({
          itemCode: p.itemCode,
          itemName: p.itemName,
          category1: p.category || 'Beverages',
          category2: p.subCategory || 'Soft Drink',
          mrp: p.sellingPrice,
          loQty: randomInt(5, 50),
          sellQty: randomInt(5, 50),
          totalLoadInQty: randomInt(10, 100)
        }));
        
        const totalLoQty = items.reduce((sum, item) => sum + item.loQty, 0);
        const rgbCratesLoaded = randomInt(20, 100);
        
        const pickList = await PickListExtracted.create({
          pickListNumber,
          loadoutNumber: `LO-${pickListNumber}`,
          vehicleNumber: `MH01CV${randomInt(1000, 9999)}`,
          createdDate: date,
          loadOutDate: date,
          loadoutType: 'Regular',
          route: `Route-${randomInt(1, 10)}`,
          salesMan: driver.name,
          items,
          totalItems: items.length,
          totalLoQty,
          totalSellQty: items.reduce((sum, item) => sum + item.sellQty, 0),
          totalLoadInQty: items.reduce((sum, item) => sum + item.totalLoadInQty, 0),
          pdfFileName: `PickList_${pickListNumber}.pdf`,
          stockReduced: true,
          stockReducedAt: date,
          rgbCratesLoaded,
          expectedTotal: items.reduce((sum, item) => sum + (item.mrp * item.loQty), 0)
        });
        stats.pickLists++;
        
        // Create dispatch for this pick list
        const dispatch = await DriverDispatch.create({
          driverId: driver._id,
          pickListId: pickList._id,
          date,
          totalStockValue: pickList.expectedTotal,
          totalCashValue: randomInt(5000, 20000),
          status: 'Completed'
        });
        stats.dispatches++;
        
        // Create cash collection (90% completion rate)
        if (Math.random() > 0.1) {
          const returnedFull = randomInt(0, Math.floor(rgbCratesLoaded * 0.2));
          const soldCrates = rgbCratesLoaded - returnedFull;
          const returnedEmpty = randomInt(Math.floor(soldCrates * 0.8), soldCrates);
          const missingCrates = soldCrates - returnedEmpty;
          
          const cashAmount = pickList.expectedTotal * (0.85 + Math.random() * 0.15);
          
          const collection = await CashCollection.create({
            driverId: driver._id,
            dispatchId: dispatch._id,
            pickListId: pickList._id,
            collectionDate: new Date(date.getTime() + randomInt(8, 12) * 60 * 60 * 1000),
            expectedCash: pickList.expectedTotal,
            totalCashCollected: Math.floor(cashAmount),
            totalReceived: Math.floor(cashAmount),
            totalChequeReceived: Math.random() > 0.7 ? randomInt(5000, 50000) : 0,
            coins: randomInt(0, 500),
            denominations: [
              { noteValue: 500, noteCount: randomInt(10, 50), totalValue: 500 * randomInt(10, 50) },
              { noteValue: 200, noteCount: randomInt(5, 20), totalValue: 200 * randomInt(5, 20) },
              { noteValue: 100, noteCount: randomInt(10, 30), totalValue: 100 * randomInt(10, 30) }
            ],
            returnedFullCrates: returnedFull,
            returnedEmptyCrates: returnedEmpty,
            emptyBottlesReceived: returnedEmpty * 24,
            remarks: 'Daily collection',
            status: 'Verified'
          });
          stats.collections++;
          
          // Create RGB tracking
          await RGBTracking.create({
            pickListId: pickList._id,
            driverId: driver._id,
            dispatchId: dispatch._id,
            collectionId: collection._id,
            date: collection.date,
            totalLoadedCrates: rgbCratesLoaded,
            returnedFullCrates: returnedFull,
            returnedEmptyCrates: returnedEmpty,
            totalSoldCrates: soldCrates,
            expectedEmptyCrates: soldCrates,
            missingEmptyCrates: missingCrates,
            emptyBottleValue: 50,
            penaltyAmount: missingCrates * 50,
            remarks: `RGB tracking for ${pickListNumber}`
          });
          stats.rgbTracking++;
        }
      }
      
      // Generate expenses (2-5 per day)
      const expensesPerDay = randomInt(2, 5);
      for (let i = 0; i < expensesPerDay; i++) {
        const categories = ['COIN', 'TEA', 'Loder Lunch', 'Extra Loder', 'Office Supplies', 'Transport', 'Maintenance', 'Utilities', 'Petty Cash', 'Other'];
        const selectedCategory = randomItem(categories);
        await Expense.create({
          date,
          category: selectedCategory,
          amount: randomInt(500, 5000),
          description: `${selectedCategory} expense - Daily operational cost`,
          createdBy: Math.random() > 0.3 ? randomItem(drivers)._id : admin?._id,
          approvedBy: admin?._id,
          status: Math.random() > 0.2 ? 'Approved' : 'Pending',
          paymentMode: randomItem(['Cash', 'UPI', 'Card']),
          paidTo: `Vendor ${randomInt(1, 20)}`
        });
        stats.expenses++;
      }
      
      // Note: Cheque generation skipped as it requires Sale, Retailer, and Driver relationships
      // which are not part of this simplified seed data
      // You can add cheques manually through the dashboard if needed
      
      if (day % 5 === 0) {
        console.log(`   📅 October ${day}: ${stats.pickLists} pick lists, ${stats.attendance} attendance records`);
      }
    }
    
    console.log('\n   ✅ October 2025 seeding complete!\n');

    // November data (30 days)
    console.log('🌱 STEP 4: Seeding November 2025 data...\n');
    
    for (let day = 1; day <= 30; day++) {
      const date = new Date(`2025-11-${day.toString().padStart(2, '0')}T08:00:00`);
      
      // Skip Sundays
      if (date.getDay() === 0 && Math.random() > 0.3) continue;
      
      // Attendance for all drivers
      for (const driver of drivers) {
        if (Math.random() > 0.15) {
          const shifts = driver.role === 'Driver' && Math.random() > 0.7 ? ['Shift-1', 'Shift-2'] : ['Single'];
          
          for (const shift of shifts) {
            await Attendance.create({
              employeeId: driver._id,
              date: new Date(date.setHours(0, 0, 0, 0)),
              shift,
              status: Math.random() > 0.1 ? 'Present' : (Math.random() > 0.5 ? 'Half-Day' : 'Absent'),
              shiftStartTime: shift === 'Shift-1' ? '06:00' : shift === 'Shift-2' ? '14:00' : '08:00',
              shiftEndTime: shift === 'Shift-1' ? '14:00' : shift === 'Shift-2' ? '22:00' : '18:00',
              markedBy: admin?._id,
              remarks: shift !== 'Single' ? `${shift} duty` : ''
            });
            stats.attendance++;
          }
        }
      }

      // Generate pick lists
      const pickListsPerDay = randomInt(3, 8);
      
      for (let i = 0; i < pickListsPerDay; i++) {
        const driver = randomItem(drivers.filter(d => d.role === 'Driver'));
        const pickListNumber = `115211${day.toString().padStart(2, '0')}${i.toString().padStart(3, '0')}`;
        
        const itemCount = Math.min(randomInt(10, 30), products.length);
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        const selectedProducts = shuffled.slice(0, itemCount);
        
        const items = selectedProducts.filter(p => p && p.itemCode && p.itemName && p.sellingPrice).map(p => ({
          itemCode: p.itemCode,
          itemName: p.itemName,
          category1: p.category || 'Beverages',
          category2: p.subCategory || 'Soft Drink',
          mrp: p.sellingPrice,
          loQty: randomInt(5, 50),
          sellQty: randomInt(5, 50),
          totalLoadInQty: randomInt(10, 100)
        }));
        
        const totalLoQty = items.reduce((sum, item) => sum + item.loQty, 0);
        const rgbCratesLoaded = randomInt(20, 100);
        
        const pickList = await PickListExtracted.create({
          pickListNumber,
          loadoutNumber: `LO-${pickListNumber}`,
          vehicleNumber: `MH01CV${randomInt(1000, 9999)}`,
          createdDate: date,
          loadOutDate: date,
          loadoutType: 'Regular',
          route: `Route-${randomInt(1, 10)}`,
          salesMan: driver.name,
          items,
          totalItems: items.length,
          totalLoQty,
          totalSellQty: items.reduce((sum, item) => sum + item.sellQty, 0),
          totalLoadInQty: items.reduce((sum, item) => sum + item.totalLoadInQty, 0),
          pdfFileName: `PickList_${pickListNumber}.pdf`,
          stockReduced: true,
          stockReducedAt: date,
          rgbCratesLoaded,
          expectedTotal: items.reduce((sum, item) => sum + (item.mrp * item.loQty), 0)
        });
        stats.pickLists++;
        
        const dispatch = await DriverDispatch.create({
          driverId: driver._id,
          pickListId: pickList._id,
          date,
          totalStockValue: pickList.expectedTotal,
          totalCashValue: randomInt(5000, 20000),
          status: day <= 28 ? 'Completed' : (Math.random() > 0.5 ? 'Active' : 'Completed')
        });
        stats.dispatches++;
        
        if (dispatch.status === 'Completed') {
          const returnedFull = randomInt(0, Math.floor(rgbCratesLoaded * 0.2));
          const soldCrates = rgbCratesLoaded - returnedFull;
          const returnedEmpty = randomInt(Math.floor(soldCrates * 0.8), soldCrates);
          const missingCrates = soldCrates - returnedEmpty;
          
          const cashAmount = pickList.expectedTotal * (0.85 + Math.random() * 0.15);
          
          const collection = await CashCollection.create({
            driverId: driver._id,
            dispatchId: dispatch._id,
            pickListId: pickList._id,
            collectionDate: new Date(date.getTime() + randomInt(8, 12) * 60 * 60 * 1000),
            expectedCash: pickList.expectedTotal,
            totalCashCollected: Math.floor(cashAmount),
            totalReceived: Math.floor(cashAmount),
            totalChequeReceived: Math.random() > 0.7 ? randomInt(5000, 50000) : 0,
            coins: randomInt(0, 500),
            denominations: [
              { noteValue: 500, noteCount: randomInt(10, 50), totalValue: 500 * randomInt(10, 50) },
              { noteValue: 200, noteCount: randomInt(5, 20), totalValue: 200 * randomInt(5, 20) },
              { noteValue: 100, noteCount: randomInt(10, 30), totalValue: 100 * randomInt(10, 30) }
            ],
            returnedFullCrates: returnedFull,
            returnedEmptyCrates: returnedEmpty,
            emptyBottlesReceived: returnedEmpty * 24,
            remarks: 'Daily collection',
            status: 'Verified'
          });
          stats.collections++;
          
          await RGBTracking.create({
            pickListId: pickList._id,
            driverId: driver._id,
            dispatchId: dispatch._id,
            collectionId: collection._id,
            date: collection.date,
            totalLoadedCrates: rgbCratesLoaded,
            returnedFullCrates: returnedFull,
            returnedEmptyCrates: returnedEmpty,
            totalSoldCrates: soldCrates,
            expectedEmptyCrates: soldCrates,
            missingEmptyCrates: missingCrates,
            emptyBottleValue: 50,
            penaltyAmount: missingCrates * 50,
            remarks: `RGB tracking for ${pickListNumber}`
          });
          stats.rgbTracking++;
        }
      }
      
      // Expenses
      const expensesPerDay = randomInt(2, 5);
      for (let i = 0; i < expensesPerDay; i++) {
        const categories = ['COIN', 'TEA', 'Loder Lunch', 'Extra Loder', 'Office Supplies', 'Transport', 'Maintenance', 'Utilities', 'Petty Cash', 'Other'];
        const selectedCategory = randomItem(categories);
        await Expense.create({
          date,
          category: selectedCategory,
          amount: randomInt(500, 5000),
          description: `${selectedCategory} expense - Daily operational cost`,
          createdBy: Math.random() > 0.3 ? randomItem(drivers)._id : admin?._id,
          approvedBy: admin?._id,
          status: Math.random() > 0.2 ? 'Approved' : 'Pending',
          paymentMode: randomItem(['Cash', 'UPI', 'Card']),
          paidTo: `Vendor ${randomInt(1, 20)}`
        });
        stats.expenses++;
      }
      
      // Note: Cheque generation skipped (requires Sale, Retailer, Driver relationships)
      
      if (day % 5 === 0) {
        console.log(`   📅 November ${day}: ${stats.pickLists} total pick lists, ${stats.attendance} total attendance`);
      }
    }
    
    console.log('\n   ✅ November 2025 seeding complete!\n');

    // Generate October salary slips
    console.log('💰 STEP 5: Generating salary slips...\n');
    
    for (const driver of drivers) {
      const octAttendance = await Attendance.find({
        employeeId: driver._id,
        date: { $gte: OCT_START, $lte: OCT_END },
        status: 'Present'
      });
      
      if (octAttendance.length > 0) {
        const basicSalary = driver.salary || 15000;
        const allowances = randomInt(1000, 3000);
        const absentDeduction = Math.max(0, (31 - octAttendance.length) * 500);
        const advanceDeduction = randomInt(0, 2000);
        const grossSalary = basicSalary + allowances;
        const totalDeductions = absentDeduction + advanceDeduction;
        const netSalary = grossSalary - totalDeductions;
        
        await SalarySlip.create({
          employeeId: driver._id,
          month: 10,
          year: 2025,
          basicSalary: basicSalary,
          attendance: {
            totalDays: 31,
            presentDays: octAttendance.length,
            absentDays: 31 - octAttendance.length,
            paidLeaveDays: 0,
            workingDays: octAttendance.length
          },
          earnings: {
            basicAmount: basicSalary,
            allowances: allowances,
            bonus: 0
          },
          deductions: {
            absentDeduction: absentDeduction,
            advanceDeduction: advanceDeduction,
            other: 0
          },
          grossSalary: grossSalary,
          totalDeductions: totalDeductions,
          netSalary: netSalary,
          status: 'Paid',
          paidDate: new Date('2025-11-01'),
          generatedBy: admin?._id
        });
        stats.salarySlips++;
      }
    }
    
    console.log('   ✅ October salary slips generated\n');

    // Final summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDING COMPLETE!\n');
    console.log('📊 Summary:\n');
    console.log(`   Pick Lists:        ${stats.pickLists.toLocaleString()}`);
    console.log(`   Dispatches:        ${stats.dispatches.toLocaleString()}`);
    console.log(`   Cash Collections:  ${stats.collections.toLocaleString()}`);
    console.log(`   RGB Tracking:      ${stats.rgbTracking.toLocaleString()}`);
    console.log(`   Attendance:        ${stats.attendance.toLocaleString()}`);
    console.log(`   Expenses:          ${stats.expenses.toLocaleString()}`);
    console.log(`   Salary Slips:      ${stats.salarySlips.toLocaleString()} (October)`);
    console.log('\n📅 Data Range:');
    console.log(`   October 2025:  ${OCT_START.toDateString()} - ${OCT_END.toDateString()}`);
    console.log(`   November 2025: ${NOV_START.toDateString()} - ${NOV_END.toDateString()}`);
    console.log('\n🎯 Preserved Data:');
    console.log(`   Drivers:   ${drivers.length}`);
    console.log(`   Products:  ${products.length}`);
    console.log(`   Admin:     ${admin?.name || 'N/A'}`);
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 Your app and dashboard now have realistic data!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

seedDatabase();
