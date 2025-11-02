import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import PickListExtracted from '../src/models/PickListExtracted.js';
import Product from '../src/models/Product.js';
import StockIn from '../src/models/StockIn.js';

async function analyzeStockReduction() {
  try {
    console.log('\n🔍 Analyzing Stock Reduction Results...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the latest pick list
    const pickList = await PickListExtracted.findOne({ 
      pickListNumber: '11521003000269' 
    }).sort({ createdAt: -1 });

    if (!pickList) {
      console.log('❌ Pick list not found');
      await mongoose.disconnect();
      return;
    }

    console.log(`📋 Pick List: ${pickList.pickListNumber}`);
    console.log(`📅 Created: ${pickList.createdAt}`);
    console.log(`📦 Total Items: ${pickList.items.length}`);
    console.log(`✅ Stock Reduced: ${pickList.stockReduced ? 'Yes' : 'No'}`);
    console.log(`⚠️  Error: ${pickList.stockReductionError || 'None'}\n`);

    console.log('='.repeat(120));
    console.log('\n📊 Checking Each Item:\n');

    let successCount = 0;
    let failCount = 0;
    const failedItems = [];

    for (const item of pickList.items) {
      const actualCode = item.itemName || item.itemCode.split('.').pop();
      
      // Find product
      const product = await Product.findOne({ code: actualCode });
      
      if (!product) {
        failCount++;
        failedItems.push({
          code: actualCode,
          name: item.itemName,
          required: item.loQty,
          reason: 'Product not found'
        });
        console.log(`❌ ${actualCode.padEnd(15)} - Product not found in database`);
        continue;
      }

      // Find stock
      const stockBatches = await StockIn.find({
        productId: product._id,
        remainingQuantity: { $gt: 0 }
      }).sort({ dateReceived: 1 });

      const available = stockBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
      
      if (available < item.loQty) {
        failCount++;
        failedItems.push({
          code: actualCode,
          name: product.brandFullName,
          required: item.loQty,
          available: available,
          shortage: item.loQty - available,
          reason: 'Insufficient stock'
        });
        console.log(`⚠️  ${actualCode.padEnd(15)} - Need: ${item.loQty}, Available: ${available}, SHORT: ${item.loQty - available}`);
      } else {
        successCount++;
        console.log(`✅ ${actualCode.padEnd(15)} - Need: ${item.loQty}, Available: ${available} (${product.brandFullName.substring(0, 40)})`);
      }
    }

    console.log('\n' + '='.repeat(120));
    console.log('\n📊 SUMMARY:\n');
    console.log(`✅ Succeeded: ${successCount}/${pickList.items.length}`);
    console.log(`⚠️  Failed: ${failCount}/${pickList.items.length}`);
    console.log(`📈 Success Rate: ${((successCount / pickList.items.length) * 100).toFixed(1)}%\n`);

    if (failedItems.length > 0) {
      console.log('❌ FAILED ITEMS:\n');
      console.log('─'.repeat(120));
      failedItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.code} - ${item.name || 'Unknown Product'}`);
        console.log(`   Required: ${item.required} units`);
        if (item.reason === 'Product not found') {
          console.log(`   Reason: Product not found in database`);
        } else {
          console.log(`   Available: ${item.available} units`);
          console.log(`   Shortage: ${item.shortage} units`);
        }
        console.log('');
      });
    }

    // Check current stock levels
    console.log('\n📦 CURRENT STOCK LEVELS:\n');
    console.log('─'.repeat(120));
    
    const allStock = await StockIn.find({ remainingQuantity: { $gt: 0 } })
      .populate('productId')
      .sort({ remainingQuantity: 1 });

    allStock.forEach(stock => {
      const product = stock.productId;
      if (product) {
        const status = stock.remainingQuantity < 10 ? '🔴 Critical' : 
                      stock.remainingQuantity < 20 ? '🟡 Low' : '🟢 OK';
        console.log(`${status} ${(product.code || 'NO CODE').padEnd(15)} - ${stock.remainingQuantity.toString().padStart(3)} units - ${product.brandFullName}`);
      }
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

analyzeStockReduction();
