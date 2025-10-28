# Authentication Fix Guide

## Problem
Your driver app is showing:
```
ERROR ❌ GET /dispatches/driver/68f9cab440d05ac114e1af56/active - 401: 
{"message": "User not found. Token invalid.", "success": false}
```

## Why This Happens
The app has an old authentication token stored for a driver that no longer exists in the database (ID: `68f9cab440d05ac114e1af56`). This typically happens when:
- The database was reset/seeded
- The driver account was deleted
- You're using a token from an old database backup

## ✅ Solution: Clear App Data and Re-login

### Option 1: Clear AsyncStorage (Recommended)
1. **Shake your phone** to open the dev menu
2. Tap **"Reload"**
3. When the login screen appears, **delete the app data**:
   - On the login screen, the app should automatically detect the invalid token
   - Or manually clear by logging out

### Option 2: Force Logout
Add a logout button temporarily or clear AsyncStorage:

1. Shake phone → **Debug menu**
2. Tap **"Reload"** 
3. App will try to auto-login with the stored token and fail
4. You'll be redirected to the login screen

### Option 3: Reinstall App (Nuclear Option)
1. Close the Expo app
2. Reopen and scan the QR code again
3. This will start fresh without cached data

---

## 📱 Valid Login Credentials

After clearing the old token, use these credentials:

### Test Driver Account
- **Phone:** `9876543210`
- **Password:** `123456`
- **Name:** Rajesh Kumar
- **Driver ID:** `68fcc7432e657e9c320f3ee9`

### Admin Account (Full Access)
- **Phone:** `9999999999`
- **Password:** `admin123`
- **Name:** Admin User
- **Role:** Admin

### Other Driver Accounts
1. **Amit Sharma** - Phone: `9876543211` | Password: `123456`
2. **Vikram Singh** - Phone: `9876543212` | Password: `123456`
3. **Pradeep Verma** - Phone: `9876543213` | Password: `123456`
4. **Sunil Yadav** - Phone: `9876543214` | Password: `123456`

---

## 🔍 Verify It's Working

After re-login, check the console logs:

### ✅ Success Logs:
```
LOG  🌐 API URL: http://192.168.0.155:5000/api
LOG  📤 GET /dispatches/driver/68fcc7432e657e9c320f3ee9/active [Token: eyJhbGci...]
LOG  ✅ GET /dispatches/driver/68fcc7432e657e9c320f3ee9/active - 200
```

### ❌ Still Getting 401?
If you're still getting "User not found" after re-login:

1. **Check backend logs** - make sure backend is running
2. **Verify database connection** - run the check script:
   ```bash
   cd backend
   node scripts/check-drivers.js
   ```
3. **Check the driver exists** - The script will show all active drivers

---

## 🛠️ Developer Note

The app uses AsyncStorage to persist the JWT token. When you log in, the token is stored at key `@auth_token`. This token contains the driver's ID (`68f9cab440d05ac114e1af56` in the old token).

If the database is reset or that driver is deleted, the token becomes invalid but stays in AsyncStorage, causing 401 errors on every request.

**To manually clear AsyncStorage in code** (add this temporarily to LoginScreen.js):

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add a button to clear storage
const clearStorage = async () => {
  await AsyncStorage.clear();
  console.log('✅ Storage cleared!');
};
```

---

## 📚 Related Files
- **Authentication Middleware:** `backend/src/middlewares/auth.js` (validates tokens)
- **Driver Model:** `backend/src/models/Driver.js` (user lookup)
- **Login Service:** `driver-cash-app/src/services/authService.js` (stores tokens)
- **API Service:** `driver-cash-app/src/services/api.js` (sends tokens)

---

## 🎯 Quick Fix Command

If you want to just recreate the test driver with a specific ID, you can do:

```javascript
// In MongoDB Compass or backend script
db.drivers.insertOne({
  _id: ObjectId("68f9cab440d05ac114e1af56"),
  name: "Test Driver",
  phone: "9999999998",
  password: "$2b$10$...", // Hashed "123456"
  role: "Driver",
  salary: 15000,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

But it's better to just re-login with the existing accounts! 🚀
