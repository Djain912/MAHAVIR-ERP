import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cocacola_erp');
    console.log('✓ Connected to MongoDB\n');

    const collection = mongoose.connection.collection('products');
    
    // Get all products
    const products = await collection.find({}).toArray();
    console.log(`Found ${products.length} products to fix\n`);

    let updated = 0;
    for (const product of products) {
      const updateFields = {};
      
      // Set name from brand or brandName
      if (!product.name) {
        updateFields.name = product.brand || product.brandName || 'Unknown';
      }
      
      // Set size from ml or size
      if (!product.size) {
        updateFields.size = product.ml || 'N/A';
      }
      
      // Set pricePerUnit from purchaseRate if not set
      if (!product.pricePerUnit && product.purchaseRate) {
        updateFields.pricePerUnit = product.purchaseRate;
      }
      
      if (Object.keys(updateFields).length > 0) {
        await collection.updateOne(
          { _id: product._id },
          { $set: updateFields }
        );
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} products with required fields`);
    
    // Show sample
    console.log('\n========== Sample Fixed Products ==========\n');
    const samples = await collection.find({}).limit(3).toArray();
    samples.forEach((p, i) => {
      console.log(`${i + 1}. ${p.brandFullName}`);
      console.log(`   name: ${p.name}`);
      console.log(`   size: ${p.size}`);
      console.log(`   pricePerUnit: ₹${p.pricePerUnit}`);
      console.log(`   purchaseRate: ₹${p.purchaseRate}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProducts();
