import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Driver from '../src/models/Driver.js';

const MONGODB_URI = 'mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp';

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Find admin
    const admin = await Driver.findOne({ phone: '9999999999' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin not found with phone 9999999999');
      process.exit(1);
    }

    console.log('✅ Admin found!');
    console.log('   Name:', admin.name);
    console.log('   Phone:', admin.phone);
    console.log('   Role:', admin.role);
    console.log('   Active:', admin.active);
    console.log('   Password hash:', admin.password?.substring(0, 20) + '...');
    console.log('   Password hash length:', admin.password?.length);
    
    // Test password comparison
    console.log('\n🔐 Testing password "admin123"...');
    const testPassword = 'admin123';
    
    // Method 1: Using model's comparePassword method
    if (admin.comparePassword) {
      const isValid1 = await admin.comparePassword(testPassword);
      console.log('   comparePassword method:', isValid1 ? '✅ VALID' : '❌ INVALID');
    } else {
      console.log('   comparePassword method: ⚠️ NOT DEFINED');
    }
    
    // Method 2: Direct bcrypt compare
    const isValid2 = await bcrypt.compare(testPassword, admin.password);
    console.log('   bcrypt.compare:', isValid2 ? '✅ VALID' : '❌ INVALID');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
