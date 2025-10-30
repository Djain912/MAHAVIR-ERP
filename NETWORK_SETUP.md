# Network Configuration Guide

## Quick Setup for Driver App Network Access

The backend and admin dashboard are now configured to accept connections from **any IP address** on your network. This means you no longer need to reconfigure CORS or allowed origins.

### ✅ What's Configured:

1. **Backend Server** (`backend/src/index.js`):
   - Accepts connections from any IP (`0.0.0.0`)
   - CORS enabled for all origins (`origin: '*'`)
   - All HTTP methods allowed (GET, POST, PUT, DELETE, etc.)

2. **Admin Dashboard** (`admin-dashboard/vite.config.js`):
   - Accessible from any device on network (`host: '0.0.0.0'`)

3. **Driver App**:
   - Uses environment variable for easy IP configuration
   - Just update `.env` file when your IP changes

---

## 🚀 How to Use:

### Step 1: Find Your Computer's IP Address

**Option A - Use the Helper Script:**
```bash
# Double-click this file in Windows Explorer:
GET_IP.bat
```

**Option B - Manual Method:**
```bash
# Open Command Prompt and run:
ipconfig

# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.0.155
```

### Step 2: Update Driver App Configuration

1. Open `driver-cash-app/.env` file
2. Update the IP address:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:5000/api
   ```
   Example:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.155:5000/api
   ```

### Step 3: Restart Everything

```bash
# 1. Restart Backend (if running)
cd backend
npm start

# 2. Restart Admin Dashboard (if running)
cd admin-dashboard
npm run dev

# 3. Restart Driver App
cd driver-cash-app
npm start
# Press 'r' to reload the app on your phone
```

---

## 📱 Accessing Services:

### From Your Computer:
- **Backend API**: `http://localhost:5000`
- **Admin Dashboard**: `http://localhost:3000`

### From Your Phone (same WiFi network):
Replace `YOUR_IP` with your computer's IP address:
- **Backend API**: `http://YOUR_IP:5000`
- **Admin Dashboard**: `http://YOUR_IP:3000`
- **Driver App**: Configure in `.env` file

---

## 🔧 Troubleshooting:

### Driver App Can't Connect to Backend:

1. **Check if devices are on same WiFi network**
   - Computer and phone must be on the same network
   - Corporate/Public WiFi may block device-to-device communication

2. **Verify IP Address is correct**
   - Run `GET_IP.bat` to get current IP
   - Update `.env` file in driver-cash-app
   - Restart the driver app

3. **Check Windows Firewall**
   ```bash
   # Allow Node.js through firewall
   # Go to: Windows Defender Firewall > Allow an app
   # Find "Node.js" and enable for Private and Public networks
   ```

4. **Test Backend Connection**
   ```bash
   # From your phone's browser, visit:
   http://YOUR_IP:5000/health
   
   # You should see:
   # {"success": true, "message": "Server is running"}
   ```

### Admin Dashboard Not Accessible from Network:

1. Check if Vite dev server is running
2. Access using `http://YOUR_IP:3000` (not localhost)
3. Clear browser cache and reload

---

## 🎯 Benefits of This Setup:

✅ **No More CORS Issues**: Backend accepts requests from any origin
✅ **Network Accessible**: All services can be accessed from network devices
✅ **Easy IP Changes**: Just update `.env` file, no code changes needed
✅ **One-Time Setup**: Configure once, works on any network
✅ **Mobile Development**: Easy testing on real devices

---

## 📝 Configuration Files Changed:

1. **`backend/src/index.js`**:
   ```javascript
   // CORS - Allow all origins
   app.use(cors({
     origin: '*',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));

   // Listen on all network interfaces
   app.listen(PORT, '0.0.0.0', () => {...});
   ```

2. **`admin-dashboard/vite.config.js`**:
   ```javascript
   server: {
     port: 3000,
     host: '0.0.0.0', // Allow access from any IP
     open: true
   }
   ```

3. **`driver-cash-app/.env`**:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api
   ```

---

## 🔒 Security Note:

This configuration is designed for **development on local networks**. For production deployment:

1. Configure proper CORS with specific allowed origins
2. Use HTTPS with SSL certificates
3. Implement rate limiting
4. Add IP whitelisting if needed
5. Use environment-specific configurations

---

## 💡 Pro Tips:

1. **Save your IP**: Keep a note of your most used IPs (home WiFi, office WiFi)
2. **Quick Switch**: Create multiple `.env` files (`.env.home`, `.env.office`) and swap them as needed
3. **QR Code**: Expo Metro Bundler shows a QR code - scan it to connect automatically
4. **Network Printer**: If you can print to a network printer from your phone, then device-to-device communication works

---

For more help, check the main README.md or contact support.
