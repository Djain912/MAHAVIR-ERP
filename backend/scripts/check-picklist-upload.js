import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import PickListExtracted from '../src/models/PickListExtracted.js';
import StockIn from '../src/models/StockIn.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkPickListUpload() {
  try {
    console.log('🔍 Checking Pick List Upload Status\n');
    console.log('=' .repeat(60));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check latest pick list
    console.log('📋 CHECKING PICK LISTS...\n');
    const pickLists = await PickListExtracted.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    console.log(`Total pick lists: ${await PickListExtracted.countDocuments()}\n`);
    
    if (pickLists.length === 0) {
      console.log('❌ No pick lists found in database!');
      console.log('\nPossible reasons:');
      console.log('1. PDF extraction failed');
      console.log('2. Python script error');
      console.log('3. Database connection issue');
      console.log('4. Data not saved after extraction\n');
    } else {
      console.log('Recent Pick Lists:\n');
      pickLists.forEach((pl, index) => {
        console.log(`${index + 1}. Pick List: ${pl.pickListNumber || 'UNDEFINED'}`);
        console.log(`   Vehicle: ${pl.vehicleNumber || 'UNDEFINED'}`);
        console.log(`   Date: ${pl.loadOutDate || 'UNDEFINED'}`);
        console.log(`   Items: ${pl.items?.length || 0}`);
        console.log(`   Stock Reduced: ${pl.stockReduced ? 'Yes' : 'No'}`);
        console.log(`   Created: ${pl.createdAt}`);
        console.log('');
      });
      
      // Show latest pick list details
      const latest = pickLists[0];
      console.log('=' .repeat(60));
      console.log('📄 LATEST PICK LIST DETAILS:\n');
      console.log(`Pick List Number: ${latest.pickListNumber || '❌ UNDEFINED'}`);
      console.log(`Vehicle Number: ${latest.vehicleNumber || '❌ UNDEFINED'}`);
      console.log(`Load Out Date: ${latest.loadOutDate || '❌ UNDEFINED'}`);
      console.log(`Total Items: ${latest.items?.length || 0}`);
      console.log(`Total LO Qty: ${latest.totalLoQty || 0}`);
      console.log(`Total Sell Qty: ${latest.totalSellQty || 0}`);
      console.log(`Stock Reduced: ${latest.stockReduced ? '✅ Yes' : '❌ No'}`);
      console.log(`Stock Reduction Error: ${latest.stockReductionError || 'None'}`);
      console.log('');
      
      if (latest.items && latest.items.length > 0) {
        console.log('Sample Items (first 5):\n');
        latest.items.slice(0, 5).forEach((item, idx) => {
          console.log(`${idx + 1}. ${item.itemName || item.itemCode || 'Unknown'}`);
          console.log(`   Code: ${item.itemCode || 'N/A'}`);
          console.log(`   LO Qty: ${item.loQty || 0}`);
          console.log(`   Sell Qty: ${item.sellQty || 0}`);
          console.log('');
        });
      }
    }

    // Check stock changes
    console.log('=' .repeat(60));
    console.log('📦 CHECKING STOCK CHANGES...\n');
    
    const recentStock = await StockIn.find()
      .populate('productId', 'brandFullName code')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
    
    console.log('Recent Stock Updates (last 10):\n');
    recentStock.forEach((stock, idx) => {
      console.log(`${idx + 1}. ${stock.productId?.brandFullName || 'Unknown'}`);
      console.log(`   Code: ${stock.productId?.code || 'N/A'}`);
      console.log(`   Batch: ${stock.batchNo}`);
      console.log(`   Quantity: ${stock.quantity}`);
      console.log(`   Remaining: ${stock.remainingQuantity}`);
      console.log(`   Updated: ${stock.updatedAt}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('=' .repeat(60));
    console.log('✅ Check complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPickListUpload();
