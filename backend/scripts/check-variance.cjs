const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp';

async function checkVariance() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const CashCollection = mongoose.model('CashCollection', new mongoose.Schema({}, { strict: false }));
    
    // Get all cash collections
    const collections = await CashCollection.find()
      .sort({ collectionDate: -1, createdAt: -1 })
      .limit(5);

    console.log('📊 Recent Cash Collections:\n');
    
    collections.forEach((col, index) => {
      console.log(`\n--- Collection ${index + 1} ---`);
      console.log(`ID: ${col._id}`);
      console.log(`Driver ID: ${col.driverId}`);
      console.log(`Collection Date: ${col.collectionDate}`);
      console.log(`Expected Cash: ₹${col.expectedCash}`);
      console.log(`Total Received: ₹${col.totalReceived}`);
      console.log(`Total Credit Given: ₹${col.totalCreditGiven || 0}`);
      console.log(`Variance (field): ₹${col.variance}`);
      console.log(`Previous Variance: ₹${col.previousVariance || 0}`);
      console.log(`Cumulative Variance: ₹${col.cumulativeVariance || 0}`);
      
      // Manual calculation
      const calculatedVariance = (col.totalReceived + (col.totalCreditGiven || 0)) - col.expectedCash;
      console.log(`\n🧮 Manual Calculation:`);
      console.log(`Total Received (${col.totalReceived}) + Credit Given (${col.totalCreditGiven || 0}) - Expected (${col.expectedCash})`);
      console.log(`= ${calculatedVariance}`);
      
      if (col.variance !== calculatedVariance) {
        console.log(`⚠️  MISMATCH! Stored variance (${col.variance}) differs from calculated (${calculatedVariance})`);
      }
      
      console.log('\nDenominations:', JSON.stringify(col.denominations, null, 2));
      if (col.coins !== undefined) {
        console.log(`Coins: ₹${col.coins}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
}

checkVariance();
