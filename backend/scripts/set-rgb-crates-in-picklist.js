/**
 * Set RGB Crates Loaded in Pick List
 * Updates the rgbCratesLoaded field from extracted PDF data
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import PickListExtracted from '../src/models/PickListExtracted.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function setRGBCrates() {
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
    console.log('   Driver Name:', pickList.salesMan);
    console.log('   Current RGB Crates:', pickList.rgbCratesLoaded || 'NOT SET ❌');
    console.log('');

    // According to the PDF, RGB crates loaded = 52
    const RGB_CRATES_FROM_PDF = 52;

    if (pickList.rgbCratesLoaded === RGB_CRATES_FROM_PDF) {
      console.log('✅ RGB Crates already set correctly!');
      console.log('   Value:', pickList.rgbCratesLoaded);
      return;
    }

    // Update RGB crates
    pickList.rgbCratesLoaded = RGB_CRATES_FROM_PDF;
    await pickList.save();

    console.log('✅ RGB Crates Updated Successfully!');
    console.log('   Old Value:', 'NOT SET');
    console.log('   New Value:', RGB_CRATES_FROM_PDF);
    console.log('');

    console.log('🎯 What This Means:');
    console.log('   - Driver started with ' + RGB_CRATES_FROM_PDF + ' RGB crates');
    console.log('   - These are returnable glass bottle crates');
    console.log('   - Driver must account for all crates');
    console.log('');

    console.log('💡 Expected RGB Tracking:');
    console.log('   If driver returns:');
    console.log('   - Full Crates: 10');
    console.log('   - Empty Crates: 35');
    console.log('');
    console.log('   Calculation:');
    console.log('   1. Sold Crates = 52 - 10 = 42');
    console.log('   2. Expected Empty = 42 (sold should return empty)');
    console.log('   3. Missing = 42 - 35 = 7 crates');
    console.log('   4. Penalty = 7 × ₹50 = ₹350');
    console.log('');

    console.log('🔧 Complete Setup Status:');
    console.log('   ✅ Pick List has RGB crates: ' + RGB_CRATES_FROM_PDF);
    console.log('   ✅ Ready for dispatch linking');
    console.log('   ✅ Ready for RGB calculation');
    console.log('');

    console.log('📱 Next Steps:');
    console.log('   1. Run: node scripts/update-dispatch-with-picklist.js');
    console.log('   2. This will link dispatch to pick list');
    console.log('   3. Driver app will then show RGB crates loaded');
    console.log('   4. RGB calculations will work correctly');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB\n');
  }
}

setRGBCrates();
