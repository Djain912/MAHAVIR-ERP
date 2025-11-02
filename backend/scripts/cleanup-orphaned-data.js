import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import StockIn from '../src/models/StockIn.js';
import DriverDispatch from '../src/models/DriverDispatch.js';
import DriverDispatchItem from '../src/models/DriverDispatchItem.js';
import Product from '../src/models/Product.js';
import Driver from '../src/models/Driver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function cleanupOrphanedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('🧹 Starting cleanup of orphaned records...\n');
    console.log('⚠️  This will NOT delete: Products, Drivers, Admin users, Retailers, Wholesalers\n');
    console.log('✂️  This WILL delete: Stock records and Dispatch records with invalid references\n');

    // Get all valid product IDs
    const productIds = (await Product.find().select('_id').lean()).map(p => p._id.toString());
    console.log(`📦 Found ${productIds.length} valid products`);

    // Get all valid driver IDs
    const driverIds = (await Driver.find().select('_id').lean()).map(d => d._id.toString());
    console.log(`🚚 Found ${driverIds.length} valid drivers\n`);

    // === CLEANUP ORPHANED STOCK RECORDS ===
    console.log('=== CLEANING UP STOCK RECORDS ===');
    const allStock = await StockIn.find().lean();
    console.log(`Total stock records: ${allStock.length}`);
    
    const orphanedStockIds = allStock
      .filter(s => !productIds.includes(s.productId.toString()))
      .map(s => s._id);
    
    console.log(`Found ${orphanedStockIds.length} orphaned stock records`);
    
    if (orphanedStockIds.length > 0) {
      const stockDeleteResult = await StockIn.deleteMany({ _id: { $in: orphanedStockIds } });
      console.log(`✅ Deleted ${stockDeleteResult.deletedCount} orphaned stock records\n`);
    } else {
      console.log('✅ No orphaned stock records to delete\n');
    }

    // === CLEANUP ORPHANED DISPATCH RECORDS ===
    console.log('=== CLEANING UP DISPATCH RECORDS ===');
    const allDispatches = await DriverDispatch.find().lean();
    console.log(`Total dispatch records: ${allDispatches.length}`);
    
    const orphanedDispatchIds = allDispatches
      .filter(d => !driverIds.includes(d.driverId.toString()))
      .map(d => d._id);
    
    console.log(`Found ${orphanedDispatchIds.length} orphaned dispatch records`);
    
    if (orphanedDispatchIds.length > 0) {
      // Also delete related dispatch items
      const dispatchItemsDeleteResult = await DriverDispatchItem.deleteMany({ 
        dispatchId: { $in: orphanedDispatchIds } 
      });
      console.log(`✅ Deleted ${dispatchItemsDeleteResult.deletedCount} related dispatch items`);
      
      const dispatchDeleteResult = await DriverDispatch.deleteMany({ 
        _id: { $in: orphanedDispatchIds } 
      });
      console.log(`✅ Deleted ${dispatchDeleteResult.deletedCount} orphaned dispatch records\n`);
    } else {
      console.log('✅ No orphaned dispatch records to delete\n');
    }

    // === VERIFY CLEANUP ===
    console.log('=== VERIFICATION ===');
    const remainingStock = await StockIn.countDocuments();
    const remainingDispatches = await DriverDispatch.countDocuments();
    console.log(`Remaining stock records: ${remainingStock}`);
    console.log(`Remaining dispatch records: ${remainingDispatches}`);

    // Test populate on remaining records
    console.log('\n=== TESTING POPULATE ON REMAINING DATA ===');
    const testStock = await StockIn.findOne().populate('productId', 'brandFullName').lean();
    if (testStock) {
      console.log(`✅ Stock populate test: ${testStock.productId ? testStock.productId.brandFullName : 'NULL'}`);
    } else {
      console.log('⚠️  No stock records remaining');
    }

    const testDispatch = await DriverDispatch.findOne().populate('driverId', 'name').lean();
    if (testDispatch) {
      console.log(`✅ Dispatch populate test: ${testDispatch.driverId ? testDispatch.driverId.name : 'NULL'}`);
    } else {
      console.log('⚠️  No dispatch records remaining');
    }

    await mongoose.connection.close();
    console.log('\n✅ Cleanup complete! Database is now clean.');
    console.log('💡 You can now add fresh stock and dispatch data.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupOrphanedData();
