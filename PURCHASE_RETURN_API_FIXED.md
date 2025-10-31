# ✅ Purchase Return API - Fixed & Ready

## 🔧 Issues Fixed

### 1. **Missing User Model Import**
- ❌ Error: `Schema hasn't been registered for model "User"`
- ✅ Fixed: Changed to use `Driver` model (correct model in this system)
- Files updated:
  - `backend/src/services/stockService.js` - Import Driver instead of User
  - `backend/src/models/StockIn.js` - Reference 'Driver' instead of 'User'

### 2. **Missing Validation Schema**
- ❌ Error: No validation for return endpoint
- ✅ Fixed: Added `stockValidation.return` schema
- Validation rules:
  - `damageReason`: Required, max 500 characters
  - `damagedQuantity`: Required, integer, min 1
- File: `backend/src/utils/validation.js`

### 3. **Route Validation**
- ✅ Added validation middleware to return route
- File: `backend/src/routes/stockRoutes.js`

---

## 🚀 API Endpoint

### Record Purchase Return

```http
PATCH /api/stock/:id/return
Authorization: Bearer <token>
Content-Type: application/json

{
  "damageReason": "Broken bottles during transport",
  "damagedQuantity": 5
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Purchase return recorded successfully",
  "data": {
    "_id": "6904f4f02c104f0f1f00ab9e",
    "productId": {
      "_id": "690255bb784b60952d680f18",
      "name": "Coca-Cola",
      "size": "250ml",
      "pricePerUnit": 15
    },
    "quantity": 100,
    "remainingQuantity": 95,
    "batchNumber": "BATCH001",
    "isDamaged": true,
    "damageReason": "Broken bottles during transport",
    "damagedQuantity": 5,
    "returnedAt": "2025-10-31T10:30:00.000Z",
    "returnedBy": {
      "_id": "6903752181ae10c90416cdaa",
      "name": "Admin User",
      "phone": "1234567890"
    }
  }
}
```

**Error Responses:**

1. **Stock Not Found (404):**
```json
{
  "success": false,
  "message": "Stock record not found"
}
```

2. **Already Returned (400):**
```json
{
  "success": false,
  "message": "This stock is already marked as damaged"
}
```

3. **Insufficient Quantity (400):**
```json
{
  "success": false,
  "message": "Cannot return 10 units. Only 5 units available"
}
```

4. **Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Damage reason is required",
    "Damaged quantity must be at least 1"
  ]
}
```

---

## 🧪 Testing Steps

### Using Admin Dashboard

1. **Login** to admin dashboard
2. Go to **"Purchase"** page
3. Find a purchase record with `Remaining > 0`
4. Click **"Return"** button
5. Fill the modal:
   - **Damaged Quantity:** e.g., 5
   - **Damage Reason:** e.g., "Broken during transport"
6. Click **"Record Return"**
7. ✅ Should see success toast
8. ✅ Record should move to "Purchase Returns" table
9. ✅ `remainingQuantity` should be reduced

### Using Postman/Insomnia

```bash
# 1. Login first to get token
POST http://localhost:5000/api/auth/login
{
  "phone": "1234567890",
  "password": "admin@123"
}

# 2. Record return (use token from step 1)
PATCH http://localhost:5000/api/stock/6904f4f02c104f0f1f00ab9e/return
Authorization: Bearer <your-token>
{
  "damageReason": "Broken bottles",
  "damagedQuantity": 5
}

# 3. Get all returns
GET http://localhost:5000/api/stock/returns/list
Authorization: Bearer <your-token>
```

---

## 📊 Database Changes

### StockIn Document (Before Return):
```json
{
  "_id": "6904f4f02c104f0f1f00ab9e",
  "productId": "690255bb784b60952d680f18",
  "quantity": 100,
  "remainingQuantity": 100,
  "batchNumber": "BATCH001",
  "isDamaged": false,
  "damageReason": null,
  "damagedQuantity": 0,
  "returnedAt": null,
  "returnedBy": null
}
```

### StockIn Document (After Return of 5 units):
```json
{
  "_id": "6904f4f02c104f0f1f00ab9e",
  "productId": "690255bb784b60952d680f18",
  "quantity": 100,
  "remainingQuantity": 95,  // ✅ Reduced by 5
  "batchNumber": "BATCH001",
  "isDamaged": true,        // ✅ Marked as damaged
  "damageReason": "Broken bottles",  // ✅ Reason recorded
  "damagedQuantity": 5,     // ✅ Quantity recorded
  "returnedAt": "2025-10-31T10:30:00.000Z",  // ✅ Timestamp
  "returnedBy": "6903752181ae10c90416cdaa"   // ✅ User ID
}
```

---

## 🔍 Validation Rules

### Required Fields
- ✅ `damageReason` - Must be provided
- ✅ `damagedQuantity` - Must be at least 1

### Business Logic Checks
1. ✅ Stock record must exist
2. ✅ Cannot return already damaged stock
3. ✅ Damaged quantity cannot exceed `remainingQuantity`
4. ✅ Damaged quantity must be a positive integer

### Automatic Actions
1. ✅ Sets `isDamaged = true`
2. ✅ Stores `damageReason` and `damagedQuantity`
3. ✅ Records `returnedAt` timestamp
4. ✅ Records `returnedBy` user ID
5. ✅ Reduces `remainingQuantity` by `damagedQuantity`

---

## 🎯 Frontend Integration

### stockService.js
```javascript
export const returnDamagedStock = async (stockId, returnData) => {
  const response = await api.patch(`/stock/${stockId}/return`, returnData);
  return response.data.data || response.data;
};
```

### Usage in Component
```javascript
const handleReturnSubmit = async () => {
  try {
    await stockService.returnDamagedStock(selectedStock._id, {
      damageReason: returnData.damageReason,
      damagedQuantity: parseInt(returnData.damagedQuantity)
    });
    
    toast.success('Purchase return recorded successfully!');
    setShowReturnModal(false);
    loadStockList();
    loadDamagedStock();
  } catch (error) {
    toast.error(error.message || 'Failed to record purchase return');
  }
};
```

---

## ✅ Complete Implementation Checklist

### Backend
- [x] Import Driver model in stockService.js
- [x] Update StockIn model to reference 'Driver'
- [x] Create returnDamagedStock service method
- [x] Create getDamagedStock service method
- [x] Create returnDamagedStock controller
- [x] Create getDamagedStock controller
- [x] Add PATCH /stock/:id/return route
- [x] Add GET /stock/returns/list route
- [x] Add validation schema for return
- [x] Apply validation to return route
- [x] Test API endpoint

### Frontend
- [x] Add returnDamagedStock to stockService
- [x] Add getDamagedStock to stockService
- [x] Create return modal UI
- [x] Add return button to purchase history
- [x] Handle return submission
- [x] Display damaged stock table
- [x] Show loss amount calculation
- [x] Add loading states
- [x] Add error handling

---

## 🚀 Status

**Backend:** ✅ Running on port 5000
**Database:** ✅ Connected to MongoDB
**Validation:** ✅ All schemas in place
**API Endpoints:** ✅ Working correctly

**Ready for production use! 🎉**

---

## 📞 Troubleshooting

### Issue: 500 Internal Server Error
**Cause:** User/Driver model mismatch
**Solution:** ✅ Fixed - Now uses Driver model

### Issue: Validation Error
**Cause:** Missing or invalid fields
**Solution:** Check payload has both `damageReason` and `damagedQuantity`

### Issue: "Already marked as damaged"
**Cause:** Trying to return same stock twice
**Solution:** Each stock can only be returned once

### Issue: "Insufficient stock"
**Cause:** Trying to return more than available
**Solution:** Check `remainingQuantity` before return

---

**Last Updated:** October 31, 2025
**Status:** ✅ **PRODUCTION READY**
