import mongoose from 'mongoose';
import CashCollection from '../src/models/CashCollection.js';
import Driver from '../src/models/Driver.js';

mongoose.connect('mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    const collections = await CashCollection.find()
      .populate('driverId', 'name phone')
      .sort({ collectionDate: -1 })
      .limit(5);
    
    console.log(`Found ${collections.length} collections\n`);
    
    collections.forEach((c, i) => {
      console.log(`Collection ${i + 1}:`);
      console.log(`  Date: ${c.collectionDate}`);
      console.log(`  DriverId field: ${c.driverId}`);
      console.log(`  Driver populated:`, c.driverId ? `${c.driverId.name} (${c.driverId.phone})` : 'NULL/NOT POPULATED');
      console.log(`  Expected: ₹${c.expectedCash}`);
      console.log(`  Received: ₹${c.totalReceived}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
