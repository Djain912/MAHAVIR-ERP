@echo off
echo ========================================
echo    YOUR NETWORK IP ADDRESSES
echo ========================================
echo.
ipconfig | findstr /i "IPv4"
echo.
echo ========================================
echo INSTRUCTIONS:
echo 1. Copy one of the IPv4 addresses above
echo 2. Update the .env file in driver-cash-app folder:
echo    EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api
echo 3. Restart the driver app (npm start)
echo ========================================
pause
