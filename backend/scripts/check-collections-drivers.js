import mongoose from 'mongoose';
import CashCollection from '../src/models/CashCollection.js';
import Driver from '../src/models/Driver.js';

mongoose.connect('mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    const totalCollections = await CashCollection.countDocuments();
    console.log(`Total collections: ${totalCollections}`);
    
    const collectionsWithNullDriver = await CashCollection.countDocuments({ driverId: null });
    console.log(`Collections with null driverId: ${collectionsWithNullDriver}`);
    
    const collectionsWithDriver = await CashCollection.countDocuments({ driverId: { $ne: null } });
    console.log(`Collections with valid driverId: ${collectionsWithDriver}\n`);
    
    const totalDrivers = await Driver.countDocuments();
    console.log(`Total drivers in database: ${totalDrivers}`);
    
    if (totalDrivers > 0) {
      const drivers = await Driver.find().select('name phone').limit(5);
      console.log('\nFirst 5 drivers:');
      drivers.forEach(d => console.log(`- ${d.name} (${d.phone}) - ID: ${d._id}`));
    }
    
    if (collectionsWithNullDriver > 0) {
      console.log(`\n⚠️  WARNING: ${collectionsWithNullDriver} collections have null driverId!`);
      console.log('These collections were created with driver IDs that no longer exist.');
      console.log('Options:');
      console.log('1. Delete these orphaned collections');
      console.log('2. Create new test collections with valid drivers');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
