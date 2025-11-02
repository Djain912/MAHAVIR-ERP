/**
 * Verify Complete RGB Setup
 * Checks that all links and data are in place
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import DriverDispatch from '../src/models/DriverDispatch.js';
import PickListExtracted from '../src/models/PickListExtracted.js';
import Driver from '../src/models/Driver.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function verifySetup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║       RGB TRACKING SETUP VERIFICATION                        ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    let allGood = true;

    // 1. Check Pick List
    console.log('📋 STEP 1: Checking Pick List...');
    const pickList = await PickListExtracted.findOne({ 
      pickListNumber: '11521003000269' 
    });

    if (!pickList) {
      console.log('   ❌ Pick list not found\n');
      allGood = false;
    } else {
      console.log('   ✅ Pick List Found');
      console.log('   │  Number:', pickList.pickListNumber);
      console.log('   │  Vehicle:', pickList.vehicleNumber);
      console.log('   │  Driver:', pickList.salesMan);
      
      if (pickList.rgbCratesLoaded) {
        console.log('   ✅ RGB Crates Loaded:', pickList.rgbCratesLoaded);
      } else {
        console.log('   ❌ RGB Crates Loaded: NOT SET');
        allGood = false;
      }
      console.log('');
    }

    // 2. Check Driver
    console.log('👤 STEP 2: Checking Driver...');
    const driver = await Driver.findOne({ phone: '9876543213' });

    if (!driver) {
      console.log('   ❌ Driver not found\n');
      allGood = false;
    } else {
      console.log('   ✅ Driver Found');
      console.log('   │  Name:', driver.name);
      console.log('   │  Phone:', driver.phone);
      console.log('   │  ID:', driver._id);
      console.log('');
    }

    // 3. Check Dispatch
    console.log('🚚 STEP 3: Checking Dispatch...');
    const dispatch = await DriverDispatch.findOne({
      driverId: driver._id,
      status: 'Active'
    }).sort({ date: -1 });

    if (!dispatch) {
      console.log('   ❌ No active dispatch found\n');
      allGood = false;
    } else {
      console.log('   ✅ Dispatch Found');
      console.log('   │  ID:', dispatch._id);
      console.log('   │  Date:', dispatch.date);
      console.log('   │  Stock Value: ₹' + dispatch.totalStockValue);
      
      if (dispatch.pickListId) {
        console.log('   ✅ Pick List ID:', dispatch.pickListId);
        
        if (dispatch.pickListId.toString() === pickList._id.toString()) {
          console.log('   ✅ Pick List ID matches!');
        } else {
          console.log('   ⚠️  Pick List ID does NOT match expected pick list');
          allGood = false;
        }
      } else {
        console.log('   ❌ Pick List ID: NOT SET');
        allGood = false;
      }
      console.log('');
    }

    // 4. Summary
    console.log('═══════════════════════════════════════════════════════════════');
    if (allGood) {
      console.log('✅ ALL CHECKS PASSED! RGB TRACKING IS READY!\n');
      
      console.log('📱 YOU CAN NOW TEST IN DRIVER APP:\n');
      console.log('   1. Open driver app');
      console.log('   2. Login: 9876543213 / 123456');
      console.log('   3. Tap "Submit Cash Collection"');
      console.log('   4. You should see:\n');
      console.log('      ✅ Pick List: PL-22850');
      console.log('      ✅ Vehicle: ' + pickList.vehicleNumber);
      console.log('      ✅ RGB Crates Loaded: ' + pickList.rgbCratesLoaded);
      console.log('      ✅ Stock Value: ₹' + dispatch.totalStockValue + '\n');
      console.log('   5. Enter RGB returns:');
      console.log('      - Full Crates Returned: 10');
      console.log('      - Empty Crates Returned: 35\n');
      console.log('   6. Submit and verify calculation:\n');
      console.log('      Expected Result:');
      console.log('      • Sold: 52 - 10 = 42 crates');
      console.log('      • Missing: 42 - 35 = 7 crates');
      console.log('      • Penalty: 7 × ₹50 = ₹350\n');
      
      console.log('🎯 ADMIN DASHBOARD:');
      console.log('   Navigate to: RGB Reconciliation');
      console.log('   You should see the submitted RGB data\n');
      
    } else {
      console.log('❌ SOME CHECKS FAILED!\n');
      console.log('🔧 RUN THESE COMMANDS:\n');
      
      if (!pickList.rgbCratesLoaded) {
        console.log('   1. Set RGB Crates:');
        console.log('      node scripts/set-rgb-crates-in-picklist.js\n');
      }
      
      if (!dispatch.pickListId) {
        console.log('   2. Link Dispatch to Pick List:');
        console.log('      node scripts/update-dispatch-with-picklist.js\n');
      }
      
      console.log('   3. Run this verification again:');
      console.log('      node scripts/verify-rgb-setup.js\n');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 5. Data Flow Visualization
    if (allGood) {
      console.log('📊 COMPLETE DATA FLOW:\n');
      console.log('   PDF Upload');
      console.log('      ↓');
      console.log('   PickListExtracted');
      console.log('   ├─ pickListNumber: ' + pickList.pickListNumber);
      console.log('   ├─ rgbCratesLoaded: ' + pickList.rgbCratesLoaded + ' ✅');
      console.log('   └─ _id: ' + pickList._id);
      console.log('      ↓ (LINKED via pickListId)');
      console.log('   DriverDispatch');
      console.log('   ├─ pickListId: ' + dispatch.pickListId + ' ✅');
      console.log('   ├─ driverId: ' + dispatch.driverId);
      console.log('   └─ totalStockValue: ₹' + dispatch.totalStockValue);
      console.log('      ↓ (Driver submits)');
      console.log('   CashCollection');
      console.log('   ├─ pickListId: (will reference pick list)');
      console.log('   ├─ returnedFullCrates: (driver input)');
      console.log('   └─ returnedEmptyCrates: (driver input)');
      console.log('      ↓ (Auto-calculation)');
      console.log('   RGBTracking');
      console.log('   ├─ totalLoadedCrates: ' + pickList.rgbCratesLoaded + ' (from pick list)');
      console.log('   ├─ totalSoldCrates: (auto-calculated)');
      console.log('   ├─ missingEmptyCrates: (auto-calculated)');
      console.log('   └─ penaltyAmount: (auto-calculated)\n');
      console.log('═══════════════════════════════════════════════════════════════\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

verifySetup();
