# 🔧 Quick IP Change Guide

## When Your IP Changes (Network Switch)

### 1️⃣ Get Your New IP
```bash
# Double-click one of these:
GET_IP.bat
GET_IP.ps1

# Or manually:
ipconfig
# Look for "IPv4 Address"
```

### 2️⃣ Update Configuration Files

**For Driver App** (React Native):
```bash
# File: driver-cash-app/.env
EXPO_PUBLIC_API_URL=http://YOUR_NEW_IP:5000/api
```

**For Admin Dashboard** (if accessing from another device):
```bash
# File: admin-dashboard/.env
VITE_API_URL=http://YOUR_NEW_IP:5000/api
```

### 3️⃣ Restart Services

```bash
# Restart driver app
cd driver-cash-app
npm start
# Press 'r' to reload

# Restart admin dashboard (only if you changed its .env)
cd admin-dashboard
npm run dev
```

---

## 📝 Quick Copy-Paste Template

After getting your IP from `GET_IP.bat`, copy this and fill in your IP:

```properties
# Driver App (.env file)
EXPO_PUBLIC_API_URL=http://___.___.___.__:5000/api

# Admin Dashboard (.env file) - usually keep as localhost
VITE_API_URL=http://localhost:5000/api
```

---

## ⚠️ Common Scenarios

### Scenario 1: Home WiFi
- IP usually: `192.168.1.x` or `192.168.0.x`
- Update driver app `.env`
- Keep dashboard as `localhost`

### Scenario 2: Mobile Hotspot
- IP usually: `192.168.43.1` or `172.20.10.x`
- Update driver app `.env`
- Keep dashboard as `localhost`

### Scenario 3: Office Network
- IP usually: `10.0.0.x` or `172.16.x.x`
- Update driver app `.env`
- Keep dashboard as `localhost`

---

## ✅ Verification

Test if everything works:

**From Phone Browser:**
```
http://YOUR_IP:5000/health
```
Should show: `{"success": true, "message": "Server is running"}`

**From Computer Browser:**
```
http://localhost:5000/health
http://localhost:3000
```

---

## 🎯 Pro Tip: Save IP Configs

Create multiple `.env` files for quick switching:

```bash
# driver-cash-app/
.env.home       # Home WiFi IP
.env.office     # Office WiFi IP
.env.hotspot    # Mobile hotspot IP
```

Copy the right one when you switch networks:
```bash
copy .env.home .env
```

---

## 🆘 Still Not Working?

1. **Check WiFi**: Phone and computer on SAME network?
2. **Check Firewall**: Allow Node.js in Windows Firewall
3. **Restart Backend**: Stop and start backend server
4. **Clear Cache**: In driver app, clear cache and rebuild
5. **Check Port**: Make sure port 5000 is not blocked

---

See `NETWORK_SETUP.md` for detailed troubleshooting.
