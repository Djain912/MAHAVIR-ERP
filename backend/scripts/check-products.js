import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cocacola_erp');
    console.log('✓ Connected to MongoDB\n');

    const collection = mongoose.connection.collection('products');
    const count = await collection.countDocuments();
    console.log(`Total products in database: ${count}\n`);

    if (count > 0) {
      console.log('First 5 products:');
      console.log('==================\n');
      const products = await collection.find().limit(5).toArray();
      products.forEach((p, i) => {
        console.log(`${i + 1}. ${p.brandFullName || p.name}`);
        console.log(`   Purchase Rate: ₹${p.purchaseRate || p.pricePerUnit}`);
        console.log(`   Brand: ${p.brand || p.name}`);
        console.log(`   Type: ${p.type || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No products found in database!');
      console.log('Run: node scripts/import-products-from-excel.js');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProducts();
