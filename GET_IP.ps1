# Get Network IP Address Helper Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   YOUR NETWORK IP ADDRESSES" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get all IPv4 addresses
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*"
} | Select-Object IPAddress, InterfaceAlias

if ($ipAddresses.Count -gt 0) {
    Write-Host "Available IP Addresses:" -ForegroundColor Green
    Write-Host ""
    foreach ($ip in $ipAddresses) {
        Write-Host "  IP: " -NoNewline -ForegroundColor White
        Write-Host "$($ip.IPAddress)" -ForegroundColor Yellow -NoNewline
        Write-Host " ($($ip.InterfaceAlias))" -ForegroundColor Gray
    }
} else {
    Write-Host "No network IP addresses found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Copy one of the IPv4 addresses above" -ForegroundColor White
Write-Host "2. Open: driver-cash-app\.env" -ForegroundColor White
Write-Host "3. Update: EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api" -ForegroundColor White
Write-Host "4. Restart the driver app (npm start)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
