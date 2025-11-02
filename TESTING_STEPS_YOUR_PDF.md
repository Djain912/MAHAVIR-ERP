# PDF Extract Module - Step-by-Step Testing Guide
## Using Your Actual PDF: PickList_PKL6_20251024225716978.pdf

**Date:** November 2, 2025  
**PDF File:** `pdf/PickList_PKL6_20251024225716978.pdf`  
**Pick List Number:** PL-22850  
**Vehicle:** MH01CV8603  
**Driver:** SHAILESH  
**Date:** 22-Oct-2025

---

## 📋 PDF Content Analysis

### Key Information from Your PDF:
- **Pick List Number:** PL-22850
- **Vehicle Number:** MH01CV8603
- **Driver:** SHAILESH
- **Route:** MGR AJAY-MARINE DRIVE
- **Load Out Date:** 22-Oct-2025
- **Total Items:** 32 product lines
- **Total LO Qty (Loaded):** 304.00 units
- **Total Sales Qty (Expected Sell):** 276.39 units
- **Total LI Qty (Load In/Return):** 25.28 units
- **Expected Collection:** ₹130,964.01

### Sample Products in PDF:
1. **DKO300** (Can 300-24) - MRP: ₹40, LO: 7, Sell: 4, LI: 3
2. **KOCC300** (Can 300-24) - MRP: ₹40, LO: 4, Sell: 3, LI: 1
3. **TUP740** (PET 0-24) - MRP: ₹40, LO: 13, Sell: 13, LI: 0
4. **KNW 115NF** (1000-15) - MRP: ₹18, LO: 100, Sell: 94.14, LI: 5.01
5. **TUP200** (RGB 200-24) - MRP: ₹10, LO: 15, Sell: 15, LI: 0

### RGB Items (Returnable Glass Bottles):
- **Total RGB LO Qty:** 52.00 crates
- **Total RGB Sales:** 52.00 crates
- **Total RGB LI:** 0.00 crates

---

## 🧪 STEP-BY-STEP TESTING PROCEDURE

### ✅ STEP 1: Prepare Database - Add Stock Records

#### 1.1 Login to Admin Dashboard
```
URL: http://localhost:5173
Login Credentials:
- Username: admin
- Password: admin123
```

#### 1.2 Add Stock for Test Products
Navigate to: **Stock Intake → Add Stock**

**Add these 5 products with sufficient stock:**

**Product 1: Coca Cola Can 300ML**
```
Product: Select "300ML Can Coca Cola RS. 40 (Pack of 24)"
Quantity: 20 units (enough for LO: 7 + 4 = 11)
Batch Number: BATCH-TEST-001
Purchase Rate: ₹670 per unit
Expiry Date: 6 months from today
Date Received: Today
```
Click **"Add Stock"** → Should show success message

**Product 2: Thumbs Up PET 740ML**
```
Product: Select "740ML PET Thums Up RS. 40 (Pack of 24)"
Quantity: 25 units (for LO: 13)
Batch Number: BATCH-TEST-002
Purchase Rate: ₹720 per unit
Expiry Date: 6 months from today
```
Click **"Add Stock"**

**Product 3: Kinley Water 1L**
```
Product: Select "1000ML Kinley Water RS. 18 (Pack of 15)"
Quantity: 150 units (for LO: 100)
Batch Number: BATCH-TEST-003
Purchase Rate: ₹200 per unit
Expiry Date: 6 months from today
```
Click **"Add Stock"**

**Product 4: Thumbs Up RGB 200ML**
```
Product: Select "200ML RGB Thums Up RS. 10 (Pack of 24)"
Quantity: 30 units (for LO: 15)
Batch Number: BATCH-TEST-004
Purchase Rate: ₹150 per unit
Expiry Date: 6 months from today
```
Click **"Add Stock"**

**Product 5: Sprite Can 300ML**
```
Product: Select "300ML Can Sprite RS. 40 (Pack of 24)"
Quantity: 15 units (for LO: 10)
Batch Number: BATCH-TEST-005
Purchase Rate: ₹670 per unit
Expiry Date: 6 months from today
```
Click **"Add Stock"**

#### 1.3 Verify Stock Added
Navigate to: **Stock Intake → Purchase History**

**Expected Result:**
✅ 5 new stock records visible
✅ Each shows correct product name (not "Unknown Product")
✅ Each shows "Remaining Quantity" = quantity you entered
✅ Batch numbers match what you entered

**Screenshot Checkpoint 1:** Take screenshot of Purchase History

---

### ✅ STEP 2: Upload PDF Pick List

#### 2.1 Navigate to Pick List Upload
```
Navigate to: Pick List → Upload Pick List
(or similar menu option in your admin dashboard)
```

#### 2.2 Fill Upload Form
```
Pick List Number: PL-22850 (from PDF)
Date: 22-Oct-2025 (from PDF)
Vehicle Number: MH01CV8603 (from PDF)
Driver: Select "SHAILESH" (must exist in drivers list)
Route: MGR AJAY-MARINE DRIVE
```

#### 2.3 Upload PDF File
```
1. Click "Choose File" or "Upload PDF" button
2. Select: pdf/PickList_PKL6_20251024225716978.pdf
3. Click "Extract & Process" or "Upload"
```

**Expected Processing:**
```
⏳ Uploading PDF...
⏳ Extracting data...
✅ Extracted 32 items from PDF
✅ Processing stock reduction...
```

#### 2.4 Expected Results After Upload
```
✅ Success message: "Pick list uploaded and stock reduced successfully"
✅ Shows summary:
   - Total Items: 32
   - Total LO Qty: 304.00
   - Total Sell Qty: 276.39
   - Stock Reduced: Yes
   - Items Processed: X (number of matched products)
   - Items with Insufficient Stock: Y (if any)
```

**Screenshot Checkpoint 2:** Take screenshot of upload success message

---

### ✅ STEP 3: Verify Stock Reduction

#### 3.1 Check Purchase History
Navigate to: **Stock Intake → Purchase History**

**Verify Each Product Stock Reduced:**

**Product 1: Coca Cola Can 300ML**
```
Before: 20 units
LO Qty from PDF: 7 units (DKO300) + 4 units (KOCC300) = 11 units
After: 20 - 11 = 9 units
Expected: Remaining Quantity = 9 units ✅
```

**Product 2: Thumbs Up PET 740ML**
```
Before: 25 units
LO Qty from PDF: 13 units
After: 25 - 13 = 12 units
Expected: Remaining Quantity = 12 units ✅
```

**Product 3: Kinley Water 1L**
```
Before: 150 units
LO Qty from PDF: 100 units
After: 150 - 100 = 50 units
Expected: Remaining Quantity = 50 units ✅
```

**Screenshot Checkpoint 3:** Take screenshot showing reduced quantities

#### 3.2 Check Pick List Details
Navigate to: **Pick List → View All**

Find your pick list: **PL-22850**

**Expected Details:**
```
✅ Pick List Number: PL-22850
✅ Vehicle: MH01CV8603
✅ Driver: SHAILESH
✅ Date: 22-Oct-2025
✅ Status: "Active" or "Stock Reduced"
✅ Stock Reduced: Yes (green checkmark)
✅ Total LO Qty: 304.00
✅ Total Sell Qty: 276.39
```

Click **"View Details"** to see item list

**Expected Items Table:**
```
Item Code | Item Name              | MRP   | LO Qty | Sell Qty | LI Qty
----------------------------------------------------------------------
DKO300   | Can 300-24              | 40.00 | 7.00   | 4.00     | 3.00
KOCC300  | Can 300-24              | 40.00 | 4.00   | 3.00     | 1.00
TUP740   | PET 740-24              | 40.00 | 13.00  | 13.00    | 0.00
... (32 items total)
```

**Screenshot Checkpoint 4:** Take screenshot of pick list details

---

### ✅ STEP 4: Driver App - Submit Collection with RGB

#### 4.1 Login to Driver App
```
Open Driver App on Phone/Emulator
Login Credentials:
- Phone: 9876543213 (or SHAILESH's phone number)
- Password: driver123
```

#### 4.2 Open Active Dispatch
```
1. Tap "View Active Dispatch" card on dashboard
2. Should show dispatch for vehicle MH01CV8603
3. Scroll to bottom
4. Tap "Submit Cash Collection" button
```

#### 4.3 Fill Cash Collection Form

**Scenario for Testing:**
```
Driver collected cash from sales and returned some items:
- Full crates returned: 10 crates (unsold RGB bottles)
- Empty crates returned: 38 crates (from 52-10=42 sold, 38 returned)
- Cash collected: ₹100,000
- Cheque received: ₹20,000
- Credit given: ₹10,000
```

**Enter RGB Returns:**
```
1. Scroll to "RGB Returns" section
2. Full Crates Returned: 10
3. Empty Crates Returned: 38
```

**Expected Real-Time Calculation Display:**
```
📊 RGB Calculation
-----------------
Total Loaded: 52 crates
Returned Full: 10 crates
Actual Sold: 42 crates (52 - 10)

Expected Empties: 42 crates
Returned Empties: 38 crates
Missing Empties: 4 crates ⚠️ (in RED)
```

**Screenshot Checkpoint 5:** Take screenshot of RGB calculation

**Enter Cash Denominations:**
```
₹2000 notes: 20 × ₹2000 = ₹40,000
₹500 notes: 60 × ₹500 = ₹30,000
₹200 notes: 100 × ₹200 = ₹20,000
₹100 notes: 100 × ₹100 = ₹10,000
Total Cash: ₹100,000
```

**Enter Other Payments:**
```
Cheque Received: ₹20,000
Online Received: ₹0
Credit Given: ₹10,000
```

**Expected Summary:**
```
Total Cash: ₹100,000
Total Cheque: ₹20,000
Total Online: ₹0
Total Credit: ₹10,000
-----------------
Total Received: ₹130,000
Expected Cash: ₹130,964.01 (from PDF)
Variance: -₹964.01 (SHORTAGE)
```

#### 4.4 Submit Collection
```
1. Review all entries
2. Scroll to bottom
3. Tap "Submit Collection" button
4. Confirm submission in popup
```

**Expected Result:**
```
✅ Success message: "Collection submitted successfully"
✅ Navigates back to dashboard
✅ Active dispatch status changes to "Completed"
```

**Screenshot Checkpoint 6:** Take screenshot of success message

---

### ✅ STEP 5: Verify RGB Processing (Backend)

#### 5.1 Check RGB Tracking Record
```
Navigate to: Admin Dashboard → RGB Tracking
(or use API: GET /api/picklists/rgb-tracking)
```

**Expected RGB Record:**
```
Pick List: PL-22850
Driver: SHAILESH
Date: 22-Oct-2025

Total Loaded: 52 crates
Total Sold: 42 crates
Returned Full: 10 crates
Expected Empties: 42 crates
Returned Empties: 38 crates
Missing Empties: 4 crates ⚠️

Status: Submitted
Penalty: ₹(calculated based on missing empties)
```

#### 5.2 Verify Stock Added Back
Navigate to: **Stock Intake → Purchase History**

**Check RGB Product (Thumbs Up 200ML):**
```
Before Driver Collection: 30 - 15 = 15 units remaining
Full Crates Returned: 10 units
After Driver Collection: 15 + 10 = 25 units
Expected: Remaining Quantity = 25 units ✅
```

**Screenshot Checkpoint 7:** Take screenshot showing stock added back

---

### ✅ STEP 6: Verify Reconciliation

#### 6.1 Check Reconciliation Data
Navigate to: **Pick List → View Details (PL-22850) → Reconciliation Tab**

**Expected Reconciliation:**
```
Expected Total (from PDF): ₹130,964.01
Actual Total (from driver): ₹130,000.00
  - Cash: ₹100,000
  - Cheque: ₹20,000
  - Online: ₹0
  - Credit: ₹10,000
Variance: -₹964.01 (SHORTAGE)
Variance %: -0.74%
Status: MATCHED (within 2% tolerance) ✅

Note: Despite ₹964 shortage, it's within 2% tolerance,
so status is "MATCHED" (acceptable variance)
```

#### 6.2 Check Item-Wise Breakdown
**Expected Item Breakdown:**
```
Item: DKO300
Expected Qty: 4.00 (Sell Qty from PDF)
Price: ₹40
Expected Total: 4 × ₹40 = ₹160

Item: TUP740
Expected Qty: 13.00
Price: ₹40
Expected Total: 13 × ₹40 = ₹520

... (all 32 items)

Total Expected: ₹130,964.01
Total Actual: ₹130,000.00
```

**Screenshot Checkpoint 8:** Take screenshot of reconciliation report

---

## 📊 FINAL VERIFICATION CHECKLIST

### Feature 1: Stock Auto-Deduction ✅
- [ ] PDF uploaded successfully
- [ ] 32 items extracted from PDF
- [ ] Stock reduced for matched products
- [ ] Purchase History shows reduced quantities
- [ ] FIFO applied (oldest batches used first)
- [ ] Pick list marked as "Stock Reduced"

### Feature 2: RGB Tracking ✅
- [ ] Driver app shows RGB input fields
- [ ] Real-time calculation works:
  - [ ] Actual Sold = 52 - 10 = 42 ✅
  - [ ] Expected Empties = 42 ✅
  - [ ] Missing Empties = 42 - 38 = 4 ✅
- [ ] Warning shown for 4 missing crates
- [ ] Full crates (10) added back to stock
- [ ] RGB tracking record created
- [ ] Status: "Submitted"

### Feature 3: Reconciliation ✅
- [ ] Expected total calculated: ₹130,964.01
- [ ] Actual total calculated: ₹130,000.00
- [ ] Variance: -₹964.01 (0.74%)
- [ ] Status: MATCHED (within 2% tolerance)
- [ ] Item-wise breakdown available
- [ ] Reconciliation date recorded

---

## 🐛 Troubleshooting

### Issue 1: "Product not found" during upload
**Cause:** Product codes in PDF don't match database products

**Solution:**
1. Check product codes in your database
2. Run: `node backend/scripts/check-products.js`
3. Ensure product codes match PDF format (e.g., "DKO300", "KOCC300")
4. Update product codes in database if needed

### Issue 2: Stock not reducing
**Check:**
1. Is pick list marked as "Stock Reduced: Yes"?
2. Check console logs in backend terminal
3. Verify products exist with matching codes
4. Check if sufficient stock available

**Debug:**
```bash
cd backend
# Check stock reduction logs
node -e "
const PickListExtracted = require('./src/models/PickListExtracted');
// Check if stockReduced flag is true
"
```

### Issue 3: RGB not showing in driver app
**Check:**
1. Driver app connected to correct backend URL
2. Network connectivity (check console logs)
3. Pick list ID passed correctly to collection screen
4. Redux/state management working

### Issue 4: Reconciliation shows wrong amounts
**Check:**
1. Product MRPs are set correctly in database
2. All payment modes included (cash + cheque + online + credit)
3. PDF extraction captured correct Sell Qty values

---

## 📝 Test Results Template

Use this template to document your test:

```
=== PDF EXTRACT MODULE TEST RESULTS ===
Date: _______________
Tester: _______________

PDF File: PickList_PKL6_20251024225716978.pdf
Pick List: PL-22850

STEP 1: Stock Preparation
- Stock added: [✅/❌]
- Products count: ___
- Screenshot: [Yes/No]

STEP 2: PDF Upload
- Upload success: [✅/❌]
- Items extracted: ___ / 32
- Stock reduced: [✅/❌]
- Error messages: _______________

STEP 3: Stock Verification
- Coca Cola reduced: ___ → ___
- Thumbs Up reduced: ___ → ___
- Kinley reduced: ___ → ___
- FIFO applied: [✅/❌]

STEP 4: Driver Collection
- RGB inputs visible: [✅/❌]
- Calculations correct: [✅/❌]
- Missing empties shown: [✅/❌]
- Submission success: [✅/❌]

STEP 5: RGB Verification
- Full crates added back: [✅/❌]
- Stock increased: ___ → ___
- RGB record created: [✅/❌]
- Missing tracked: [✅/❌]

STEP 6: Reconciliation
- Expected: ₹_______________
- Actual: ₹_______________
- Variance: ₹_______________
- Status: [MATCHED/EXCESS/SHORTAGE]

OVERALL RESULT: [PASS/FAIL]
Notes: _______________
```

---

## ✅ Success Criteria

All 3 requirements must pass:

1. **✅ Stock Should Be Minus**
   - Stock quantities decreased after PDF upload
   - FIFO method applied correctly
   - Audit trail visible

2. **✅ RGB Calculated**
   - Full crates: 10 added back to stock
   - Empty crates: 38 returned, 4 missing tracked
   - Visual warnings displayed

3. **✅ Expected = Actual**
   - PDF: ₹130,964.01
   - App: ₹130,000.00
   - Variance: -₹964.01 (0.74%) - MATCHED ✅

---

**Ready to test! Follow these steps in order and document results.** 🚀

**Pro Tip:** Take screenshots at each checkpoint for your test documentation!
