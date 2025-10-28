/**
 * Check and create test driver for mobile app
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from '../src/models/Driver.js';

// Load environment variables
dotenv.config();

const checkDrivers = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check existing drivers
    const drivers = await Driver.find().select('-password');
    console.log(`📊 Total drivers in database: ${drivers.length}\n`);

    if (drivers.length > 0) {
      console.log('👥 Existing drivers:');
      drivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.name}`);
        console.log(`   ID: ${driver._id}`);
        console.log(`   Phone: ${driver.phone}`);
        console.log(`   Role: ${driver.role}`);
        console.log(`   Active: ${driver.active}`);
        console.log(`   Salary: ₹${driver.salary}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No drivers found in database');
    }

    // Check if test driver exists
    const testDriver = await Driver.findOne({ phone: '9876543210' });
    
    if (!testDriver) {
      console.log('🔧 Creating test driver account...\n');
      
      const newDriver = await Driver.create({
        name: 'Test Driver',
        phone: '9876543210',
        password: '123456',
        role: 'Driver',
        salary: 15000,
        active: true
      });

      console.log('✅ Test driver created successfully!');
      console.log('📱 Login credentials for mobile app:');
      console.log('   Phone: 9876543210');
      console.log('   Password: 123456');
      console.log(`   Driver ID: ${newDriver._id}\n`);
    } else {
      console.log('✅ Test driver already exists!');
      console.log('📱 Login credentials for mobile app:');
      console.log('   Phone: 9876543210');
      console.log('   Password: 123456');
      console.log(`   Driver ID: ${testDriver._id}\n`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDrivers();
