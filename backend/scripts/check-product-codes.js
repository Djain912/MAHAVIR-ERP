import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Product from '../src/models/Product.js';

async function checkProductCodes() {
  try {
    console.log('\n🔍 Checking product codes in database...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find().sort({ brandFullName: 1 });
    
    console.log(`Total products: ${products.length}\n`);
    console.log('Product Codes and Names:');
    console.log('='.repeat(100));
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productCode?.padEnd(15) || 'NO CODE'.padEnd(15)} | ${product.brandFullName}`);
    });

    console.log('\n' + '='.repeat(100));
    
    // Group by brand
    const brands = {};
    products.forEach(product => {
      const brand = product.brand || 'Unknown';
      if (!brands[brand]) brands[brand] = [];
      brands[brand].push(product);
    });

    console.log('\n📊 Products by Brand:\n');
    Object.keys(brands).sort().forEach(brand => {
      console.log(`\n${brand} (${brands[brand].length} products):`);
      brands[brand].forEach(product => {
        console.log(`  - ${product.productCode || 'NO CODE'}: ${product.brandFullName}`);
      });
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkProductCodes();
