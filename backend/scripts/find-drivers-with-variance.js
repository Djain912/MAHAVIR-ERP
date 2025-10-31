import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Driver from '../src/models/Driver.js';
import CashCollection from '../src/models/CashCollection.js';

dotenv.config();

const findDriversWithVariance = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Find drivers who have collections with non-zero cumulative variance
    const collections = await CashCollection.find({ cumulativeVariance: { $ne: 0 } })
      .sort({ collectionDate: -1 })
      .populate('driverId', 'name phone')
      .limit(5);

    console.log('📊 Drivers with non-zero cumulative variance:\n');

    for (const collection of collections) {
      if (collection.driverId) {
        console.log(`Driver: ${collection.driverId.name}`);
        console.log(`  Phone: ${collection.driverId.phone}`);
        console.log(`  Driver ID: ${collection.driverId._id}`);
        console.log(`  Cumulative Variance: ₹${collection.cumulativeVariance}`);
        console.log(`  Collection Date: ${collection.collectionDate.toISOString().split('T')[0]}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
};

findDriversWithVariance();
