import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function dropIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cocacola_erp');
    console.log('✓ Connected to MongoDB');

    const collection = mongoose.connection.collection('products');
    
    // Drop all indexes except _id
    await collection.dropIndexes();
    console.log('✓ Dropped all indexes');

    console.log('✅ Done! You can now run the import script.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropIndexes();
