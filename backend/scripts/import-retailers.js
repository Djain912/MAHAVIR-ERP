import mongoose from 'mongoose';
import Retailer from '../src/models/Retailer.js';

const MONGODB_URI = 'mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp';

// Retailer data from the provided table
const retailersData = [
  { srNo: 1, mgrName: 'Prajapati Ji', route: 'Mahalaxmi Route', fullName: 'Prajapati Ji - Mahalaxmi Route' },
  { srNo: 2, mgrName: 'Divakar Ji', route: 'Fort Route', fullName: 'Divakar Ji - Fort Route' },
  { srNo: 3, mgrName: 'Ajay', route: 'Marine Drive Route', fullName: 'Ajay - Marine Drive Route' },
  { srNo: 4, mgrName: 'Salman', route: 'Walkeshwar Route', fullName: 'Salman - Walkeshwar Route' },
  { srNo: 5, mgrName: 'Vaishali', route: 'Altamount Road Route', fullName: 'Vaishali - Altamount Road Route' },
  { srNo: 6, mgrName: 'Satish', route: 'Kalbadevi Route', fullName: 'Satish - Kalbadevi Route' },
  { srNo: 7, mgrName: 'Uday', route: 'Dhobi Talaw Route', fullName: 'Uday - Dhobi Talaw Route' },
  { srNo: 8, mgrName: 'Pradeep', route: 'Mumbai Central Route', fullName: 'Pradeep - Mumbai Central Route' },
  { srNo: 9, mgrName: 'Jeeshan', route: 'Madanpura Route', fullName: 'Jeeshan - Madanpura Route' },
  { srNo: 10, mgrName: 'Vikas', route: 'Worli Koliwada Route', fullName: 'Vikas - Worli Koliwada Route' },
  { srNo: 11, mgrName: 'Spare 01', route: 'Route', fullName: 'Spare 01 - Route' },
  { srNo: 12, mgrName: 'Spare 02', route: 'Route', fullName: 'Spare 02 - Route' },
  { srNo: 13, mgrName: 'Spare 03', route: 'Route', fullName: 'Spare 03 - Route' }
];

async function importRetailers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing retailers
    console.log('🗑️  Clearing existing retailers...');
    const deleteResult = await Retailer.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing retailers\n`);

    // Import new retailers
    console.log('📦 Importing Retailers...');
    
    const retailers = await Retailer.insertMany(
      retailersData.map(r => ({
        businessName: r.fullName,
        name: r.mgrName,
        contactPerson: r.mgrName,
        phone: `91${String(r.srNo).padStart(8, '0')}`, // Generate unique 10-digit phone
        email: `${r.mgrName.toLowerCase().replace(/\s+/g, '')}@retailer.com`,
        address: r.route,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        route: r.route,
        gstNumber: '',
        creditLimit: 50000,
        outstandingBalance: 0,
        active: true
      }))
    );

    console.log(`✅ Imported ${retailers.length} retailers\n`);

    // Show sample retailers
    console.log('Sample Retailers:');
    retailers.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.businessName} - ${r.route} (${r.phone})`);
    });
    console.log('');

    console.log('═══════════════════════════════════════');
    console.log('✅ RETAILERS IMPORTED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total Retailers: ${retailers.length}`);
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importRetailers();
