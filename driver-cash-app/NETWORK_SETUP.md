# 📱 Driver App Network Connection Guide

## Problem: "Network Error" when app tries to connect to backend

The driver app can't reach the backend server because of incorrect IP configuration.

---

## ✅ **SOLUTION** (Updated your IP automatically)

I've updated `.env` with your current IP: **`192.168.0.155`**

### **Next Steps:**

1. **Restart the Expo app** to load the new IP:
   - Press `Ctrl + C` in the terminal running Expo
   - Run `npm start` again
   
2. **Reload the app** on your device:
   - Shake your phone to open dev menu
   - Tap "Reload"
   
   OR in terminal press: `r` to reload

---

## 🔍 **Testing the Connection**

Once reloaded, the app should show:
```
LOG  🌐 API URL: http://192.168.0.155:5000/api
```

Test the backend is accessible from your phone:
- Open browser on your phone
- Visit: `http://192.168.0.155:5000/api/health`
- You should see: `{"status":"OK","message":"Server is running"}`

---

## ⚠️ **If IP Changes Later**

Your computer's IP may change if you:
- Restart your router
- Connect to different WiFi
- Restart your computer

### To fix it:

1. **Find your new IP:**
   ```powershell
   ipconfig | findstr "IPv4"
   ```
   Look for the one starting with `192.168.x.x`

2. **Update `.env` file:**
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_NEW_IP:5000/api
   ```

3. **Restart Expo and reload app**

---

## 🔐 **Firewall Check** (if still not working)

The backend needs to accept connections on port 5000:

1. Open **Windows Defender Firewall** → Advanced Settings
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → Next
4. Enter **5000** → Next
5. Allow the connection → Next
6. Check all profiles → Next
7. Name it "Backend API" → Finish

---

## ✅ **Verification Checklist**

- [ ] Backend server is running (you'll see it in terminal)
- [ ] `.env` has correct IP (`192.168.0.155`)
- [ ] Phone/emulator on same WiFi as computer
- [ ] Expo app restarted with new config
- [ ] App reloaded on device
- [ ] Firewall allows port 5000

---

## 📝 **Quick Commands**

**Restart driver app:**
```powershell
cd "C:\Users\djain\Desktop\MAHAVIR ERP\driver-cash-app"
npm start
```

**Check backend is running:**
```powershell
cd "C:\Users\djain\Desktop\MAHAVIR ERP\backend"
node src/index.js
```

**Find your IP again:**
```powershell
ipconfig | findstr "IPv4"
```
