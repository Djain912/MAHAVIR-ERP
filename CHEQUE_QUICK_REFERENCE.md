# Cheque Management - Quick Reference

## 🚀 Quick Start (3 Steps)

### 1. Start Backend & Frontend
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd admin-dashboard
npm start
```

### 2. Navigate to Cheque Management
- Login to admin dashboard
- Click **"Cheque Management"** in sidebar (💰 icon)

### 3. Import Existing Data
- Click **"Import from Sales"** button (top-right)
- Confirm import
- Done! All existing cheques now visible

---

## 📋 Common Tasks

### Filter Cheques by Date
1. Set "Start Date" (e.g., 2025-01-01)
2. Set "End Date" (e.g., 2025-01-31)
3. Table updates automatically

### Mark All as Cleared (except bounced)
1. Click checkbox in table header (selects all)
2. Click **"Deselect Bounced"** button
3. Click **"Update Status"**
4. Select "Cleared" from dropdown
5. Click "Update"

### Download PDF Report
1. Apply desired filters (date, status, bank, etc.)
2. Click **"Download PDF"** button
3. PDF auto-downloads

### Search by Bank
- Type bank name in "Bank Name" filter
- Case-insensitive search
- Example: "hdfc" finds "HDFC Bank"

### View Cheque Summary
- Summary cards at top show:
  - Total Cheques & Amount
  - Pending count & amount
  - Deposited count & amount
  - Cleared count & amount
  - Bounced count & amount

---

## 🎯 Key Features

### ✅ Filtering Options (8 filters)
- Start Date
- End Date
- Status (Pending/Deposited/Cleared/Bounced/Cancelled)
- Bank Name
- Retailer
- Driver
- Cheque Number
- Clear All

### ✅ Bulk Operations
- Select all cheques on page
- Deselect individual cheques
- Deselect all bounced cheques (quick action)
- Bulk update status with remarks

### ✅ Status Workflow
```
Pending → Deposited → Cleared ✅
                   ↘ Bounced ❌ → Re-deposit
        ↘ Cancelled 🚫
```

### ✅ PDF Reports
- Professional layout with PDFKit
- Includes applied filters
- Summary statistics
- Color-coded status
- Auto-pagination
- Page numbers

---

## 📊 API Endpoints

### GET Requests
```
GET /api/cheques                  - List all (with filters)
GET /api/cheques/:id              - Single cheque
GET /api/cheques/summary          - Summary stats
GET /api/cheques/bank-summary     - Bank-wise breakdown
GET /api/cheques/stats            - Dashboard statistics
GET /api/cheques/pdf              - Download PDF report
```

### POST Requests
```
POST /api/cheques                 - Create new cheque
POST /api/cheques/import-from-sales - Import from sales
```

### PUT Requests
```
PUT /api/cheques/:id/status       - Update single status
PUT /api/cheques/bulk-status      - Bulk update
```

### DELETE Requests
```
DELETE /api/cheques/:id           - Delete cheque (admin only)
```

---

## 🔐 Permissions

### All Users (Authenticated)
- ✅ View cheques
- ✅ Filter cheques
- ✅ Download PDF
- ✅ Update status
- ✅ Bulk update

### Admin Only
- ✅ Delete cheques (except cleared)
- ✅ Import from sales

---

## 🐛 Quick Troubleshooting

### Problem: No cheques showing
**Solution**: Click "Import from Sales" to sync existing data

### Problem: Cannot update status
**Check**: Valid status transition (see workflow above)

### Problem: PDF not downloading
**Solution**: Check browser popup blocker, allow downloads

### Problem: Filters not working
**Check**: Date format must be YYYY-MM-DD

---

## 📁 File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── ChequeManagement.js          ✅ NEW
│   ├── services/
│   │   └── chequeManagementService.js   ✅ NEW
│   ├── controllers/
│   │   └── chequeManagementController.js ✅ NEW
│   ├── routes/
│   │   └── chequeManagementRoutes.js    ✅ NEW
│   └── index.js                         📝 UPDATED

admin-dashboard/
├── src/
│   ├── pages/
│   │   ├── ChequeManagement.jsx         ✅ NEW
│   │   └── index.js                     📝 UPDATED
│   ├── services/
│   │   └── chequeService.js             ✅ NEW
│   ├── components/
│   │   └── Layout.jsx                   📝 UPDATED
│   └── App.jsx                          📝 UPDATED
```

---

## 💡 Pro Tips

### Tip 1: Bulk Clearing Workflow
1. Filter by status "Deposited"
2. Select all
3. Manually deselect any you're unsure about
4. Click "Deselect Bounced" for safety
5. Update to "Cleared"

### Tip 2: Monthly Reports
1. Set date range: 1st to 31st of month
2. Leave all other filters empty
3. Download PDF
4. Save as: `cheques_jan_2025.pdf`

### Tip 3: Track Bounced Cheques
1. Filter by status "Bounced"
2. Filter by retailer (to see pattern)
3. Export PDF for records

### Tip 4: Quick Search
- Use cheque number filter for instant lookup
- Use bank name for bank-specific reports
- Combine filters for targeted searches

---

## 🎨 Color Guide

| Status | Color | Meaning |
|--------|-------|---------|
| Pending | 🟡 Yellow | Awaiting deposit |
| Deposited | 🔵 Blue | In bank processing |
| Cleared | 🟢 Green | Successfully cleared |
| Bounced | 🔴 Red | Payment failed |
| Cancelled | ⚫ Gray | Void/cancelled |

---

## 📞 Support

### Common Questions

**Q: How to re-deposit a bounced cheque?**
A: Select bounced cheque → Update status to "Deposited"

**Q: Can I delete a cleared cheque?**
A: No, cleared cheques cannot be deleted (data integrity)

**Q: How to see cheque history?**
A: Each cheque has statusHistory[] field tracking all changes

**Q: Auto-sync with sales?**
A: Currently manual. Click "Import from Sales" periodically.

---

## ✅ Validation Rules

### Status Transitions
- ✅ Pending → Deposited
- ✅ Pending → Cancelled
- ✅ Deposited → Cleared
- ✅ Deposited → Bounced
- ✅ Deposited → Cancelled
- ✅ Bounced → Deposited (re-deposit)
- ❌ Cleared → Any (final state)
- ❌ Cancelled → Any (final state)
- ❌ Pending → Cleared (must deposit first)

### Required Fields
- chequeNumber (unique)
- amount (> 0)
- depositDate
- saleId (must exist in Sales)

### Optional Fields
- bankName (recommended)
- branchName
- chequePhotoUrl
- remarks
- retailerId
- driverId

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

For complete documentation, see: `CHEQUE_MANAGEMENT_GUIDE.md`
