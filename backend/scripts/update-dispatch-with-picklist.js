/**
 * Update Existing Dispatch with Pick List Link
 * Fixes the missing link in existing dispatch records
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import DriverDispatch from '../src/models/DriverDispatch.js';
import PickListExtracted from '../src/models/PickListExtracted.js';
import Driver from '../src/models/Driver.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function updateDispatch() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the pick list
    const pickList = await PickListExtracted.findOne({ 
      pickListNumber: '11521003000269' 
    });

    if (!pickList) {
      console.log('❌ Pick list not found');
      return;
    }

    console.log('📋 Pick List Details:');
    console.log('   Pick List Number:', pickList.pickListNumber);
    console.log('   Vehicle:', pickList.vehicleNumber);
    console.log('   Driver Name (text):', pickList.salesMan);
    console.log('   RGB Crates:', pickList.rgbCratesLoaded || 'NOT SET');
    console.log('   Total Amount:', '₹' + (pickList.totalCollectionAmt || 'N/A'));
    console.log('');

    // Get the driver
    const driver = await Driver.findOne({ phone: '9876543213' });

    if (!driver) {
      console.log('❌ Driver not found');
      return;
    }

    console.log('👤 Driver Details:');
    console.log('   Name:', driver.name);
    console.log('   Phone:', driver.phone);
    console.log('   Driver ID:', driver._id);
    console.log('');

    // Find the active dispatch for this driver
    const dispatch = await DriverDispatch.findOne({
      driverId: driver._id,
      status: 'Active'
    }).sort({ date: -1 });

    if (!dispatch) {
      console.log('❌ No active dispatch found for this driver');
      console.log('   Run: node scripts/create-dispatch-for-testing.js');
      return;
    }

    console.log('🚚 Current Dispatch Details:');
    console.log('   Dispatch ID:', dispatch._id);
    console.log('   Pick List ID:', dispatch.pickListId || '❌ NOT SET');
    console.log('   Date:', dispatch.date);
    console.log('   Stock Value: ₹' + dispatch.totalStockValue);
    console.log('   Status:', dispatch.status);
    console.log('');

    if (dispatch.pickListId) {
      console.log('✅ Dispatch already has pick list link!');
      console.log('   No update needed.');
      return;
    }

    // Update dispatch with pick list link
    dispatch.pickListId = pickList._id;
    await dispatch.save();

    console.log('✅ Dispatch Updated Successfully!');
    console.log('   Pick List ID:', dispatch.pickListId);
    console.log('   Pick List Number:', pickList.pickListNumber);
    console.log('');

    console.log('🎯 What Changed:');
    console.log('   BEFORE: Dispatch had NO link to pick list');
    console.log('   AFTER:  Dispatch now references pick list ID');
    console.log('');

    console.log('📱 Driver App Will Now Show:');
    console.log('   ✅ Pick List: PL-22850 (11521003000269)');
    console.log('   ✅ Vehicle: ' + pickList.vehicleNumber);
    console.log('   ✅ RGB Crates Loaded: ' + (pickList.rgbCratesLoaded || 'NOT SET'));
    console.log('   ✅ Expected Collection: ₹' + (pickList.totalCollectionAmt || 'N/A'));
    console.log('');

    console.log('🔧 Next Steps:');
    console.log('   1. Reload driver app (shake device or press R)');
    console.log('   2. Tap "Submit Cash Collection"');
    console.log('   3. You should now see pick list details');
    console.log('   4. Enter RGB returns:');
    console.log('      - Full Crates: 10');
    console.log('      - Empty Crates: 35');
    console.log('   5. Submit and verify calculations');
    console.log('');

    console.log('💡 Expected Calculation:');
    if (pickList.rgbCratesLoaded) {
      console.log('   Loaded: ' + pickList.rgbCratesLoaded);
      console.log('   Sold: ' + pickList.rgbCratesLoaded + ' - 10 = ' + (pickList.rgbCratesLoaded - 10));
      console.log('   Missing: ' + (pickList.rgbCratesLoaded - 10) + ' - 35 = ' + (pickList.rgbCratesLoaded - 10 - 35));
      console.log('   Penalty: ' + (pickList.rgbCratesLoaded - 10 - 35) + ' × ₹50 = ₹' + ((pickList.rgbCratesLoaded - 10 - 35) * 50));
    } else {
      console.log('   ⚠️  RGB Crates Loaded not set in pick list');
      console.log('   Run: node scripts/set-rgb-crates-in-picklist.js');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
  }
}

updateDispatch();
