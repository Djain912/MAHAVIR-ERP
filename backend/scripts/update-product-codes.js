import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

const productCodes = [
  { brandFullName: "200ML RGB Coca Cola RS. 10 (Pack of 24)", code: "KOC200/KOC200P" },
  { brandFullName: "300ML RGB Coca Cola RS. 25 (Pack of 24)", code: "KOC300/KOC300P" },
  { brandFullName: "300ML Can Coca Cola RS. 40 (Pack of 24)", code: "KOCC300" },
  { brandFullName: "400ML PET Coca Cola RS. 20 (Pack of 24)", code: "KOC400" },
  { brandFullName: "740ML PET Coca Cola RS. 40 (Pack of 24)", code: "KOPT740" },
  { brandFullName: "1L PET Coca Cola RS. 50 (Pack of 15)", code: "KO100015" },
  { brandFullName: "2.25L PET Coca Cola RS. 100 (Pack of 9)", code: "KO2.25" },
  { brandFullName: "250ML PET Coke Zero RS. 10 (Pack of 28)", code: "KOZ250KZ" },
  { brandFullName: "400ML PET Coke Zero RS. 20 (Pack of 24)", code: "" },
  { brandFullName: "300ML Can Coke Zero RS. 40 (Pack of 24)", code: "COKEZERO" },
  { brandFullName: "300ML Can Coke Dite RS. 40 (Pack of 24)", code: "DKO300" },
  { brandFullName: "200ML RGB Thumps Up RS. 10 (Pack of 24)", code: "TUP200/TUP200P" },
  { brandFullName: "300ML RGB Thumps Up RS. 25 (Pack of 24)", code: "TUP300/TUP300P" },
  { brandFullName: "300ML Can Thumps Up RS. 40 (Pack of 24)", code: "TUPC300" },
  { brandFullName: "250ML PET Thumps Up RS. 20 (Pack of 28)", code: "TU25028" },
  { brandFullName: "740ML PET Thumps Up RS. 40 (Pack of 24)", code: "TUP740" },
  { brandFullName: "1L PET Thumps Up RS. 50 (Pack of 15)", code: "TU100015" },
  { brandFullName: "2.25L PET Thumps Up RS. 100 (Pack of 9)", code: "TU2.25" },
  { brandFullName: "250ML PET Thumps Up XFORCE RS. 10 (Pack of 28)", code: "TUPX250" },
  { brandFullName: "400ML PET Thumps Up XFORCE RS. 20 (Pack of 24)", code: "TASPP400" },
  { brandFullName: "250ML PET Thmps Up Charged Energy Drink RS. 15 (Pack of 28)", code: "CTU25028" },
  { brandFullName: "200ML RGB Sprite RS. 10 (Pack of 24)", code: "SPR200/SPR200P" },
  { brandFullName: "300ML RGB Sprite RS. 25 (Pack of 24)", code: "SPR300/SPR300P" },
  { brandFullName: "300ML Can Sprite RS. 40 (Pack of 24)", code: "SPRC300" },
  { brandFullName: "250ML PET Sprite RS. 20 (Pack of 28)", code: "SP25028" },
  { brandFullName: "740ML PET Sprite RS. 40 (Pack of 24)", code: "SPR740" },
  { brandFullName: "1L PET Sprite RS. 50 (Pack of 15)", code: "SP100015" },
  { brandFullName: "2.25L PET Sprite RS. 100 (Pack of 9)", code: "SP2.25" },
  { brandFullName: "250ML PET Sprite Zero RS. 10 (Pack of 28)", code: "SPZ250" },
  { brandFullName: "400ML PET Sprite Zero RS. 20 (Pack of 24)", code: "SPZ400" },
  { brandFullName: "200ML RGB Fanta RS. 10 (Pack of 24)", code: "FNO200/FNO200P" },
  { brandFullName: "300ML RGB Fanta RS. 25 (Pack of 24)", code: "FNO300/FNO300P" },
  { brandFullName: "300ML Can Fanta RS. 40 (Pack of 24)", code: "FNOC300" },
  { brandFullName: "250ML PET Fanta RS. 20 (Pack of 28)", code: "FO25028" },
  { brandFullName: "740ML PET Fanta RS. 40 (Pack of 24)", code: "FNO740" },
  { brandFullName: "1L PET Fanta RS. 50 (Pack of 15)", code: "FO100015" },
  { brandFullName: "2.25L PET Fanta RS. 100 (Pack of 9)", code: "FO2.25" },
  { brandFullName: "200ML RGB Limca RS. 10 (Pack of 24)", code: "LIM200/LIM200P" },
  { brandFullName: "300ML RGB Limca RS. 25 (Pack of 24)", code: "LIM300/LIM300P" },
  { brandFullName: "300ML Can Limca RS. 40 (Pack of 24)", code: "LIMC300" },
  { brandFullName: "250ML PET Limca RS. 20 (Pack of 28)", code: "LIM25028" },
  { brandFullName: "740ML PET Limca RS. 40 (Pack of 24)", code: "LIM740" },
  { brandFullName: "1L PET Limca RS. 50 (Pack of 15)", code: "LIM100015" },
  { brandFullName: "2.25L PET Limca RS. 100 (Pack of 9)", code: "LIM2.25" },
  { brandFullName: "135ML Tetra Tetra Maaza Mango RS. 9 (Pack of 40)", code: "MZRT135" },
  { brandFullName: "250ML PET Maaza Mango RS. 18 (Pack of 30)", code: "MZM250P" },
  { brandFullName: "600ML PET Maaza Mango RS. 35 (Pack of 24)", code: "MZM600" },
  { brandFullName: "850ML PET Maaza Mango RS. 50 (Pack of 24)", code: "MZM850" },
  { brandFullName: "1.2L PET Maaza Mango RS. 70 (Pack of 12)", code: "MZM1.2" },
  { brandFullName: "135ML Tetra Tetra Nimbu Masala RS. 9 (Pack of 40)", code: "MMNM135" },
  { brandFullName: "135ML Tetra Tetra Mixed Fruite RS. 9 (Pack of 40)", code: "MMMF135" },
  { brandFullName: "250ML PET Minute Maid Pulpy Orange RS. 24 (Pack of 30)", code: "MM250_3" },
  { brandFullName: "250ML PET Minute Maid Nimbu RS. 24 (Pack of 30)", code: "MMNM250" },
  { brandFullName: "300ML RGB Kinley Soda RS. 9 (Pack of 24)", code: "KNS300" },
  { brandFullName: "250ML PET Kinley Soda RS. 11 (Pack of 28)", code: "KNS250_ASSP" },
  { brandFullName: "750ML PET Kinley Soda RS. 18 (Pack of 24)", code: "KNS750" },
  { brandFullName: "1L PET Kinley Water RS. 18 (Pack of 15)", code: "KNW115NF" },
  { brandFullName: "500ML PET Kinley Water RS. 9 (Pack of 24)", code: "KNW500NF" },
  { brandFullName: "1L PET Kinley Plus Water RS. 30 (Pack of 15)", code: "KNW115" },
  { brandFullName: "750Ml PET Smart Water RS. 50 (Pack of 15)", code: "GSW750_12NF" },
  { brandFullName: "300Ml Can Predator Energy Drink RS. 60 (Pack of 24)", code: "PRE300" },
  { brandFullName: "250ML PET Rimzim Jeera RS. 20 (Pack of 28)", code: "RZFIZ250" },
  { brandFullName: "300Ml Can Schweppes Tonic Water RS. 60 (Pack of 24)", code: "STW300" },
  { brandFullName: "300Ml Can Schweppes Ginger Ale RS. 60 (Pack of 24)", code: "SGAC300" },
  { brandFullName: "300Ml Can Schweppes Soda Water RS. 55 (Pack of 24)", code: "SSWSC300" },
  { brandFullName: "350ML Can Monster Energy Drink RS. 125 (Pack of 24)", code: "MON350" },
  { brandFullName: "350ML Can Monster Ultra Energy Drink RS. 125 (Pack of 24)", code: "MON350" }
];

mongoose.connect('mongodb+srv://zootechxai_db_user:RnGF8oggYXsbv89o@cluster0.sb0amk4.mongodb.net/cocacola_erp?retryWrites=true&w=majority')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    console.log('Updating products with codes...\n');
    
    let updated = 0;
    let notFound = 0;
    
    for (const item of productCodes) {
      const product = await Product.findOne({ brandFullName: item.brandFullName });
      
      if (product) {
        product.code = item.code;
        await product.save();
        console.log(`✅ Updated: ${item.brandFullName.substring(0, 50)}... => ${item.code || 'EMPTY'}`);
        updated++;
      } else {
        console.log(`❌ Not found: ${item.brandFullName}`);
        notFound++;
      }
    }
    
    console.log(`\n✅ Update complete!`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Not found: ${notFound} products`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
