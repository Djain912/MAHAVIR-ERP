# 📦 PDF Extraction Module - Analysis & Implementation Plan

## 📊 **Current Implementation Overview**

### **What is Currently Implemented:**

The system currently has a **PickList PDF Extraction** module that:

1. **Uploads PDF Pick Lists** from Coca-Cola distribution system
2. **Extracts Data** using Python script (`extract_picklist_advanced.py`)
3. **Stores in MongoDB** (`PickListExtracted` model)

### **Current Data Flow:**

```
┌─────────────────┐
│  PDF Upload     │ → Contains pick list with items loaded on truck
└────────┬────────┘
         ↓
┌─────────────────┐
│ Python Extractor│ → Reads PDF, extracts: vehicle, items, quantities
└────────┬────────┘
         ↓
┌─────────────────┐
│ PickListExtracted│ → Stores in MongoDB
│ Model           │
└─────────────────┘

Fields Extracted:
- pickListNumber: "6600011"
- vehicleNumber: "MH01CV8603"
- salesMan: "Rajesh Kumar"
- items: [
    {
      itemCode: "10000567",
      itemName: "Coca-Cola 250ml",
      loQty: 52,        // LO = Load Out (Crates loaded)
      sellQty: 50,      // Sell Qty (Expected sales)
      totalLoadInQty: 0 // Load In (Crates returned)
    }
  ]
```

### **Current Fields in PickListExtracted:**

```javascript
{
  pickListNumber: String,      // e.g., "6600011"
  loadoutNumber: String,        // e.g., "LO-2025-001"
  vehicleNumber: String,        // e.g., "MH01CV8603"
  createdDate: Date,           // When picklist created
  loadOutDate: Date,           // When truck loaded
  route: String,               // e.g., "Route-A"
  salesMan: String,            // e.g., "Rajesh Kumar"
  
  items: [
    {
      itemCode: String,        // e.g., "10000567"
      itemName: String,        // e.g., "Coca-Cola 250ml"
      category1: String,       // e.g., "Beverages"
      category2: String,       // e.g., "CSD"
      mrp: Number,            // e.g., 20.00
      loQty: Number,          // Load Out Qty (crates loaded) = 52
      sellQty: Number,        // Expected Sell Qty = 50
      totalLoadInQty: Number  // Load In Qty (returned) = 0 (not used yet)
    }
  ],
  
  totalItems: Number,         // Total product SKUs
  totalLoQty: Number,         // Total crates loaded
  totalSellQty: Number,       // Total expected sales
  totalLoadInQty: Number      // Total returned (not used yet)
}
```

---

## 🎯 **Your Requirements - Explained**

### **Requirement 1: Stock Should Be Minus**

**What it means:**
- When a pick list is loaded (e.g., 52 crates of Coca-Cola)
- **Warehouse stock should reduce by 52 crates** ✅
- Currently: Pick list extraction doesn't update warehouse stock

**Example:**
```
Warehouse Stock Before: 500 crates
Pick List Loaded: 52 crates
Warehouse Stock After: 448 crates ✅ (Should be reduced)
```

---

### **Requirement 2: RGB (Returnable Glass Bottles) Calculation**

**What it means:**

#### **Scenario 1: Physical Bottles Returned (Unsold)**
```
Loaded: 52 crates (full bottles)
Sold: 50 crates
Returned: 2 crates (still full, unsold)

Action:
✅ Add 2 crates back to warehouse stock
✅ Driver has 2 crates × ₹X worth of unsold stock
```

#### **Scenario 2: Empty Glass Bottles Returned**
```
Loaded: 52 crates (full bottles)
Sold: 50 crates (customers took full bottles)
Empty Bottles Returned: 45 crates (customers returned empties)

Calculation:
- 50 crates sold
- 45 empty crates returned
- Missing: 5 empty crates ❌

Action:
✅ Track 45 empty crates as "returned empties"
✅ Flag 5 crates as "missing empties"
✅ Charge driver for 5 missing empty crates
```

**Complete Flow:**
```
Morning (Load Out):
├─ 52 crates loaded → Stock reduces by 52

Evening (Driver Returns):
├─ Physical Returns:
│  ├─ 2 full crates (unsold) → Add back to stock
│  └─ Remaining in truck: 50 crates sold
│
└─ Empty Bottle Returns:
   ├─ 45 empty crates returned → Track as empties
   ├─ Expected: 50 empties
   └─ Missing: 5 empties → Charge driver

Final Accounting:
- Warehouse Stock: +2 (unsold)
- Sold Bottles: 50
- Empty Returns: 45
- Missing Empties: 5 (driver penalty)
```

---

### **Requirement 3: Expected Total Match with Driver App**

**What it means:**

The **Expected Total** in PDF should match the **Actual Total** submitted by driver in the app.

#### **PDF (Morning - Expected):**
```
Pick List #6600011
Date: 31-Oct-2025

Item: Coca-Cola 250ml
Loaded: 52 crates
Expected Sales: 50 crates × ₹500/crate = ₹25,000
Expected Total: ₹25,000 ✅
```

#### **Driver App (Evening - Actual):**
```
Cash Collection Screen
Date: 31-Oct-2025

Cash Collected: ₹24,500
Cheque Received: ₹0
Credit Given: ₹500
Total: ₹25,000 ✅ (Should match PDF)
```

#### **Validation:**
```javascript
PDF Expected Total: ₹25,000
Driver App Total: ₹25,000
Status: ✅ MATCHED

If mismatch:
PDF Expected: ₹25,000
Driver App Total: ₹24,000
Variance: -₹1,000 ❌ (Investigate shortage)
```

---

## 🏗️ **Implementation Plan**

### **Phase 1: Database Schema Updates**

#### **1.1 Update PickListExtracted Model**

Add fields for return tracking:

```javascript
const pickListExtractedSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // NEW FIELDS FOR RETURNS
  returnedFullCrates: {
    type: Number,
    default: 0,
    min: [0, 'Returned crates cannot be negative']
  },
  returnedEmptyCrates: {
    type: Number,
    default: 0,
    min: [0, 'Returned empty crates cannot be negative']
  },
  missingEmptyCrates: {
    type: Number,
    default: 0,
    min: [0, 'Missing crates cannot be negative']
  },
  actualSold: {
    type: Number,
    default: 0
  },
  expectedTotal: {
    type: Number,
    default: 0
  },
  actualTotal: {
    type: Number,
    default: 0
  },
  variance: {
    type: Number,
    default: 0
  },
  returnStatus: {
    type: String,
    enum: ['pending', 'partial', 'complete'],
    default: 'pending'
  },
  isReconciled: {
    type: Boolean,
    default: false
  },
  reconciledAt: Date,
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  // Per item return tracking
  itemReturns: [{
    itemCode: String,
    itemName: String,
    loadedQty: Number,
    soldQty: Number,
    returnedFullQty: Number,
    returnedEmptyQty: Number,
    missingEmptyQty: Number
  }]
});
```

#### **1.2 Update CashCollection Model**

Link to pick list:

```javascript
const cashCollectionSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // NEW FIELD
  pickListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PickListExtracted',
    required: false // Optional for backward compatibility
  }
});
```

#### **1.3 Add RGB Tracking Model**

```javascript
const rgbTrackingSchema = new mongoose.Schema({
  pickListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PickListExtracted',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Full bottle returns
  totalLoadedCrates: Number,
  totalSoldCrates: Number,
  returnedFullCrates: Number,
  
  // Empty bottle returns
  expectedEmptyCrates: Number,  // = totalSoldCrates
  returnedEmptyCrates: Number,
  missingEmptyCrates: Number,   // = expectedEmptyCrates - returnedEmptyCrates
  
  // Financial impact
  emptyBottleValue: Number,     // Price per empty crate
  penaltyAmount: Number,        // missingEmptyCrates × emptyBottleValue
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'submitted', 'verified', 'settled'],
    default: 'pending'
  },
  
  // Tracking
  submittedAt: Date,
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  notes: String
});
```

---

### **Phase 2: Stock Reduction on Load Out**

#### **2.1 Service: Reduce Stock When PickList Created**

```javascript
// backend/src/services/stockService.js

export const reduceStockForPickList = async (pickListId) => {
  const pickList = await PickListExtracted.findById(pickListId)
    .populate('items');
  
  if (!pickList) {
    throw new Error('Pick list not found');
  }
  
  // For each item in pick list
  for (const item of pickList.items) {
    // Find product by itemCode
    const product = await Product.findOne({ code: item.itemCode });
    
    if (!product) {
      console.warn(`Product not found: ${item.itemCode}`);
      continue;
    }
    
    // Find stock batches (FIFO)
    const stockBatches = await StockIn.find({
      productId: product._id,
      remainingQuantity: { $gt: 0 }
    }).sort({ dateReceived: 1 }); // FIFO
    
    let qtyToDeduct = item.loQty; // Load Out Qty
    
    // Deduct from batches
    for (const batch of stockBatches) {
      if (qtyToDeduct <= 0) break;
      
      const deductFromBatch = Math.min(
        qtyToDeduct,
        batch.remainingQuantity
      );
      
      batch.remainingQuantity -= deductFromBatch;
      await batch.save();
      
      qtyToDeduct -= deductFromBatch;
    }
    
    if (qtyToDeduct > 0) {
      throw new Error(
        `Insufficient stock for ${item.itemName}. ` +
        `Need ${item.loQty}, available ${item.loQty - qtyToDeduct}`
      );
    }
  }
  
  // Mark pick list as stock reduced
  pickList.stockReduced = true;
  pickList.stockReducedAt = new Date();
  await pickList.save();
  
  return pickList;
};
```

#### **2.2 Controller: Auto-reduce on PDF Upload**

```javascript
// backend/src/controllers/pickListExtractedController.js

export const extractAndSavePickList = async (req, res, next) => {
  try {
    // ... existing PDF extraction code ...
    
    const pickList = new PickListExtracted(extractedData);
    await pickList.save();
    
    // AUTO-REDUCE STOCK ✅
    try {
      await stockService.reduceStockForPickList(pickList._id);
      console.log('✅ Stock reduced for pick list:', pickList.pickListNumber);
    } catch (stockError) {
      console.error('❌ Stock reduction failed:', stockError.message);
      pickList.stockReductionError = stockError.message;
      await pickList.save();
    }
    
    return successResponse(res, 201, 'Pick list extracted and stock reduced', pickList);
  } catch (error) {
    next(error);
  }
};
```

---

### **Phase 3: RGB Returns in Driver App**

#### **3.1 Add Return Fields to CashCollectionScreen**

```javascript
// driver-cash-app/src/screens/CashCollectionScreen.js

const [rgbReturns, setRgbReturns] = useState({
  returnedFullCrates: '',
  returnedEmptyCrates: ''
});

// UI Section
<View style={styles.section}>
  <Text style={styles.sectionTitle}>📦 RGB Returns</Text>
  
  <TextInput
    label="Full Crates Returned (Unsold)"
    value={rgbReturns.returnedFullCrates}
    onChangeText={(value) => setRgbReturns({
      ...rgbReturns,
      returnedFullCrates: value
    })}
    keyboardType="numeric"
    placeholder="e.g., 2"
  />
  
  <TextInput
    label="Empty Crates Returned"
    value={rgbReturns.returnedEmptyCrates}
    onChangeText={(value) => setRgbReturns({
      ...rgbReturns,
      returnedEmptyCrates: value
    })}
    keyboardType="numeric"
    placeholder="e.g., 45"
  />
  
  {/* Show calculation */}
  {activeDispatch && (
    <View style={styles.calculation}>
      <Text>Loaded: {activeDispatch.totalCrates} crates</Text>
      <Text>Sold: {activeDispatch.totalCrates - parseInt(rgbReturns.returnedFullCrates || 0)} crates</Text>
      <Text>Expected Empties: {activeDispatch.totalCrates - parseInt(rgbReturns.returnedFullCrates || 0)}</Text>
      <Text>Returned Empties: {rgbReturns.returnedEmptyCrates}</Text>
      <Text style={styles.missing}>
        Missing Empties: {
          (activeDispatch.totalCrates - parseInt(rgbReturns.returnedFullCrates || 0)) - 
          parseInt(rgbReturns.returnedEmptyCrates || 0)
        }
      </Text>
    </View>
  )}
</View>
```

#### **3.2 Update Submission API**

```javascript
const handleSubmit = async () => {
  const collectionData = {
    // ... existing fields ...
    
    // NEW FIELDS
    returnedFullCrates: parseInt(rgbReturns.returnedFullCrates) || 0,
    returnedEmptyCrates: parseInt(rgbReturns.returnedEmptyCrates) || 0
  };
  
  await cashCollectionService.submitCollection(collectionData);
};
```

---

### **Phase 4: Backend RGB Processing**

#### **4.1 Calculate RGB Returns**

```javascript
// backend/src/services/rgbTrackingService.js

export const processRGBReturns = async (collectionData) => {
  const { pickListId, returnedFullCrates, returnedEmptyCrates } = collectionData;
  
  // Get pick list
  const pickList = await PickListExtracted.findById(pickListId);
  const totalLoaded = pickList.totalLoQty;
  const expectedSold = pickList.totalSellQty;
  
  // Calculate
  const actualSold = totalLoaded - returnedFullCrates;
  const expectedEmpties = actualSold;
  const missingEmpties = expectedEmpties - returnedEmptyCrates;
  
  // Create RGB tracking record
  const rgbTracking = new RGBTracking({
    pickListId,
    driverId: collectionData.driverId,
    date: new Date(),
    totalLoadedCrates: totalLoaded,
    totalSoldCrates: actualSold,
    returnedFullCrates,
    expectedEmptyCrates: expectedEmpties,
    returnedEmptyCrates,
    missingEmptyCrates,
    emptyBottleValue: 50, // ₹50 per empty crate
    penaltyAmount: missingEmpties * 50,
    status: 'submitted'
  });
  
  await rgbTracking.save();
  
  // Add full crates back to stock
  if (returnedFullCrates > 0) {
    await addBackToStock(pickList, returnedFullCrates);
  }
  
  return rgbTracking;
};

async function addBackToStock(pickList, returnedFullCrates) {
  // For each item, proportionally add back
  for (const item of pickList.items) {
    const itemReturnedQty = Math.floor(
      (item.loQty / pickList.totalLoQty) * returnedFullCrates
    );
    
    // Find product
    const product = await Product.findOne({ code: item.itemCode });
    
    // Find latest batch
    const latestBatch = await StockIn.findOne({
      productId: product._id
    }).sort({ dateReceived: -1 });
    
    if (latestBatch) {
      latestBatch.remainingQuantity += itemReturnedQty;
      await latestBatch.save();
    }
  }
}
```

---

### **Phase 5: Reconciliation & Variance**

#### **5.1 Calculate Expected vs Actual**

```javascript
// backend/src/services/reconciliationService.js

export const reconcilePickList = async (pickListId, collectionId) => {
  const pickList = await PickListExtracted.findById(pickListId);
  const collection = await CashCollection.findById(collectionId);
  
  // Expected Total from PDF
  let expectedTotal = 0;
  for (const item of pickList.items) {
    const product = await Product.findOne({ code: item.itemCode });
    expectedTotal += item.sellQty * (product?.pricePerUnit || 0);
  }
  
  // Actual Total from Driver
  const actualTotal = 
    collection.totalCashCollected +
    collection.totalChequeReceived +
    collection.totalOnlineReceived +
    collection.totalCreditGiven;
  
  // Calculate variance
  const variance = actualTotal - expectedTotal;
  const variancePercentage = (variance / expectedTotal) * 100;
  
  // Update pick list
  pickList.expectedTotal = expectedTotal;
  pickList.actualTotal = actualTotal;
  pickList.variance = variance;
  pickList.variancePercentage = variancePercentage;
  pickList.isReconciled = true;
  pickList.reconciledAt = new Date();
  
  await pickList.save();
  
  return {
    expectedTotal,
    actualTotal,
    variance,
    variancePercentage,
    status: Math.abs(variance) < 100 ? 'MATCHED' : 'MISMATCH'
  };
};
```

---

## 📊 **Complete Flow Diagram**

```
┌──────────────────────────────────────────────────────────────┐
│                     MORNING - LOAD OUT                        │
└──────────────────────────────────────────────────────────────┘

1. PDF Upload → Extract Pick List
   ├─ Vehicle: MH01CV8603
   ├─ Items: Coca-Cola 250ml
   ├─ Loaded: 52 crates
   └─ Expected Sales: 50 crates × ₹500 = ₹25,000

2. Reduce Warehouse Stock ✅
   ├─ Before: 500 crates
   └─ After: 448 crates (-52)

┌──────────────────────────────────────────────────────────────┐
│                     EVENING - RETURN                          │
└──────────────────────────────────────────────────────────────┘

3. Driver Submits Cash Collection
   ├─ Cash: ₹24,000
   ├─ Cheque: ₹0
   ├─ Credit: ₹1,000
   ├─ Total: ₹25,000 ✅
   │
   ├─ Full Crates Returned: 2
   └─ Empty Crates Returned: 45

4. RGB Calculation ✅
   ├─ Loaded: 52
   ├─ Returned Full: 2
   ├─ Actual Sold: 50
   ├─ Expected Empties: 50
   ├─ Returned Empties: 45
   └─ Missing Empties: 5 ❌

5. Stock Adjustment ✅
   ├─ Add back 2 full crates
   └─ Warehouse: 448 + 2 = 450

6. Reconciliation ✅
   ├─ Expected: ₹25,000
   ├─ Actual: ₹25,000
   ├─ Variance: ₹0
   └─ Status: MATCHED ✅

7. Penalty Calculation ✅
   ├─ Missing Empties: 5
   ├─ Rate: ₹50/crate
   └─ Penalty: ₹250 ❌
```

---

## 🎯 **Summary**

### **What Will Be Implemented:**

1. ✅ **Stock Reduction on Load**
   - Automatic stock deduction when PDF uploaded
   - FIFO batch deduction
   - Insufficient stock validation

2. ✅ **RGB Tracking**
   - Full crate returns (add back to stock)
   - Empty crate returns
   - Missing empty crate calculation
   - Penalty calculation

3. ✅ **Expected vs Actual Matching**
   - PDF expected total calculation
   - Driver app actual total
   - Variance calculation
   - Alert on mismatch

4. ✅ **Driver App Enhancements**
   - RGB return fields
   - Real-time calculation
   - Missing crates alert

5. ✅ **Admin Dashboard**
   - Reconciliation view
   - RGB tracking report
   - Variance analysis
   - Penalty management

---

**Total Estimated Time:** 2-3 days
**Priority:** High
**Complexity:** Medium-High

Would you like me to start implementing this plan?
