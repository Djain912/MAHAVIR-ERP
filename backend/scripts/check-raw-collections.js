import mongoose from 'mongoose';
import CashCollection from '../src/models/CashCollection.js';

mongoose.connect('mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Get raw data without populate
    const collections = await CashCollection.find().sort({ collectionDate: -1 }).limit(5).lean();
    
    console.log('Raw collection data (without populate):');
    collections.forEach((c, i) => {
      console.log(`\nCollection ${i + 1}:`);
      console.log(`  _id: ${c._id}`);
      console.log(`  driverId (raw): ${c.driverId}`);
      console.log(`  dispatchId: ${c.dispatchId}`);
      console.log(`  Date: ${c.collectionDate}`);
    });
    
    // Count collections with actual null
    const nullCount = await CashCollection.countDocuments({ driverId: null });
    const notNullCount = await CashCollection.countDocuments({ driverId: { $ne: null } });
    
    console.log(`\n\nTotal with null driverId: ${nullCount}`);
    console.log(`Total with non-null driverId: ${notNullCount}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
