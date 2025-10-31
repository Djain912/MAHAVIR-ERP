import mongoose from 'mongoose';
import CashCollection from '../src/models/CashCollection.js';

mongoose.connect('mongodb+srv://Djain912:Dj12345@mahavir.4k8qs.mongodb.net/cocacola_erp?retryWrites=true&w=majority&appName=mahavir')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const count = await CashCollection.countDocuments();
    console.log(`Total collections: ${count}`);
    
    if (count > 0) {
      const collections = await CashCollection.find()
        .populate('driverId', 'name phone')
        .sort({ collectionDate: -1 })
        .limit(5);
      
      console.log('\nRecent collections:');
      collections.forEach(c => {
        console.log(`- Driver: ${c.driverId?.name}, Date: ${c.collectionDate}, Expected: ${c.expectedCash}, Received: ${c.totalReceived}, Variance: ${c.variance}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
