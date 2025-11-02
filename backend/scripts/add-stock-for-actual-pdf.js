import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
import Product from '../src/models/Product.js';
import StockIn from '../src/models/StockIn.js';

async function addStockForActualPDF() {
  try {
    console.log('\n🔍 Adding stock for actual PDF products...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Products that appear in the PDF with their required quantities
    // Adding 2x the required quantity to ensure sufficient stock
    const productsToStock = [
      // Can 300 - 24 (need: 7, 7, 4, 4, 10, 2, 3, 2)
      { codes: ['DKO300'], qty: 20, category: 'Can 300' },
      { codes: ['KOCC300'], qty: 20, category: 'Can 300' },
      { codes: ['COKEZERO', 'COKZERO'], qty: 10, category: 'Can 300' },
      { codes: ['SPRC300'], qty: 10, category: 'Can 300' },
      { codes: ['TUPC300'], qty: 25, category: 'Can 300' },
      { codes: ['SGAC300'], qty: 10, category: 'Can 300' },
      { codes: ['STW300'], qty: 10, category: 'Can 300' },
      { codes: ['PRE300'], qty: 10, category: 'Can 300' },
      
      // PET 0 - 24 (need: 13, 7, 1, 1)
      { codes: ['TUP740', 'TU740'], qty: 30, category: 'PET' },
      { codes: ['SPR740', 'SP740'], qty: 20, category: 'PET' },
      { codes: ['FNO740', 'FN740'], qty: 10, category: 'PET' },
      { codes: ['LIM740', 'LI740'], qty: 10, category: 'PET' },
      
      // 250 - 28 (need: 18, 3, 5, 30, 2)
      { codes: ['SP25028', 'SPR25028'], qty: 40, category: '250ml' },
      { codes: ['CTU25028', 'TUC25028'], qty: 10, category: '250ml' },
      { codes: ['FO25028', 'FON25028'], qty: 15, category: '250ml' },
      { codes: ['TU25028', 'TUP25028'], qty: 70, category: '250ml' },
      { codes: ['RZFIZ250', 'RZF250'], qty: 10, category: '250ml' },
      
      // 250 - 30 (need: 4)
      { codes: ['MM250_3', 'MM250', 'MZM250'], qty: 10, category: '250ml' },
      
      // 500 - 24 (need: 12)
      { codes: ['KNW500NF', 'KNW500', 'KIN500'], qty: 30, category: '500ml' },
      
      // 600 - 24 (need: 5)
      { codes: ['MZM600', 'MAZ600'], qty: 15, category: '600ml' },
      
      // 1000 - 15 (need: 100, 1, 1)
      { codes: ['KNW115NF', 'KNW1LNF', 'KIN1L'], qty: 220, category: '1L' },
      { codes: ['TU100015', 'TUP1L', 'TU1L'], qty: 10, category: '1L' },
      { codes: ['SP100015', 'SPR1L', 'SP1L'], qty: 10, category: '1L' },
      
      // 2250 - 9 (need: 2, 2, 1)
      { codes: ['SP2.25', 'SPR2.25'], qty: 10, category: '2.25L' },
      { codes: ['TU2.25', 'TUP2.25'], qty: 10, category: '2.25L' },
      { codes: ['FO2.25', 'FON2.25'], qty: 10, category: '2.25L' },
      
      // RGB 200 - 24 (need: 5, 6, 10, 15)
      { codes: ['LIM200'], qty: 15, category: 'RGB 200ml' },
      { codes: ['FNO200'], qty: 20, category: 'RGB 200ml' },
      { codes: ['SPR200'], qty: 35, category: 'RGB 200ml' },
      { codes: ['TUP200'], qty: 35, category: 'RGB 200ml' },
      
      // RGB 300 - 24 (need: 16)
      { codes: ['TUP300'], qty: 35, category: 'RGB 300ml' },
      
      // Tetra 0 - 40 (need: 5)
      { codes: ['MZRT135', 'MZ RT135', 'MAAZA135'], qty: 15, category: 'Tetra' }
    ];

    let addedCount = 0;
    let skippedCount = 0;
    let totalValue = 0;
    const addedStock = [];

    for (const item of productsToStock) {
      // Try to find product by any of the codes
      let product = null;
      for (const code of item.codes) {
        product = await Product.findOne({ 
          $or: [
            { code: { $regex: new RegExp(code, 'i') } },
            { brandFullName: { $regex: new RegExp(code, 'i') } }
          ]
        });
        if (product) break;
      }

      if (!product) {
        console.log(`⚠️  Product not found for codes: ${item.codes.join(', ')} (${item.category})`);
        skippedCount++;
        continue;
      }

      // Check if we already have sufficient stock for this product
      const existingStock = await StockIn.find({ 
        productId: product._id,
        remainingQuantity: { $gt: 0 }
      });
      
      const totalExistingQty = existingStock.reduce((sum, stock) => sum + stock.remainingQuantity, 0);
      
      if (totalExistingQty >= item.qty) {
        console.log(`✓ ${product.brandFullName} (${product.productCode}) - Already has ${totalExistingQty} units (need ${item.qty})`);
        continue;
      }

      // Add stock
      const qtyToAdd = item.qty - totalExistingQty;
      const batchNo = `BATCH-PDF-${Date.now()}-${addedCount + 1}`;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);

      const stockIn = new StockIn({
        productId: product._id,
        quantity: qtyToAdd,
        remainingQuantity: qtyToAdd,
        purchaseRate: product.purchaseRate || product.pricePerUnit || 50,
        batchNo,
        expiryDate,
        dateReceived: new Date()
      });

      await stockIn.save();
      addedCount++;
      totalValue += stockIn.totalValue;

      const stockInfo = {
        product: product.brandFullName,
        code: product.code,
        category: item.category,
        qty: qtyToAdd,
        existing: totalExistingQty,
        total: qtyToAdd + totalExistingQty,
        value: stockIn.totalValue
      };
      addedStock.push(stockInfo);

      console.log(`✅ Added ${qtyToAdd} units of ${product.brandFullName} (${product.code}) - ${item.category}`);
      console.log(`   Previous: ${totalExistingQty}, New Total: ${qtyToAdd + totalExistingQty} units - ₹${stockIn.totalValue.toFixed(2)}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 SUMMARY:\n');
    console.log(`✅ Stock added for ${addedCount} products`);
    console.log(`⚠️  ${skippedCount} products not found in database`);
    console.log(`💰 Total value: ₹${totalValue.toFixed(2)}\n`);

    if (addedStock.length > 0) {
      console.log('📦 Stock Added:');
      console.log('─'.repeat(80));
      addedStock.forEach((stock, index) => {
        console.log(`${index + 1}. ${stock.product} (${stock.code})`);
        console.log(`   Category: ${stock.category}`);
        console.log(`   Added: ${stock.qty} units (Previous: ${stock.existing}, New Total: ${stock.total})`);
        console.log(`   Value: ₹${stock.value.toFixed(2)}`);
        console.log('');
      });
    }

    console.log('\n✅ Stock ready for PDF testing!\n');
    console.log('📄 You can now upload: PickList_PKL6_20251024225716978.pdf\n');

    // Check total stock now available
    const totalStockRecords = await StockIn.countDocuments();
    console.log(`📊 Total stock records in database: ${totalStockRecords}\n`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

addStockForActualPDF();
