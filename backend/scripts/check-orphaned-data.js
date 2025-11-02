import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import StockIn from '../src/models/StockIn.js';
import DriverDispatch from '../src/models/DriverDispatch.js';
import Product from '../src/models/Product.js';
import Driver from '../src/models/Driver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkOrphanedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all product IDs
    const productIds = (await Product.find().select('_id').lean()).map(p => p._id.toString());
    console.log(`Total valid products: ${productIds.length}`);

    // Get all driver IDs
    const driverIds = (await Driver.find().select('_id').lean()).map(d => d._id.toString());
    console.log(`Total valid drivers: ${driverIds.length}\n`);

    // Check orphaned stock records
    console.log('=== CHECKING ORPHANED STOCK RECORDS ===');
    const allStock = await StockIn.find().lean();
    console.log(`Total stock records: ${allStock.length}`);
    
    const orphanedStock = allStock.filter(s => !productIds.includes(s.productId.toString()));
    console.log(`Orphaned stock records (invalid productId): ${orphanedStock.length}`);
    
    if (orphanedStock.length > 0) {
      console.log('\nSample orphaned stock records:');
      orphanedStock.slice(0, 5).forEach(s => {
        console.log(`  - ID: ${s._id}, productId: ${s.productId}, batch: ${s.batchNo}, qty: ${s.remainingQuantity}`);
      });
    }

    // Check orphaned dispatch records
    console.log('\n=== CHECKING ORPHANED DISPATCH RECORDS ===');
    const allDispatches = await DriverDispatch.find().lean();
    console.log(`Total dispatch records: ${allDispatches.length}`);
    
    const orphanedDispatches = allDispatches.filter(d => !driverIds.includes(d.driverId.toString()));
    console.log(`Orphaned dispatch records (invalid driverId): ${orphanedDispatches.length}`);
    
    if (orphanedDispatches.length > 0) {
      console.log('\nSample orphaned dispatch records:');
      orphanedDispatches.slice(0, 5).forEach(d => {
        console.log(`  - ID: ${d._id}, driverId: ${d.driverId}, date: ${d.date}, status: ${d.status}`);
      });
    }

    // Solution recommendation
    console.log('\n=== RECOMMENDED SOLUTIONS ===');
    if (orphanedStock.length > 0) {
      console.log(`\n1. STOCK RECORDS:`);
      console.log(`   - ${orphanedStock.length} stock records have invalid productId`);
      console.log(`   - Option A: Delete orphaned records`);
      console.log(`   - Option B: Keep them for historical data (frontend will show 'Unknown Product')`);
    }
    
    if (orphanedDispatches.length > 0) {
      console.log(`\n2. DISPATCH RECORDS:`);
      console.log(`   - ${orphanedDispatches.length} dispatch records have invalid driverId`);
      console.log(`   - Option A: Delete orphaned records`);
      console.log(`   - Option B: Keep them for historical data (frontend will show 'Unknown Driver')`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Analysis complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkOrphanedData();
