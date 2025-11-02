import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Product from '../src/models/Product.js';

async function checkRealProductCodes() {
  try {
    console.log('\n🔍 Checking ACTUAL product codes (code field)...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find().sort({ code: 1 });
    
    console.log(`Total products: ${products.length}\n`);
    console.log('Product Codes (code field):');
    console.log('='.repeat(120));
    
    const withCodes = products.filter(p => p.code && p.code.trim() !== '');
    const withoutCodes = products.filter(p => !p.code || p.code.trim() === '');
    
    console.log(`\n✅ Products WITH codes: ${withCodes.length}`);
    console.log(`❌ Products WITHOUT codes: ${withoutCodes.length}\n`);
    
    if (withCodes.length > 0) {
      console.log('Products WITH codes:');
      console.log('─'.repeat(120));
      withCodes.forEach((product, index) => {
        const code = product.code || 'NO CODE';
        const name = product.brandFullName || product.name || 'NO NAME';
        console.log(`${(index + 1).toString().padStart(2)}. ${code.padEnd(25)} | ${name}`);
      });
    }

    if (withoutCodes.length > 0) {
      console.log('\n\n❌ Products WITHOUT codes:');
      console.log('─'.repeat(120));
      withoutCodes.forEach((product, index) => {
        const name = product.brandFullName || product.name || 'NO NAME';
        console.log(`${(index + 1).toString().padStart(2)}. ${name}`);
      });
    }

    // Check PDF codes
    console.log('\n\n' + '='.repeat(120));
    console.log('\n🔍 Checking which PDF codes exist in database:\n');
    
    const pdfCodes = [
      'DKO300', 'KOCC300', 'COKEZERO', 'SPRC300', 'TUPC300', 'SGAC300', 'STW300', 'PRE300',
      'TUP740', 'SPR740', 'FNO740', 'LIM740',
      'SP25028', 'CTU25028', 'FO25028', 'TU25028', 'RZFIZ250',
      'MM250_3', 'KNW500NF', 'MZM600',
      'KNW115NF', 'TU100015', 'SP100015',
      'SP2.25', 'TU2.25', 'FO2.25',
      'LIM200', 'FNO200', 'SPR200', 'TUP200',
      'TUP300', 'MZRT135'
    ];

    let foundCount = 0;
    let notFoundCount = 0;

    for (const pdfCode of pdfCodes) {
      // Check if code exists in database (might be in format CODE1/CODE2)
      const product = withCodes.find(p => {
        const codes = p.code.split('/').map(c => c.trim().toUpperCase());
        return codes.includes(pdfCode.toUpperCase());
      });

      if (product) {
        console.log(`✅ ${pdfCode.padEnd(15)} → FOUND: ${product.brandFullName}`);
        foundCount++;
      } else {
        console.log(`❌ ${pdfCode.padEnd(15)} → NOT FOUND`);
        notFoundCount++;
      }
    }

    console.log('\n' + '='.repeat(120));
    console.log(`\n📊 PDF Code Match Summary:`);
    console.log(`✅ Found: ${foundCount}/${pdfCodes.length}`);
    console.log(`❌ Not Found: ${notFoundCount}/${pdfCodes.length}`);
    console.log(`📈 Match Rate: ${((foundCount / pdfCodes.length) * 100).toFixed(1)}%\n`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkRealProductCodes();
