/**
 * Drop Old Attendance Index
 * Removes the old unique index to allow multiple shifts per day
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function dropOldIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const attendanceCollection = db.collection('attendances');

    // Get existing indexes
    const indexes = await attendanceCollection.indexes();
    console.log('📋 Current Indexes:');
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });
    console.log('');

    // Drop the old index
    try {
      await attendanceCollection.dropIndex('employeeId_1_date_1');
      console.log('✅ Dropped old index: employeeId_1_date_1\n');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('ℹ️  Index already dropped or doesn\'t exist\n');
      } else {
        throw error;
      }
    }

    // Show new indexes
    const newIndexes = await attendanceCollection.indexes();
    console.log('📋 Remaining Indexes:');
    newIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.unique ? '(unique)' : '');
    });
    console.log('');

    console.log('✅ Ready for seeding with multi-shift support!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

dropOldIndex();
