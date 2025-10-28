/**
 * Script to convert some retail dispatch items to wholesale for testing
 * This will help test the Wholesaler Bill Generation feature
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DriverDispatchItem from '../src/models/DriverDispatchItem.js';
import DriverDispatch from '../src/models/DriverDispatch.js';
import Driver from '../src/models/Driver.js';
import Product from '../src/models/Product.js';

// Load environment variables
dotenv.config();

const convertToWholesale = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all dispatch items
    const allItems = await DriverDispatchItem.find().populate('dispatchId').populate('productId');
    console.log(`\n📦 Found ${allItems.length} total dispatch items`);

    // Count current retail vs wholesale
    const retailCount = allItems.filter(item => item.itemType === 'Retail').length;
    const wholesaleCount = allItems.filter(item => item.itemType === 'Wholesale').length;
    console.log(`   - Retail items: ${retailCount}`);
    console.log(`   - Wholesale items: ${wholesaleCount}`);

    if (retailCount === 0) {
      console.log('\n❌ No retail items found to convert!');
      process.exit(0);
    }

    // Convert 50% of retail items to wholesale (or at least 5 items)
    const itemsToConvert = Math.max(5, Math.floor(retailCount / 2));
    const retailItems = allItems.filter(item => item.itemType === 'Retail');
    const itemsForConversion = retailItems.slice(0, Math.min(itemsToConvert, retailItems.length));

    console.log(`\n🔄 Converting ${itemsForConversion.length} items to Wholesale...`);

    // Update items
    const updatePromises = itemsForConversion.map(item => {
      return DriverDispatchItem.findByIdAndUpdate(
        item._id,
        { itemType: 'Wholesale' },
        { new: true }
      );
    });

    const updatedItems = await Promise.all(updatePromises);

    console.log(`\n✅ Successfully converted ${updatedItems.length} items to Wholesale!`);

    // Show summary by dispatch
    const dispatchMap = {};
    updatedItems.forEach(item => {
      const dispatchId = item.dispatchId.toString();
      if (!dispatchMap[dispatchId]) {
        dispatchMap[dispatchId] = {
          count: 0,
          totalValue: 0
        };
      }
      dispatchMap[dispatchId].count++;
      dispatchMap[dispatchId].totalValue += item.totalValue || 0;
    });

    console.log(`\n📊 Summary by Dispatch:`);
    console.log(`   Affected ${Object.keys(dispatchMap).length} dispatch(es)`);
    
    for (const [dispatchId, data] of Object.entries(dispatchMap)) {
      const dispatch = await DriverDispatch.findById(dispatchId).populate('driverId');
      console.log(`   - Dispatch ${dispatch.date.toLocaleDateString()}: ${data.count} wholesale items, ₹${data.totalValue.toFixed(2)}`);
    }

    // Final count
    const finalRetail = await DriverDispatchItem.countDocuments({ itemType: 'Retail' });
    const finalWholesale = await DriverDispatchItem.countDocuments({ itemType: 'Wholesale' });

    console.log(`\n📈 Final Count:`);
    console.log(`   - Retail items: ${finalRetail}`);
    console.log(`   - Wholesale items: ${finalWholesale}`);

    console.log(`\n✨ Done! You can now test the Bill Generation feature.`);
    console.log(`   Go to: Wholesaler Management → Bill Generation tab`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
convertToWholesale();
