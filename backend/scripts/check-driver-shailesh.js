/**
 * Check Driver SHAILESH Details
 * Find driver credentials for testing
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Driver from '../src/models/Driver.js';
import PickListExtracted from '../src/models/PickListExtracted.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function checkDriver() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the pick list
    const pickList = await PickListExtracted.findOne({ 
      pickListNumber: '11521003000269' 
    });

    if (pickList) {
      console.log('📄 Pick List Details:');
      console.log(`   Pick List Number: ${pickList.pickListNumber}`);
      console.log(`   Vehicle: ${pickList.vehicleNumber}`);
      console.log(`   Driver Name: ${pickList.salesMan}`);
      console.log(`   RGB Crates Loaded: ${pickList.rgbCratesLoaded || 52}`);
      console.log(`   Total Collection: ₹${pickList.totalCollectionAmt || 130964.01}`);
      console.log('');
    }

    // Search for driver by name (case-insensitive)
    const drivers = await Driver.find({ 
      name: new RegExp('SHAILESH', 'i')
    });

    if (drivers.length === 0) {
      console.log('❌ No driver found with name SHAILESH\n');
      console.log('📋 Let me show all drivers:');
      const allDrivers = await Driver.find({ active: true }).limit(10);
      console.log(`\nFound ${allDrivers.length} active drivers:\n`);
      allDrivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.name}`);
        console.log(`   Phone: ${driver.phone}`);
        console.log(`   Employee ID: ${driver.employeeId || 'N/A'}`);
        console.log(`   Password: ${driver.password || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log(`✅ Found ${drivers.length} driver(s) matching "SHAILESH":\n`);
      drivers.forEach((driver, index) => {
        console.log(`${index + 1}. Name: ${driver.name}`);
        console.log(`   Phone: ${driver.phone}`);
        console.log(`   Employee ID: ${driver.employeeId || 'N/A'}`);
        console.log(`   Password: ${driver.password || 'Not set'}`);
        console.log(`   Active: ${driver.active}`);
        console.log('');
      });
    }

    console.log('🎯 Login Instructions:');
    console.log('   1. Open driver app (Expo Go)');
    console.log('   2. Use Phone Number from above');
    console.log('   3. Use Password from above');
    console.log('   4. After login, go to "Cash Collection"');
    console.log('   5. Look for Pick List: PL-22850 or 11521003000269');
    console.log('   6. Enter RGB data:');
    console.log('      - Full Crates Returned: 10');
    console.log('      - Empty Crates Returned: 35');
    console.log('      - System will calculate: 42 sold, 7 missing, ₹350 penalty');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

checkDriver();
