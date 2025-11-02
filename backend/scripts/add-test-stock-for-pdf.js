import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import StockIn from '../src/models/StockIn.js';
import Product from '../src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function addTestStockForPDF() {
  try {
    console.log('🎯 Adding Test Stock for PDF: PL-22850');
    console.log('=' .repeat(60));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test data for 5 products
    const testStockData = [
      {
        productName: '300ML Can Coca Cola',
        searchPattern: 'Coca Cola',
        productCode: 'KOCC300',
        quantity: 20,
        batchNumber: 'BATCH-TEST-001',
        purchaseRate: 670,
        notes: 'For PDF test - Coca Cola Can 300ML'
      },
      {
        productName: '740ML PET Thums Up',
        searchPattern: 'Thums Up',
        productCode: 'TUP740',
        quantity: 25,
        batchNumber: 'BATCH-TEST-002',
        purchaseRate: 720,
        notes: 'For PDF test - Thumbs Up PET 740ML'
      },
      {
        productName: '1000ML Kinley Water',
        searchPattern: 'Kinley',
        productCode: 'KNW',
        quantity: 150,
        batchNumber: 'BATCH-TEST-003',
        purchaseRate: 200,
        notes: 'For PDF test - Kinley Water 1L'
      },
      {
        productName: '200ML RGB Thums Up',
        searchPattern: '200ML RGB',
        productCode: 'TUP200',
        quantity: 30,
        batchNumber: 'BATCH-TEST-004',
        purchaseRate: 150,
        notes: 'For PDF test - Thumbs Up RGB 200ML'
      },
      {
        productName: '300ML Can Sprite',
        searchPattern: 'Sprite',
        productCode: 'SPRC300',
        quantity: 15,
        batchNumber: 'BATCH-TEST-005',
        purchaseRate: 670,
        notes: 'For PDF test - Sprite Can 300ML'
      }
    ];

    const addedStock = [];
    const errors = [];

    console.log('📦 Adding Stock Records...\n');

    for (const stockData of testStockData) {
      try {
        // Find product by brandFullName or code
        const product = await Product.findOne({
          $or: [
            { brandFullName: { $regex: stockData.searchPattern, $options: 'i' } },
            { code: { $regex: stockData.productCode, $options: 'i' } }
          ]
        });

        if (!product) {
          errors.push({
            product: stockData.productName,
            reason: `Product not found with pattern: ${stockData.searchPattern} or code: ${stockData.productCode}`
          });
          console.log(`❌ ${stockData.productName} - Product not found`);
          continue;
        }

        // Check if batch already exists
        const existingStock = await StockIn.findOne({
          productId: product._id,
          batchNo: stockData.batchNumber
        });

        if (existingStock) {
          console.log(`⚠️  ${stockData.productName} - Batch ${stockData.batchNumber} already exists, skipping`);
          continue;
        }

        // Calculate expiry date (6 months from now)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);

        // Create stock record
        const stockRecord = new StockIn({
          productId: product._id,
          quantity: stockData.quantity,
          batchNo: stockData.batchNumber,
          dateReceived: new Date(),
          expiryDate: expiryDate,
          purchaseRate: stockData.purchaseRate,
          ratePerUnit: stockData.purchaseRate,
          remainingQuantity: stockData.quantity,
          isDamaged: false,
          damagedQuantity: 0
        });

        await stockRecord.save();

        addedStock.push({
          product: product.brandFullName,
          productCode: product.code,
          quantity: stockData.quantity,
          batch: stockData.batchNumber,
          purchaseRate: stockData.purchaseRate,
          totalValue: stockData.quantity * stockData.purchaseRate
        });

        console.log(`✅ ${stockData.productName}`);
        console.log(`   Product: ${product.brandFullName}`);
        console.log(`   Code: ${product.code}`);
        console.log(`   Quantity: ${stockData.quantity} units`);
        console.log(`   Batch: ${stockData.batchNumber}`);
        console.log(`   Purchase Rate: ₹${stockData.purchaseRate}`);
        console.log(`   Total Value: ₹${stockData.quantity * stockData.purchaseRate}`);
        console.log('');

      } catch (error) {
        errors.push({
          product: stockData.productName,
          reason: error.message
        });
        console.log(`❌ ${stockData.productName} - Error: ${error.message}\n`);
      }
    }

    // Summary
    console.log('=' .repeat(60));
    console.log('📊 SUMMARY\n');
    console.log(`Total Stock Records Added: ${addedStock.length}`);
    console.log(`Failed: ${errors.length}\n`);

    if (addedStock.length > 0) {
      console.log('✅ Successfully Added Stock:\n');
      addedStock.forEach((stock, index) => {
        console.log(`${index + 1}. ${stock.product} (${stock.productCode})`);
        console.log(`   Quantity: ${stock.quantity} units`);
        console.log(`   Batch: ${stock.batch}`);
        console.log(`   Total Value: ₹${stock.totalValue}\n`);
      });

      const totalValue = addedStock.reduce((sum, stock) => sum + stock.totalValue, 0);
      console.log(`Total Stock Value: ₹${totalValue.toLocaleString()}\n`);
    }

    if (errors.length > 0) {
      console.log('❌ Failed to Add:\n');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.product}`);
        console.log(`   Reason: ${error.reason}\n`);
      });
    }

    // Verification
    console.log('=' .repeat(60));
    console.log('🔍 VERIFICATION\n');
    
    const totalStockRecords = await StockIn.countDocuments();
    console.log(`Total stock records in database: ${totalStockRecords}`);
    
    console.log('\nRecent stock records:');
    const recentStock = await StockIn.find()
      .populate('productId', 'brandFullName code')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    recentStock.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.productId?.brandFullName || 'Unknown'}`);
      console.log(`   Batch: ${stock.batchNo}`);
      console.log(`   Remaining: ${stock.remainingQuantity} units`);
    });

    await mongoose.connection.close();
    
    console.log('\n✅ Script completed successfully!');
    console.log('=' .repeat(60));
    console.log('\n📖 Next Steps:');
    console.log('   1. Go to Admin Dashboard → Stock Intake → Purchase History');
    console.log('   2. Verify all 5 stock records are visible');
    console.log('   3. Check product names display correctly (not "Unknown")');
    console.log('   4. Proceed with STEP 2: Upload PDF\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestStockForPDF();
