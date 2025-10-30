import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import DriverModel from '../src/models/Driver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Real Drivers Data
const driversData = [
  { srNo: 1, name: 'Sanjay', phone: '9876543211', route: 'Mahalaxmi Route' },
  { srNo: 2, name: 'Divakar', phone: '9876543212', route: 'Fort Route' },
  { srNo: 3, name: 'Shailesh', phone: '9876543213', route: 'Marine Drive Route' },
  { srNo: 4, name: 'Manoj', phone: '9876543214', route: 'Walkeshwar Route' },
  { srNo: 5, name: 'Musa', phone: '9876543215', route: 'Altamount Road Route' },
  { srNo: 6, name: 'Prashant', phone: '9876543216', route: 'Kalbadevi Route' },
  { srNo: 7, name: 'Choudhary', phone: '9876543217', route: 'Dhobi Talaw Route' },
  { srNo: 8, name: 'Sonu Punjab', phone: '9876543218', route: 'Mumbai Central Route' },
  { srNo: 9, name: 'Sonu Forklift', phone: '9876543219', route: 'Madanpura Route' },
  { srNo: 10, name: 'Rajesh', phone: '9876543220', route: 'Worli Koliwada Route' },
  { srNo: 11, name: 'Mukesh', phone: '9876543221', route: 'Spare 01 - Route' },
  { srNo: 12, name: 'Awdesh', phone: '9876543222', route: 'Spare 02 - Route' },
  { srNo: 13, name: 'Extra 01', phone: '9876543223', route: 'Spare 03 - Route' },
  { srNo: 14, name: 'Extra 02', phone: '9876543224', route: 'Extra Route 01' },
  { srNo: 15, name: 'Extra 03', phone: '9876543225', route: 'Extra Route 02' }
];

// Real Wholesalers Data
const wholesalersData = [
  { srNo: 1, name: 'Counter', contactPerson: 'Manager', phone: '9123456781' },
  { srNo: 2, name: 'R S Enterprises', contactPerson: 'R S', phone: '9123456782' },
  { srNo: 3, name: 'Arjun Soda Water', contactPerson: 'Arjun', phone: '9123456783' },
  { srNo: 4, name: 'New Shettey', contactPerson: 'Shettey', phone: '9123456784' },
  { srNo: 5, name: 'Kocktail Enterprises', contactPerson: 'Manager', phone: '9123456785' },
  { srNo: 6, name: 'Vinit Dist', contactPerson: 'Vinit', phone: '9123456786' },
  { srNo: 7, name: 'Rajesh Bhai Matunga', contactPerson: 'Rajesh Bhai', phone: '9123456787' },
  { srNo: 8, name: 'Darika', contactPerson: 'Manager', phone: '9123456788' },
  { srNo: 9, name: 'A G Khan Chacha', contactPerson: 'A G Khan', phone: '9123456789' },
  { srNo: 10, name: 'Chintamani Enterprises', contactPerson: 'Chintamani', phone: '9123456790' },
  { srNo: 11, name: 'Shree Bhram', contactPerson: 'Manager', phone: '9123456791' },
  { srNo: 12, name: 'Muzaffar Bhai', contactPerson: 'Muzaffar Bhai', phone: '9123456792' },
  { srNo: 13, name: 'Shukla Ji', contactPerson: 'Shukla Ji', phone: '9123456793' },
  { srNo: 14, name: 'Jaffar Shukla Ji', contactPerson: 'Jaffar Shukla', phone: '9123456794' },
  { srNo: 15, name: 'Vipul Bhai RTO', contactPerson: 'Vipul Bhai', phone: '9123456795' },
  { srNo: 16, name: 'National Sunil Bhai', contactPerson: 'Sunil Bhai', phone: '9123456796' },
  { srNo: 17, name: 'Jhangir RTO', contactPerson: 'Jhangir', phone: '9123456797' },
  { srNo: 18, name: 'Bitwain Chaudhary', contactPerson: 'Bitwain', phone: '9123456798' },
  { srNo: 19, name: 'Ramesh Enterprises', contactPerson: 'Ramesh', phone: '9123456799' },
  { srNo: 20, name: 'Alvi Enterprises', contactPerson: 'Alvi', phone: '9123456800' },
  { srNo: 21, name: 'Z N Javed Bhai', contactPerson: 'Javed Bhai', phone: '9123456801' },
  { srNo: 22, name: 'Sabnam', contactPerson: 'Sabnam', phone: '9123456802' },
  { srNo: 23, name: 'King Coldrink', contactPerson: 'Manager', phone: '9123456803' },
  { srNo: 24, name: 'Amin & Sons', contactPerson: 'Amin', phone: '9123456804' },
  { srNo: 25, name: 'Sania Coldrink', contactPerson: 'Sania', phone: '9123456805' },
  { srNo: 26, name: 'S I Water', contactPerson: 'Manager', phone: '9123456806' },
  { srNo: 27, name: 'Badshah Coldrink', contactPerson: 'Badshah', phone: '9123456807' },
  { srNo: 28, name: 'Tirupati Enterprises', contactPerson: 'Manager', phone: '9123456808' },
  { srNo: 29, name: 'S P Gupta', contactPerson: 'S P Gupta', phone: '9123456809' },
  { srNo: 30, name: 'Hind Coldrink', contactPerson: 'Manager', phone: '9123456810' }
];

// Routes with Manager mapping
const routesData = [
  { name: 'Prajapati Ji - Mahalaxmi Route', manager: 'Prajapati Ji', area: 'Mahalaxmi' },
  { name: 'Divakar Ji - Fort Route', manager: 'Divakar Ji', area: 'Fort' },
  { name: 'Ajay - Marine Drive Route', manager: 'Ajay', area: 'Marine Drive' },
  { name: 'Salman - Walkeshwar Route', manager: 'Salman', area: 'Walkeshwar' },
  { name: 'Vaishali - Altamount Road Route', manager: 'Vaishali', area: 'Altamount Road' },
  { name: 'Satish - Kalbadevi Route', manager: 'Satish', area: 'Kalbadevi' },
  { name: 'Uday - Dhobi Talaw Route', manager: 'Uday', area: 'Dhobi Talaw' },
  { name: 'Pradeep - Mumbai Central Route', manager: 'Pradeep', area: 'Mumbai Central' },
  { name: 'Jeeshan - Madanpura Route', manager: 'Jeeshan', area: 'Madanpura' },
  { name: 'Vikas - Worli Koliwada Route', manager: 'Vikas', area: 'Worli Koliwada' },
  { name: 'Spare 01 - Route', manager: 'Spare', area: 'Spare 01' },
  { name: 'Spare 02 - Route', manager: 'Spare', area: 'Spare 02' },
  { name: 'Spare 03 - Route', manager: 'Spare', area: 'Spare 03' }
];

async function importRealData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cocacola_erp');
    console.log('✓ Connected to MongoDB\n');

    // Define schemas
    const driverSchema = new mongoose.Schema({
      name: String,
      phone: String,
      password: String,
      route: String,
      active: { type: Boolean, default: true },
      role: { type: String, default: 'driver' }
    });

    const wholesalerSchema = new mongoose.Schema({
      businessName: String,
      name: String,
      contactPerson: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      gstNumber: String,
      creditLimit: { type: Number, default: 100000 },
      outstandingBalance: { type: Number, default: 0 },
      active: { type: Boolean, default: true }
    });

    // Use existing Driver model or create new one
    const Driver = mongoose.models.Driver || mongoose.model('Driver', driverSchema);
    const Wholesaler = mongoose.models.Wholesaler || mongoose.model('Wholesaler', wholesalerSchema);

    // Import Drivers
    console.log('📦 Importing Drivers...');
    // Delete only drivers with role 'Driver', preserve Admin accounts
    await Driver.deleteMany({ role: { $ne: 'Admin' } });
    
    const defaultPassword = await bcrypt.hash('driver@123', 10);
    const drivers = await Driver.insertMany(
      driversData.map(d => ({
        name: d.name,
        phone: d.phone,
        password: defaultPassword,
        route: d.route,
        active: true,
        role: 'Driver' // Capitalized as per backend requirement
      }))
    );
    console.log(`✅ Imported ${drivers.length} drivers`);
    console.log('   Default Password: driver@123\n');

    // Show sample drivers
    console.log('Sample Drivers:');
    drivers.slice(0, 5).forEach((d, i) => {
      console.log(`  ${i + 1}. ${d.name} - ${d.phone} (Route: ${d.route})`);
    });
    console.log('');

    // Import Wholesalers
    console.log('📦 Importing Wholesalers...');
    await Wholesaler.deleteMany({}); // Clear existing
    
    const wholesalers = await Wholesaler.insertMany(
      wholesalersData.map(w => ({
        businessName: w.name,
        name: w.contactPerson,
        contactPerson: w.contactPerson,
        phone: w.phone,
        email: `${w.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        address: 'Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        gstNumber: '',
        creditLimit: 100000,
        outstandingBalance: 0,
        active: true
      }))
    );
    console.log(`✅ Imported ${wholesalers.length} wholesalers\n`);

    // Show sample wholesalers
    console.log('Sample Wholesalers:');
    wholesalers.slice(0, 5).forEach((w, i) => {
      console.log(`  ${i + 1}. ${w.name} - ${w.contactPerson} (${w.phone})`);
    });
    console.log('');

    // Store routes info (can be used later)
    console.log('📦 Routes Information:');
    routesData.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name}`);
    });
    console.log('');

    // Ensure Admin account exists with correct password
    console.log('👤 Ensuring Admin account exists...');
    const adminPhone = '9999999999';
    const adminPassword = 'admin123';
    
    // Delete existing admin to recreate with fresh password
    await DriverModel.deleteOne({ phone: adminPhone });
    console.log('   Recreating Admin account...');
    
    const admin = new DriverModel({
      name: 'Admin User',
      phone: adminPhone,
      password: adminPassword, // Will be hashed by pre-save hook
      role: 'Admin',
      route: 'Admin',
      active: true
    });
    await admin.save();
    console.log('   ✅ Admin account created with hashed password\n');

    console.log('═══════════════════════════════════════');
    console.log('✅ ALL REAL DATA IMPORTED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log(`\n📊 Summary:`);
    console.log(`   • ${drivers.length} Drivers`);
    console.log(`   • ${wholesalers.length} Wholesalers`);
    console.log(`   • ${routesData.length} Routes\n`);
    console.log('🔐 Login Credentials:');
    console.log('   Admin: 9999999999 / admin123');
    console.log('   Driver: Any driver phone / driver@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

importRealData();
