/**
 * Add More Cheque Data Script
 * Adds additional cheque entries with various statuses, banks, and scenarios
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ChequeManagement from '../src/models/ChequeManagement.js';
import Sale from '../src/models/Sale.js';
import Retailer from '../src/models/Retailer.js';
import Driver from '../src/models/Driver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Add more cheques
const addMoreCheques = async () => {
  console.log('\n💳 Adding more cheque entries...\n');

  // Get existing data
  const retailers = await Retailer.find({ active: true }).limit(5);
  const drivers = await Driver.find({ role: 'Driver', active: true }).limit(3);
  const existingSales = await Sale.find().limit(5);

  if (retailers.length === 0 || drivers.length === 0) {
    console.log('❌ No retailers or drivers found. Please run the main seeding script first.');
    return;
  }

  const banks = [
    'HDFC Bank',
    'ICICI Bank', 
    'SBI',
    'Axis Bank',
    'PNB',
    'Kotak Mahindra Bank',
    'Yes Bank',
    'IndusInd Bank',
    'Bank of Baroda',
    'Canara Bank'
  ];

  const branches = ['Main Branch', 'South Delhi', 'Noida', 'Gurgaon', 'East Delhi', 'Faridabad', 'Dwarka', 'Rohini'];
  
  const bounceReasons = [
    'Insufficient funds',
    'Signature mismatch',
    'Account closed',
    'Payment stopped by drawer',
    'Post-dated cheque',
    'Refer to drawer',
    'Account frozen',
    'Expired cheque'
  ];

  const cheques = [];
  const baseDate = new Date('2025-10-15');

  // Create 30 additional cheques with diverse scenarios
  for (let i = 0; i < 30; i++) {
    const retailer = retailers[i % retailers.length];
    const driver = drivers[i % drivers.length];
    const sale = existingSales[i % existingSales.length];
    const bank = banks[i % banks.length];
    const branch = branches[i % branches.length];
    
    // Distribute statuses: ~25% each
    const statusIndex = i % 4;
    const statuses = ['Pending', 'Deposited', 'Cleared', 'Bounced'];
    const status = statuses[statusIndex];
    
    // Vary amounts
    const amounts = [2500, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 35000, 40000];
    const amount = amounts[i % amounts.length];
    
    // Calculate dates
    const saleDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    const depositDate = new Date(saleDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
    
    const chequeEntry = {
      chequeNumber: `CHQ${String(200000 + i).padStart(6, '0')}`,
      amount: amount,
      depositDate: depositDate,
      bankName: bank,
      branchName: `${bank} - ${branch}`,
      saleId: sale._id,
      retailerId: retailer._id,
      driverId: driver._id,
      status: status,
      chequePhotoUrl: `https://example.com/cheque${200000 + i}.jpg`,
      statusHistory: [{
        status: 'Pending',
        changedAt: saleDate,
        remarks: 'Cheque received from retailer'
      }]
    };

    // Add status-specific data
    if (status === 'Deposited' || status === 'Cleared' || status === 'Bounced') {
      chequeEntry.depositedAt = new Date(depositDate.getTime() + 1 * 24 * 60 * 60 * 1000);
      chequeEntry.statusHistory.push({
        status: 'Deposited',
        changedAt: chequeEntry.depositedAt,
        remarks: 'Deposited to bank account'
      });
    }

    if (status === 'Cleared') {
      chequeEntry.clearedAt = new Date(chequeEntry.depositedAt.getTime() + (3 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000);
      chequeEntry.statusHistory.push({
        status: 'Cleared',
        changedAt: chequeEntry.clearedAt,
        remarks: 'Payment successfully cleared'
      });
    }

    if (status === 'Bounced') {
      chequeEntry.bouncedAt = new Date(chequeEntry.depositedAt.getTime() + 2 * 24 * 60 * 60 * 1000);
      chequeEntry.bounceReason = bounceReasons[i % bounceReasons.length];
      chequeEntry.statusHistory.push({
        status: 'Bounced',
        changedAt: chequeEntry.bouncedAt,
        remarks: chequeEntry.bounceReason
      });
    }

    const savedCheque = await ChequeManagement.create(chequeEntry);
    cheques.push(savedCheque);
  }

  console.log(`✅ Successfully added ${cheques.length} additional cheque entries!\n`);
  
  // Show summary by status
  const pending = cheques.filter(c => c.status === 'Pending').length;
  const deposited = cheques.filter(c => c.status === 'Deposited').length;
  const cleared = cheques.filter(c => c.status === 'Cleared').length;
  const bounced = cheques.filter(c => c.status === 'Bounced').length;
  
  console.log('📊 CHEQUE SUMMARY BY STATUS');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Pending: ${pending}`);
  console.log(`✅ Deposited: ${deposited}`);
  console.log(`✅ Cleared: ${cleared}`);
  console.log(`✅ Bounced: ${bounced}`);
  console.log('═══════════════════════════════════════\n');
  
  // Get total count
  const totalCheques = await ChequeManagement.countDocuments();
  console.log(`💳 Total cheques in database: ${totalCheques}\n`);
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await addMoreCheques();
    console.log('✨ Done! Check your Cheque Management page.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

main();
