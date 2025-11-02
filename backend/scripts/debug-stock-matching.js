import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Product from '../src/models/Product.js';
import StockIn from '../src/models/StockIn.js';

async function debugStockMatching() {
  try {
    console.log('\n🔍 Debugging Stock Matching...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // PDF item codes to check
    const pdfCodes = [
      'DKO300', 'KOCC300', 'COKEZERO', 'SPRC300', 'TUPC300',
      'TUP740', 'SPR740', 'TU25028', 'SP25028', 'KNW115NF'
    ];

    console.log('Testing stock matching for first 10 PDF items:\n');
    console.log('='.repeat(100));

    for (const itemCode of pdfCodes) {
      console.log(`\n🔍 Item Code: ${itemCode}`);
      
      // Step 1: Find product by code (what the service does)
      const product = await Product.findOne({ code: itemCode });
      
      if (!product) {
        console.log(`   ❌ Product NOT found in database`);
        
        // Try to find it differently
        const productWithSlash = await Product.findOne({ code: { $regex: itemCode, $options: 'i' } });
        if (productWithSlash) {
          console.log(`   ⚠️  Found with regex: ${productWithSlash.code} - ${productWithSlash.brandFullName}`);
        }
        continue;
      }
      
      console.log(`   ✅ Product found: ${product.brandFullName}`);
      console.log(`   📝 Product ID: ${product._id}`);
      console.log(`   📝 Product code in DB: "${product.code}"`);
      
      // Step 2: Find stock for this product
      const stockBatches = await StockIn.find({
        productId: product._id,
        remainingQuantity: { $gt: 0 }
      }).sort({ dateReceived: 1 });
      
      if (stockBatches.length === 0) {
        console.log(`   ❌ NO STOCK found for this product`);
      } else {
        const totalStock = stockBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
        console.log(`   ✅ Stock found: ${totalStock} units in ${stockBatches.length} batch(es)`);
        stockBatches.forEach((batch, idx) => {
          console.log(`      Batch ${idx + 1}: ${batch.remainingQuantity} units (Batch: ${batch.batchNo})`);
        });
      }
    }

    console.log('\n' + '='.repeat(100));
    console.log('\n📊 Summary Check:\n');

    // Count products with codes
    const productsWithCodes = await Product.countDocuments({ code: { $exists: true, $ne: null, $ne: '' } });
    console.log(`Products with codes: ${productsWithCodes}`);

    // Count stock records
    const totalStock = await StockIn.countDocuments();
    const stockWithRemaining = await StockIn.countDocuments({ remainingQuantity: { $gt: 0 } });
    console.log(`Total stock records: ${totalStock}`);
    console.log(`Stock with remaining qty > 0: ${stockWithRemaining}`);

    // Check if stock has productId references
    const stockSample = await StockIn.findOne().populate('productId');
    if (stockSample) {
      console.log(`\nSample stock record:`);
      console.log(`  Product ID: ${stockSample.productId?._id}`);
      console.log(`  Product: ${stockSample.productId?.brandFullName || 'NOT POPULATED'}`);
      console.log(`  Remaining: ${stockSample.remainingQuantity}`);
      console.log(`  Batch: ${stockSample.batchNo}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugStockMatching();
