# 🔧 Network Connection Fix - Driver App

## Problem: "Network Error" on Login

The app can't connect to the backend server because of IP address mismatch.

---

## ✅ **Quick Fix Steps:**

### Step 1: Find Your Computer's IP Address

**Option A: Using Command Prompt**
```powershell
ipconfig
```
Look for **"IPv4 Address"** under your active network adapter (usually starts with `192.168.x.x`)

**Option B: Using Settings**
1. Open Windows Settings
2. Go to Network & Internet
3. Click on your connection (Wi-Fi or Ethernet)
4. Scroll down to find "IPv4 address"

**Your IP appears to be:** `192.168.29.143` (based on Expo server output)

---

### Step 2: Update the .env File

Edit `driver-cash-app/.env`:

```properties
EXPO_PUBLIC_API_URL=http://192.168.29.143:5000/api
```

**Replace `192.168.29.143` with YOUR actual IP address from Step 1**

---

### Step 3: Restart Expo Server

**IMPORTANT:** You MUST restart the Expo server after changing .env

```powershell
cd "c:\Users\djain\Desktop\MAHAVIR ERP\driver-cash-app"

# Stop current server (Press Ctrl+C in the terminal where Expo is running)

# Start again with cache clear
npm start
```

---

### Step 4: Reload the App

On your phone in Expo Go:
1. Shake the device
2. Tap "Reload"
3. Or close Expo Go and scan QR code again

---

## ✅ **Verification Checklist:**

Before testing login:

- [ ] Backend server is running on port 5000
- [ ] Computer and phone are on the **SAME WiFi network**
- [ ] .env file has the correct IP address
- [ ] Expo server restarted after .env change
- [ ] App reloaded on device

---

## 🔍 **Testing Connection:**

### Test 1: Check Backend is Running

Open browser on your phone and visit:
```
http://YOUR_IP:5000/health
```

**Example:** `http://192.168.29.143:5000/health`

**Expected:** Should show "OK" or health status

**If fails:** Backend isn't accessible - check firewall

---

### Test 2: Check API Endpoint

Open browser on your phone:
```
http://YOUR_IP:5000/api/auth/health
```

**If this works but app doesn't:**
- Clear Expo cache
- Reinstall app on device

---

## 🚨 **Common Issues:**

### Issue 1: Different WiFi Networks
**Problem:** Computer on WiFi, phone on mobile data  
**Solution:** Connect both to the same WiFi network

### Issue 2: Firewall Blocking
**Problem:** Windows Firewall blocking port 5000  
**Solution:**
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="Node 5000" dir=in action=allow protocol=TCP localport=5000
```

### Issue 3: Backend Not Running
**Problem:** Backend server crashed or not started  
**Solution:**
```powershell
cd "c:\Users\djain\Desktop\MAHAVIR ERP\backend"
npm start
```

### Issue 4: Wrong IP in .env
**Problem:** IP changed (happens with DHCP)  
**Solution:** Run `ipconfig` again and update .env

### Issue 5: Cached Configuration
**Problem:** App still using old IP  
**Solution:**
```powershell
# In driver-cash-app folder
Remove-Item -Recurse -Force .expo
npm start
```

---

## 📱 **Expected Behavior After Fix:**

1. Open app
2. See login screen
3. Enter credentials:
   - Phone: `9876543210`
   - Password: `driver123`
4. **See in logs:**
   ```
   🌐 API URL: http://192.168.29.143:5000/api
   🔐 Attempting login for: 9876543210
   📤 POST /auth/login
   ✅ POST /auth/login - 200
   ```
5. **Navigate to Home screen** (NO ERRORS!)

---

## 🔧 **Advanced Troubleshooting:**

### Check if Backend is Accessible

From PowerShell:
```powershell
curl http://192.168.29.143:5000/health
```

### Check Network Connectivity

```powershell
ping 192.168.29.143
```

### View All Network Adapters

```powershell
Get-NetIPAddress -AddressFamily IPv4
```

---

## 📝 **Current Configuration:**

**Backend Server:**
- Running: ✅ (Port 5000 already in use = server is running)
- URL: `http://localhost:5000`

**Expo Server:**
- Running: ✅
- URL: `exp://192.168.29.143:8081`

**Required:**
- Backend must be accessible at: `http://192.168.29.143:5000`

---

## ✅ **Next Steps:**

1. **Find your IP address** using `ipconfig`
2. **Update `.env`** file with correct IP
3. **Restart Expo** server (Ctrl+C, then `npm start`)
4. **Reload app** on device
5. **Try login** again

The network error will be fixed once the IP addresses match! 🎯
