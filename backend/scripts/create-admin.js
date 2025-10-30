import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Driver from '../src/models/Driver.js';

const MONGODB_URI = 'mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Admin credentials - must be 10 digits
    const adminPhone = '9999999999'; // 10 nines
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await Driver.findOne({ phone: adminPhone });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with phone:', adminPhone);
      console.log('   Updating password to:', adminPassword);
      
      // Update password (pre-save hook will hash it automatically)
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      
      console.log('✅ Admin password updated successfully!\n');
    } else {
      console.log('📦 Creating new admin account...');
      
      // Create admin (pre-save hook will hash password automatically)
      const admin = new Driver({
        name: 'Admin User',
        phone: adminPhone,
        password: adminPassword, // Don't hash manually, let pre-save hook do it
        role: 'Admin',
        route: 'Admin',
        active: true
      });

      await admin.save();
      console.log('✅ Admin account created successfully!\n');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('Phone:', adminPhone);
    console.log('Password:', adminPassword);
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
