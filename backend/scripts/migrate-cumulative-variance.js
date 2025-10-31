import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CashCollection from '../src/models/CashCollection.js';

dotenv.config();

const migrateCumulativeVariance = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all drivers who have collections
    const driverIds = await CashCollection.distinct('driverId');
    console.log(`📊 Found ${driverIds.length} drivers with collections\n`);

    for (const driverId of driverIds) {
      console.log(`\n👤 Processing driver: ${driverId}`);
      
      // Get all collections for this driver, sorted by date (oldest first)
      const collections = await CashCollection.find({ driverId })
        .sort({ collectionDate: 1, createdAt: 1 });

      console.log(`   Found ${collections.length} collections`);

      let runningVariance = 0;

      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        
        // Calculate total received (if not set)
        const totalReceived = 
          (collection.totalCashCollected || 0) + 
          (collection.totalChequeReceived || 0) + 
          (collection.totalOnlineReceived || 0);

        // Calculate daily variance
        const dailyVariance = 
          (totalReceived + (collection.totalCreditGiven || 0)) - 
          (collection.expectedCash || 0);

        // Set previous variance and calculate cumulative
        collection.previousVariance = runningVariance;
        collection.variance = dailyVariance;
        collection.cumulativeVariance = runningVariance + dailyVariance;
        collection.totalReceived = totalReceived;

        // Update the running total for next iteration
        runningVariance = collection.cumulativeVariance;

        // Save without triggering pre-save hook
        await CashCollection.updateOne(
          { _id: collection._id },
          {
            $set: {
              previousVariance: collection.previousVariance,
              variance: collection.variance,
              cumulativeVariance: collection.cumulativeVariance,
              totalReceived: collection.totalReceived
            }
          }
        );

        console.log(`   ✅ Collection ${i + 1}:`);
        console.log(`      Date: ${collection.collectionDate.toISOString().split('T')[0]}`);
        console.log(`      Daily Variance: ₹${dailyVariance}`);
        console.log(`      Cumulative Variance: ₹${collection.cumulativeVariance}`);
      }

      console.log(`\n   🎯 Final cumulative variance for driver: ₹${runningVariance}`);
    }

    console.log('\n\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Processed ${driverIds.length} drivers`);
    const totalCollections = await CashCollection.countDocuments();
    console.log(`   - Updated ${totalCollections} collections`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run migration
migrateCumulativeVariance()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
