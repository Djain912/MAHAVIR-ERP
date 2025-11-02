/**
 * Create Driver Dispatch for Pick List Testing
 * Links the uploaded pick list to driver Shailesh
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import DriverDispatch from '../src/models/DriverDispatch.js';
import PickListExtracted from '../src/models/PickListExtracted.js';
import Driver from '../src/models/Driver.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function createDispatch() {
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

    console.log('✅ Found pick list:', pickList.pickListNumber);
    console.log('   Vehicle:', pickList.vehicleNumber);
    console.log('   Items:', pickList.items?.length);
    console.log('   Total Quantity:', pickList.totalLoQty);
    console.log('');

    // Get the driver
    const driver = await Driver.findOne({ phone: '9876543213' });

    if (!driver) {
      console.log('❌ Driver not found');
      return;
    }

    console.log('✅ Found driver:', driver.name);
    console.log('   Phone:', driver.phone);
    console.log('');

    // Check if dispatch already exists
    const existingDispatch = await DriverDispatch.findOne({
      pickListId: pickList._id
    });

    if (existingDispatch) {
      console.log('⚠️  Dispatch already exists');
      console.log('   Dispatch ID:', existingDispatch._id);
      console.log('   Pick List:', pickList.pickListNumber);
      console.log('   Date:', existingDispatch.date);
      console.log('   Status:', existingDispatch.status);
      console.log('');
      console.log('✅ You can now test the cash collection!');
      return;
    }

    // Create dispatch record with Pick List Link (NEW FIELD!)
    const dispatch = new DriverDispatch({
      driverId: driver._id,
      pickListId: pickList._id, // ✅ NOW LINKING TO PICK LIST!
      date: new Date(pickList.loadOutDate || Date.now()),
      totalStockValue: pickList.totalCollectionAmt || 130964.01,
      totalCashValue: 0, // No cash given initially
      status: 'Active'
    });

    await dispatch.save();

    console.log('✅ Dispatch Created Successfully with Pick List Link!');
    console.log('   Dispatch ID:', dispatch._id);
    console.log('   Pick List ID:', dispatch.pickListId);
    console.log('   Pick List Number:', pickList.pickListNumber);
    console.log('   Driver:', driver.name);
    console.log('   Date:', dispatch.date);
    console.log('   Total Stock Value: ₹' + dispatch.totalStockValue);
    console.log('   RGB Crates Loaded:', pickList.rgbCratesLoaded || 'NOT SET');
    console.log('   Status:', dispatch.status);
    console.log('');

    console.log('🎯 Next Steps:');
    console.log('   1. Reload the driver app (shake device or press R)');
    console.log('   2. Go to Cash Collection screen');
    console.log('   3. You should now see Pick List: PL-22850');
    console.log('   4. Tap on it to record collection');
    console.log('   5. Enter RGB data:');
    console.log('      - Full Crates Returned: 10');
    console.log('      - Empty Crates Returned: 35');
    console.log('   6. Submit and verify in admin dashboard');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

createDispatch();
