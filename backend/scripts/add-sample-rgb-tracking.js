/**
 * Add Sample RGB Tracking Data
 * This script creates sample RGB tracking records for testing
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import PickListExtracted from '../src/models/PickListExtracted.js';
import RGBTracking from '../src/models/RGBTracking.js';
import Driver from '../src/models/Driver.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function addSampleRGBTracking() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the latest pick list (the one we uploaded)
    const pickList = await PickListExtracted.findOne({ 
      pickListNumber: '11521003000269' 
    });

    if (!pickList) {
      console.log('❌ Pick list 11521003000269 not found');
      return;
    }

    console.log(`\n✅ Found pick list: ${pickList.pickListNumber}`);
    console.log(`   Vehicle: ${pickList.vehicleNumber}`);
    console.log(`   Driver: ${pickList.salesMan}`);
    console.log(`   RGB Crates Loaded: ${pickList.rgbCratesLoaded}`);
    console.log(`   Total Collection: ₹${pickList.totalCollectionAmt}`);

    // Find driver by name
    const driver = await Driver.findOne({ 
      name: new RegExp(pickList.salesMan, 'i') 
    });

    if (!driver) {
      console.log(`⚠️  Driver "${pickList.salesMan}" not found in database`);
      console.log('   Creating sample RGB tracking without driver reference...');
    } else {
      console.log(`✅ Found driver: ${driver.name} (${driver.employeeId})`);
    }

    // Check if RGB tracking already exists
    const existing = await RGBTracking.findOne({ pickListId: pickList._id });
    if (existing) {
      console.log('\n⚠️  RGB tracking already exists for this pick list');
      console.log('   Deleting existing record...');
      await RGBTracking.deleteOne({ _id: existing._id });
    }

    // Create sample RGB tracking data
    // Scenario: Driver sold 42 crates, returned 10 full crates and 35 empty crates
    // Missing: 7 empty crates (42 sold - 35 returned = 7 missing)
    const rgbData = {
      pickListId: pickList._id,
      driverId: driver ? driver._id : new mongoose.Types.ObjectId(),
      date: new Date(),
      
      // Crate tracking
      totalLoadedCrates: pickList.rgbCratesLoaded || 52,
      totalSoldCrates: 42, // Sold 42 crates
      returnedFullCrates: 10, // Returned 10 full crates (unsold)
      
      // Empty bottles (calculated automatically by pre-save hook)
      returnedEmptyCrates: 35, // Returned 35 empty crates
      // expectedEmptyCrates: 42 (auto-calculated)
      // missingEmptyCrates: 7 (auto-calculated: 42 - 35)
      
      // Financial
      emptyBottleValue: 50, // ₹50 per empty crate
      // penaltyAmount: 350 (auto-calculated: 7 × 50)
      
      status: 'submitted',
      submittedAt: new Date(),
      
      notes: 'Sample RGB tracking data for testing. Driver collected cash and returned empties.',
      
      active: true
    };

    const rgbTracking = new RGBTracking(rgbData);
    await rgbTracking.save();

    console.log('\n✅ Sample RGB Tracking Created:');
    console.log(`   Loaded Crates: ${rgbTracking.totalLoadedCrates}`);
    console.log(`   Sold Crates: ${rgbTracking.totalSoldCrates}`);
    console.log(`   Returned Full: ${rgbTracking.returnedFullCrates}`);
    console.log(`   Expected Empties: ${rgbTracking.expectedEmptyCrates}`);
    console.log(`   Returned Empties: ${rgbTracking.returnedEmptyCrates}`);
    console.log(`   Missing Empties: ${rgbTracking.missingEmptyCrates}`);
    console.log(`   Penalty: ₹${rgbTracking.penaltyAmount}`);
    console.log(`   Status: ${rgbTracking.status}`);

    // Update pick list to mark RGB as processed
    pickList.rgbProcessed = true;
    pickList.rgbProcessedAt = new Date();
    await pickList.save();

    console.log('\n✅ Pick list updated with rgbProcessed = true');

    console.log('\n🎯 Test in Admin Dashboard:');
    console.log('   1. Go to RGB Reconciliation page');
    console.log('   2. Find pick list 11521003000269');
    console.log('   3. Click "View Details"');
    console.log('   4. You should see the RGB tracking section with all data');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

addSampleRGBTracking();
