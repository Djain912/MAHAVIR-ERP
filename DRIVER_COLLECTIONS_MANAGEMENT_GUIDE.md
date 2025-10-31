# Driver Collections Management - Admin Guide

## Overview
The **Driver Collections Management** page is a comprehensive admin interface to view and manage all driver cash collections in one place. This allows you to fill in detailed information about cheques, credits, bounce cheques, and bottles.

## Accessing the Page
1. Login to Admin Dashboard: http://localhost:3000 (or http://YOUR_IP:3000 from network)
2. Click on **"Driver Collections"** in the sidebar menu (between Cash Reconciliation and Cheque Management)

## Features

### 1. Filter Collections
At the top of the page, you can filter collections by:
- **Driver**: Select a specific driver from dropdown (or "All Drivers")
- **Date Range**: Choose start and end dates
- **Status**: Filter by Submitted, Verified, or Reconciled

### 2. Collections Table
View all collections with:
- **Date**: When the collection was made
- **Driver**: Driver name and phone
- **Expected**: Expected cash amount from dispatch
- **Received**: Total cash + cheque + online received
- **Variance**: Difference (cumulative variance tracking)
- **Status**: Current status (Submitted/Verified/Reconciled)
- **Actions**: View details or Edit details buttons

### 3. Edit Collection Details
Click **"Edit Details"** button on any collection to open the edit modal with 4 tabs:

#### Tab 1: Cheque Details
Fill in:
- **Cheque Number**: The cheque reference number
- **Bank Name**: Name of the issuing bank
- **Cheque Date**: Date on the cheque

#### Tab 2: Credit Details  
Fill in:
- **Credit Amount**: Amount given as credit (auto-filled from collection)
- **Customer Name**: Name of the customer who received credit
- **Notes**: Additional notes about the credit

#### Tab 3: Bounce Details
Fill in:
- **Bounce Cheque Number**: Cheque number that bounced
- **Bounce Date**: Date when the cheque bounced
- **Reason**: Reason for bounce (insufficient funds, signature mismatch, etc.)

#### Tab 4: Bottles
Fill in:
- **Empty Bottles Count**: Number of empty bottles collected (auto-filled from collection)
- **Notes**: Additional notes about bottles

### 4. Save Changes
- Click **"Save Changes"** button in the modal to save all details
- Click **"Cancel"** or outside the modal to close without saving

## API Endpoints

### Get All Collections
```
GET /api/cash-collections?page=1&limit=20&driverId=xxx&status=Submitted&startDate=xxx&endDate=xxx
```

### Update Collection Details
```
PATCH /api/cash-collections/:id/details
Body:
{
  "chequeDetails": {
    "chequeNumber": "CHQ123456",
    "bankName": "State Bank of India",
    "chequeDate": "2025-10-30"
  },
  "creditDetails": {
    "amount": 5000,
    "customerName": "ABC Store",
    "notes": "Credit for next delivery"
  },
  "bounceDetails": {
    "chequeNumber": "CHQ789",
    "bounceDate": "2025-10-29",
    "reason": "Insufficient funds"
  },
  "bottlesDetails": {
    "count": 120,
    "notes": "Empty bottles collected"
  }
}
```

## Database Fields

The following fields are now stored in the `CashCollection` model:

### Cheque Fields
- `chequeNumber` (String)
- `bankName` (String)
- `chequeDate` (Date)

### Credit Fields
- `creditCustomerName` (String)
- `creditNotes` (String)

### Bounce Fields
- `bounceChequeNumber` (String)
- `bounceDate` (Date)
- `bounceReason` (String)

### Bottles Fields
- `bottlesNotes` (String)

## Workflow

### Complete Process:
1. **Admin Creates Dispatch**
   - Go to Driver Dispatch page
   - Create dispatch for a driver with products
   - Dispatch value becomes the "expected cash"

2. **Driver Submits Collection (via Driver App)**
   - Driver submits cash collection with:
     - Cash denominations + coins
     - Cheque received amount
     - Online payment amount
     - Credit given amount
     - Credit received (cash/cheque)
     - Bounce received (cash/cheque)
     - Empty bottles count

3. **Admin Manages Details**
   - Go to Driver Collections page
   - Find the collection
   - Click "Edit Details"
   - Fill in:
     - Cheque number and bank details
     - Credit customer information
     - Bounce cheque details
     - Bottle collection notes
   - Save changes

4. **Admin Verifies Collection**
   - Click "View Details" to see full information
   - Verify all details are correct
   - Click "Verify" button (if needed)

5. **Admin Reconciles (if needed)**
   - If there are discrepancies
   - Click "Reconcile" button
   - Add reconciliation notes

## Integration

### With Cheque Management
- Cheque numbers and bank details saved here will be available in the Cheque Management module
- Track cheque status (cleared/pending/bounced) in Cheque Management

### With Variance Tracking
- Variance is automatically calculated: (Total Received + Credit Given) - Expected Cash
- Cumulative variance: Previous Variance + Current Variance
- Tracks variance across all collections for each driver

### With Credit Tracking
- Credit given and credit received are tracked separately
- Customer names help identify who owes money
- Notes provide context for credit transactions

## Tips

1. **Fill details promptly**: Add cheque and credit details as soon as the collection is submitted
2. **Use consistent naming**: Use full bank names (e.g., "State Bank of India" not "SBI")
3. **Add clear notes**: Notes help track why credit was given or why cheques bounced
4. **Track bounce reasons**: Common reasons include:
   - Insufficient funds
   - Signature mismatch
   - Account closed
   - Stop payment
   - Post dated
5. **Verify bottle counts**: Cross-check empty bottles with inventory

## Troubleshooting

### Issue: Can't see any collections
**Solution**: 
- Check if dispatches have been created
- Check if drivers have submitted collections via the app
- Try removing filters (set to "All Drivers", "All Status")

### Issue: Save button doesn't work
**Solution**:
- Check browser console for errors
- Verify backend is running (http://localhost:5000/health)
- Check network tab for API errors

### Issue: Changes not persisting
**Solution**:
- Verify you have Admin or Supervisor role
- Check if backend is connected to MongoDB
- Look for error messages in backend logs

## Access Control
- **Admin**: Full access - view all, edit all, verify all
- **Supervisor**: Full access - view all, edit all, verify all  
- **Driver**: Can only view their own collections (not this page)

## Technical Details

### Files Modified
- **Frontend**: 
  - `admin-dashboard/src/pages/DriverCollectionsManagement.jsx` (new page)
  - `admin-dashboard/src/services/cashCollectionService.js` (added getCashCollections, updateCollectionDetails)
  - `admin-dashboard/src/App.jsx` (added route)
  - `admin-dashboard/src/components/Layout.jsx` (added menu item)

- **Backend**:
  - `backend/src/models/CashCollection.js` (added fields)
  - `backend/src/services/cashCollectionService.js` (added updateCollectionDetails)
  - `backend/src/controllers/cashCollectionController.js` (added updateCollectionDetails)
  - `backend/src/routes/cashCollectionRoutes.js` (added PATCH /details route)

### Servers
- **Backend**: http://localhost:5000 (or http://YOUR_IP:5000)
- **Admin Dashboard**: http://localhost:3000 (or http://YOUR_IP:3000)
- **Driver App**: Configure EXPO_PUBLIC_API_URL in .env

## Quick Start
1. Start backend: `cd backend && npm start`
2. Start admin dashboard: `cd admin-dashboard && npm run dev`
3. Login as admin: 9999999999 / admin123
4. Navigate to "Driver Collections" in sidebar
5. Start managing collection details!

---

**Last Updated**: October 30, 2025
**Version**: 1.0.0
