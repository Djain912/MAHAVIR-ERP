import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Product Schema
const productSchema = new mongoose.Schema({
  headBrand: String,
  serialNumber: Number,
  srNo: Number,
  brandName: String,
  subSrNo: Number,
  brandFullName: String,
  ml: String,
  type: String,
  brand: String,
  mrp: String,
  packSize: String,
  purchaseRate: Number,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function importProducts() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cocacola_erp');
    console.log('✓ Connected to MongoDB');

    // Read Excel file
    console.log('\nReading Excel file...');
    const filePath = path.join(__dirname, '../../pdf/Copy of Software_Data_Exc(1).xlsx');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets['Product List'];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Skip header row and process products
    const products = [];
    let lastHeadBrand = null;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[5]) continue;

      // Track headBrand (it only appears once for a group)
      if (row[0]) lastHeadBrand = row[0];

      const product = {
        name: row[8] || row[3], // brand or brandName
        size: row[6] || 'N/A', // ml
        pricePerUnit: row[11] || 0, // purchaseRate
        headBrand: lastHeadBrand,
        serialNumber: row[1],
        srNo: row[2],
        brandName: row[3],
        subSrNo: row[4],
        brandFullName: row[5],
        ml: row[6],
        type: row[7],
        brand: row[8],
        mrp: row[9],
        packSize: row[10],
        purchaseRate: row[11] || 0,
        active: true
      };

      products.push(product);
    }

    console.log(`✓ Parsed ${products.length} products from Excel`);

    // Clear existing products
    console.log('\nClearing existing products...');
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');

    // Insert new products
    console.log('\nInserting products...');
    const result = await Product.insertMany(products);
    console.log(`✓ Successfully imported ${result.length} products`);

    // Show sample products
    console.log('\n========== Sample Products ==========');
    const samples = await Product.find().limit(5);
    samples.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.brandFullName}`);
      console.log(`   Purchase Rate: ₹${product.purchaseRate}`);
      console.log(`   Brand: ${product.brand}`);
      console.log(`   Type: ${product.type}`);
    });

    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing products:', error);
    process.exit(1);
  }
}

importProducts();
