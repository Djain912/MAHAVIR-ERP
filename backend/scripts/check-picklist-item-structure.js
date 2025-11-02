import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import PickListExtracted from '../src/models/PickListExtracted.js';

async function checkPickListItems() {
  try {
    console.log('\n🔍 Checking Pick List Item Structure...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the latest pick list
    const pickList = await PickListExtracted.findOne({ 
      pickListNumber: '11521003000269' 
    });

    if (!pickList) {
      console.log('❌ Pick list not found');
      await mongoose.disconnect();
      return;
    }

    console.log(`📋 Pick List: ${pickList.pickListNumber}`);
    console.log(`📅 Created: ${pickList.createdAt}`);
    console.log(`📦 Total Items: ${pickList.items.length}\n`);

    console.log('First 5 items structure:\n');
    console.log('='.repeat(120));

    pickList.items.slice(0, 5).forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  Raw item object keys: ${Object.keys(item.toObject ? item.toObject() : item).join(', ')}`);
      console.log(`  itemCode: "${item.itemCode || 'NOT SET'}"`);
      console.log(`  itemName: "${item.itemName || 'NOT SET'}"`);
      console.log(`  productCode: "${item.productCode || 'NOT SET'}"`);
      console.log(`  code: "${item.code || 'NOT SET'}"`);
      console.log(`  loQty: ${item.loQty || 'NOT SET'}`);
      console.log(`  Full item:`, JSON.stringify(item, null, 2));
    });

    console.log('\n' + '='.repeat(120));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkPickListItems();
