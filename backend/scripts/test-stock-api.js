import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import StockIn from '../src/models/StockIn.js';
import Product from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testStockAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('=== TESTING STOCK API RESPONSE ===\n');

    // Simulate what the getAllStockIn service does
    const stockRecords = await StockIn.find()
      .populate('productId', 'name size pricePerUnit category brandFullName')
      .sort({ dateReceived: -1 })
      .lean();

    console.log(`Total stock records: ${stockRecords.length}\n`);

    // Transform like the service does
    const transformedRecords = stockRecords.map(record => {
      const obj = { ...record };
      obj.product = obj.productId;
      return obj;
    });

    // Display what frontend will receive
    transformedRecords.forEach((stock, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  _id: ${stock._id}`);
      console.log(`  productId: ${JSON.stringify(stock.productId)}`);
      console.log(`  product: ${JSON.stringify(stock.product)}`);
      console.log(`  batchNo: ${stock.batchNo}`);
      console.log(`  quantity: ${stock.quantity}`);
      console.log(`  remainingQuantity: ${stock.remainingQuantity}`);
      console.log(`  Frontend will show: ${stock.product?.brandFullName || stock.product?.name || stock.productId?.brandFullName || stock.productId?.name || 'Unknown Product'}`);
      console.log('');
    });

    // Also check if there are any products
    const productCount = await Product.countDocuments();
    console.log(`Total products in database: ${productCount}`);

    await mongoose.connection.close();
    console.log('✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testStockAPI();
