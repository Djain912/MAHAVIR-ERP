import mongoose from 'mongoose';
import CashCollection from '../src/models/CashCollection.js';
import Driver from '../src/models/Driver.js';

mongoose.connect('mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    console.log('⚠️  WARNING: This will delete all cash collections with invalid driver references!\n');
    
    // Get all valid driver IDs
    const validDrivers = await Driver.find().select('_id');
    const validDriverIds = validDrivers.map(d => d._id.toString());
    
    console.log(`Found ${validDriverIds.length} valid drivers in database`);
    
    // Get all collections
    const allCollections = await CashCollection.find().lean();
    console.log(`Found ${allCollections.length} total collections`);
    
    // Find orphaned collections
    const orphanedCollections = allCollections.filter(c => {
      return c.driverId && !validDriverIds.includes(c.driverId.toString());
    });
    
    console.log(`Found ${orphanedCollections.length} orphaned collections (with invalid driver references)`);
    
    if (orphanedCollections.length > 0) {
      console.log('\nDeleting orphaned collections...');
      const orphanedIds = orphanedCollections.map(c => c._id);
      const result = await CashCollection.deleteMany({ _id: { $in: orphanedIds } });
      console.log(`✅ Deleted ${result.deletedCount} orphaned collections`);
    } else {
      console.log('\n✅ No orphaned collections found. All collections have valid driver references.');
    }
    
    const remainingCollections = await CashCollection.countDocuments();
    console.log(`\nRemaining collections: ${remainingCollections}`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
