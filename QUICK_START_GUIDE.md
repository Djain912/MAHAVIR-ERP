# Quick Start Guide - New Features

## 🏪 Wholesaler Management

### Access
Navigate to: **Dashboard → Wholesalers** (sidebar menu)

### Adding a New Wholesaler
1. Click **"+ Add Wholesaler"** button
2. Fill in required fields:
   - Contact Person Name *
   - Business Name *
   - Phone (10 digits) *
   - Credit Limit *
3. Fill optional fields:
   - Email, Address, City, State, Pincode
   - GST Number (validates format)
   - Outstanding Balance
   - Notes
4. Set Active/Inactive status
5. Click **"Create Wholesaler"**

### Managing Wholesalers
- **Search:** Type in search box (searches name, business, phone)
- **Filter:** Select Active/Inactive status
- **Edit:** Click "Edit" button on any row
- **Delete:** Click "Delete" button (Admin only)

### Key Features
- Pagination (20 per page)
- Credit limit tracking
- Outstanding balance monitoring
- GST number validation

---

## 💰 Cash Reconciliation

### Access
Navigate to: **Dashboard → Cash Reconciliation** (sidebar menu)

### Viewing Cash Submissions
1. Filter by:
   - Driver (dropdown)
   - Status (Submitted/Verified/Reconciled)
2. Click **"View"** to see denomination breakdown

### Verification Workflow

#### Step 1: Submitted (Yellow Badge)
- Driver submits cash collection via mobile app
- Shows in table with "Submitted" status
- Displays variance (Red = shortage, Green = exact, Yellow = minor difference)

#### Step 2: Verify (Blue Badge)
- **Who:** Supervisor or Admin
- **Action:** Click "Verify" button
- **Effect:** Changes status to "Verified"
- Can add verification notes

#### Step 3: Reconcile (Green Badge)
- **Who:** Admin only
- **Action:** Click "Reconcile" button
- **Effect:** Changes status to "Reconciled"
- Final approval, marks as complete

### Understanding the Display

**Expected Cash:** Amount driver should collect (from sales)
**Collected Cash:** Actual cash submitted
**Variance:** 
- `+₹100` (Green) = Excess cash
- `-₹100` (Red) = Short cash
- `₹0` (Green) = Perfect match

### Denomination Breakdown
Click "View" to see:
- Count of each note (₹2000, ₹500, ₹200, etc.)
- Total for each denomination
- Grand total cash collected
- Any notes from driver

---

## 🚚 Driver Dispatch (Updated)

### Access
Navigate to: **Dashboard → Driver Dispatch**

### Creating a Dispatch

#### New Field: Dispatch Type
When creating a new dispatch, you'll now see:

1. **Driver Selection** (existing)
2. **Dispatch Type** (NEW)
   - **Retail Dispatch** - For retail shop deliveries
   - **Wholesale Dispatch** - For bulk wholesaler deliveries
3. **Date** (existing)
4. **Products** (existing)
5. **Cash Denominations** (existing)

### Dispatch Types Explained

**Retail Dispatch:**
- Driver delivers to multiple retail shops
- Smaller quantities per stop
- More stops per day
- Cash/Cheque/Credit payments

**Wholesale Dispatch:**
- Driver delivers to wholesalers
- Large quantities (bulk orders)
- Fewer stops
- Usually credit-based payments
- Linked to Wholesaler records

### Use Cases

**Example 1: Retail Dispatch**
```
Driver: Rajesh
Type: Retail
Products: 
  - Coca Cola 250ml x 100 cases
  - Sprite 500ml x 50 cases
Expected Retailers: 20-30 shops
Expected Cash: ₹25,000
```

**Example 2: Wholesale Dispatch**
```
Driver: Amit  
Type: Wholesale
Products:
  - Coca Cola 250ml x 500 cases
  - Sprite 500ml x 300 cases
Expected Wholesalers: 2-3 distributors
Expected Cash: ₹150,000 (or credit)
```

---

## 🎯 Common Workflows

### Scenario 1: Daily Retail Cash Collection

**Morning:**
1. Admin creates Retail Dispatch for driver
2. Assigns products and opening cash
3. Driver receives dispatch on mobile app

**Evening:**
4. Driver counts cash: ₹15,500 collected
5. Driver enters denominations in app:
   - ₹500 x 30 = ₹15,000
   - ₹100 x 5 = ₹500
6. App shows variance: Expected ₹15,600, Variance -₹100
7. Driver adds note: "One retailer paid ₹100 less, will collect tomorrow"
8. Submits collection

**Dashboard:**
9. Supervisor sees submission with -₹100 variance
10. Reviews note, clicks "Verify"
11. Admin reviews, clicks "Reconcile"
12. Dispatch marked complete

### Scenario 2: Wholesale Delivery with Credit

**Morning:**
1. Admin creates Wholesale Dispatch
2. Selects wholesaler "ABC Distributors"
3. Assigns 500 cases of products

**Afternoon:**
4. Driver delivers to wholesaler
5. Wholesaler takes credit (no immediate payment)
6. Driver submits collection with ₹0 cash
7. System notes expected ₹100,000 on credit
8. Wholesaler's outstanding balance increases by ₹100,000

**Dashboard:**
9. Admin views wholesaler account
10. Sees ₹100,000 outstanding
11. Monitors credit limit compliance

---

## 🔍 Troubleshooting

### "Can't find wholesaler in dispatch"
✅ **Solution:** Go to Wholesalers page, ensure wholesaler is marked as Active

### "Variance showing incorrect amount"
✅ **Solution:** 
1. Check denomination counts (each note value × count)
2. Verify expected cash amount from dispatch
3. Review driver's notes for explanations

### "Driver can't submit cash collection"
✅ **Solution:**
1. Ensure driver has active dispatch
2. Check driver authentication token
3. Verify network connectivity
4. Ensure dispatch ID is correct

### "Can't verify cash collection"
✅ **Solution:** Only Supervisor and Admin can verify. Check your user role.

### "Can't reconcile cash collection"
✅ **Solution:** Only Admin can reconcile. Also, must be "Verified" first.

---

## 📊 Reports & Analytics

### Daily Cash Summary
1. Go to Cash Reconciliation
2. Filter by today's date
3. See all driver submissions
4. Total cash collected
5. Total variance

### Wholesaler Credit Report
1. Go to Wholesalers
2. Sort by Outstanding Balance (highest first)
3. Identify high-risk accounts
4. Monitor credit limit compliance

### Driver Performance
1. Go to Cash Reconciliation
2. Filter by specific driver
3. Review variance trends
4. Identify consistently accurate drivers

---

## ⚡ Quick Tips

**For Admins:**
- Verify wholesaler credit limits before creating large dispatches
- Review cash reconciliations daily
- Monitor drivers with frequent variances
- Keep wholesaler contact information updated

**For Supervisors:**
- Verify cash collections promptly (same day)
- Review variance notes before verification
- Contact driver if variance is unexplained
- Escalate large discrepancies to Admin

**Best Practices:**
- Create dispatches in the morning
- Drivers should submit cash same day
- Verify collections within 24 hours
- Reconcile weekly at minimum
- Review wholesaler balances weekly

---

## 🆘 Need Help?

### Documentation
- `PROJECT_STATUS.md` - Complete system status
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `README.md` - Project overview

### API Documentation
Backend server: `http://localhost:5000` (or your configured IP)
Health check: `http://localhost:5000/health`

### Contacts
For technical support, refer to your system administrator.

---

**Last Updated:** October 24, 2025
**Version:** 2.0 (Wholesaler & Cash Collection Features)
