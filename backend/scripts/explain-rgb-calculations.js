/**
 * Check Pick List RGB Data
 * Shows where the RGB calculations come from
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import PickListExtracted from '../src/models/PickListExtracted.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coca-cola-erp';

async function checkRGBData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const pickList = await PickListExtracted.findOne({ 
      pickListNumber: '11521003000269' 
    });

    if (!pickList) {
      console.log('❌ Pick list not found');
      return;
    }

    console.log('📄 PICK LIST DATA FROM PDF:');
    console.log('════════════════════════════════════════════════\n');
    
    console.log('Pick List Number:', pickList.pickListNumber);
    console.log('Vehicle:', pickList.vehicleNumber);
    console.log('Driver:', pickList.salesMan);
    console.log('Load Out Date:', pickList.loadOutDate);
    console.log('');
    
    console.log('💰 FINANCIAL DATA:');
    console.log('Total Collection Amount: ₹' + (pickList.totalCollectionAmt || 'N/A'));
    console.log('');
    
    console.log('📦 STOCK DATA:');
    console.log('Total Items:', pickList.items?.length || 0);
    console.log('Total Quantity (LO Qty):', pickList.totalLoQty || 0);
    console.log('');
    
    console.log('🍾 RGB (RETURNABLE GLASS BOTTLES) DATA:');
    console.log('RGB Crates Loaded:', pickList.rgbCratesLoaded || 'NOT SET');
    console.log('');

    console.log('═══════════════════════════════════════════════════');
    console.log('🧮 RGB CALCULATION FORMULA:');
    console.log('═══════════════════════════════════════════════════\n');
    
    const cratesLoaded = pickList.rgbCratesLoaded || 52;
    
    console.log('STEP 1: CRATES LOADED (from PDF)');
    console.log(`   → ${cratesLoaded} crates loaded on vehicle\n`);
    
    console.log('STEP 2: DRIVER ENTERS DATA (in app)');
    console.log('   → Full Crates Returned (Unsold): 10 crates');
    console.log('   → Empty Crates Returned (Collected): 35 crates\n');
    
    console.log('STEP 3: CALCULATE CRATES SOLD');
    console.log(`   → Crates Sold = Loaded - Returned Full`);
    console.log(`   → Crates Sold = ${cratesLoaded} - 10 = 42 crates\n`);
    
    console.log('STEP 4: CALCULATE EXPECTED EMPTIES');
    console.log('   → Expected Empties = Crates Sold');
    console.log('   → Expected Empties = 42 crates\n');
    
    console.log('STEP 5: CALCULATE MISSING EMPTIES');
    console.log('   → Missing = Expected - Returned');
    console.log('   → Missing = 42 - 35 = 7 empty crates\n');
    
    console.log('STEP 6: CALCULATE PENALTY');
    console.log('   → Penalty = Missing × ₹50 per crate');
    console.log('   → Penalty = 7 × ₹50 = ₹350\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('📋 WHERE IS THIS DATA STORED?');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('1️⃣  PDF Upload → PickListExtracted collection');
    console.log('   - Pick list number: 11521003000269');
    console.log('   - RGB Crates Loaded: ' + (pickList.rgbCratesLoaded || 52));
    console.log('   - Total Collection: ₹' + (pickList.totalCollectionAmt || 130964.01));
    console.log('');
    
    console.log('2️⃣  Driver Submission → RGBTracking collection');
    console.log('   - Full Crates Returned: (driver enters)');
    console.log('   - Empty Crates Returned: (driver enters)');
    console.log('   - Calculations: (auto-calculated by backend)');
    console.log('');
    
    console.log('3️⃣  Backend Calculation → Pre-save hook');
    console.log('   - File: backend/src/models/RGBTracking.js');
    console.log('   - Lines 140-153 (pre-save hook)');
    console.log('   - Auto-calculates: expectedEmptyCrates, missingEmptyCrates, penaltyAmount');
    console.log('');

    console.log('═══════════════════════════════════════════════════');
    console.log('🎯 BUSINESS LOGIC:');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('WHY 52 CRATES?');
    console.log('→ This comes from the PDF pick list');
    console.log('→ The warehouse loaded 52 crates of returnable bottles');
    console.log('');
    
    console.log('WHY TRACK EMPTIES?');
    console.log('→ Glass bottles are expensive assets');
    console.log('→ Must be returned after consumption');
    console.log('→ Missing bottles = penalty to driver/retailer');
    console.log('');
    
    console.log('WHY ₹50 PER CRATE?');
    console.log('→ Configurable penalty value (emptyBottleValue field)');
    console.log('→ Incentivizes proper bottle return');
    console.log('→ Covers cost of missing bottles');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

checkRGBData();
