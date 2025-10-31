import mongoose from 'mongoose';
import CashCollection from '../src/models/CashCollection.js';
import DriverDispatch from '../src/models/DriverDispatch.js';
import Driver from '../src/models/Driver.js';
import Product from '../src/models/Product.js';

mongoose.connect('mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Get all drivers
    const drivers = await Driver.find().limit(5);
    console.log(`Found ${drivers.length} drivers`);
    
    if (drivers.length === 0) {
      console.log('❌ No drivers found. Please run import-real-data.js first.');
      process.exit(1);
    }
    
    // Get some products
    const products = await Product.find().limit(5);
    console.log(`Found ${products.length} products\n`);
    
    if (products.length === 0) {
      console.log('❌ No products found. Please import products first.');
      process.exit(1);
    }
    
    console.log('Creating test dispatches and collections...\n');
    
    let collectionsCreated = 0;
    
    for (let i = 0; i < Math.min(drivers.length, 3); i++) {
      const driver = drivers[i];
      const date = new Date();
      date.setDate(date.getDate() - i); // Different dates
      
      // Create a dispatch
      const dispatch = new DriverDispatch({
        driverId: driver._id,
        date: date,
        stockAllocated: products.slice(0, 3).map(p => ({
          productId: p._id,
          quantity: 10 + i * 5,
          unitPrice: p.sellingPrice
        })),
        totalStockValue: 5000 + i * 1000,
        totalCashValue: 0,
        emptyBottlesGiven: 0,
        status: 'Active'
      });
      
      await dispatch.save();
      console.log(`✅ Created dispatch for ${driver.name}`);
      
      // Create a collection
      const collection = new CashCollection({
        driverId: driver._id,
        dispatchId: dispatch._id,
        collectionDate: date,
        denominations: [
          { noteValue: 500, noteCount: 5, totalValue: 2500 },
          { noteValue: 200, noteCount: 10, totalValue: 2000 },
          { noteValue: 100, noteCount: 5, totalValue: 500 }
        ],
        coins: 100,
        totalCashCollected: 5100,
        totalChequeReceived: 500,
        totalOnlineReceived: 200,
        totalCreditGiven: 200,
        creditReceivedCash: 50,
        creditReceivedCheque: 100,
        bounceReceivedCash: 0,
        bounceReceivedCheque: 0,
        emptyBottlesReceived: 10 + i * 5,
        expectedCash: dispatch.totalStockValue,
        previousVariance: 0,
        notes: `Test collection ${i + 1}`,
        status: 'Submitted'
      });
      
      await collection.save();
      console.log(`✅ Created collection for ${driver.name} - Expected: ₹${dispatch.totalStockValue}, Received: ₹${collection.totalReceived}`);
      collectionsCreated++;
    }
    
    console.log(`\n✅ Successfully created ${collectionsCreated} test collections!`);
    console.log('\nYou can now view them in the Driver Collections Management page.');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
