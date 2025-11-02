/**
 * Set Password for Driver SHAILESH
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Driver from '../src/models/Driver.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function setPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find driver
    const driver = await Driver.findOne({ phone: '9876543213' });

    if (!driver) {
      console.log('❌ Driver not found');
      return;
    }

    console.log(`Found driver: ${driver.name}`);
    console.log(`Phone: ${driver.phone}`);
    console.log(`Current password: ${driver.password || 'Not set'}\n`);

    // Set a simple test password (min 6 characters)
    driver.password = '123456';
    await driver.save();

    console.log('✅ Password updated successfully!\n');
    console.log('📱 Login Credentials:');
    console.log(`   Phone: ${driver.phone}`);
    console.log(`   Password: 123456`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Open driver app in Expo Go');
    console.log('   2. Login with: 9876543213 / 123456');
    console.log('   3. Go to Cash Collection screen');
    console.log('   4. Look for Pick List: PL-22850');
    console.log('   5. Enter RGB data and submit');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

setPassword();
