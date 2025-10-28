# Driver Cash Collection App - User Guide

## 📱 Overview

The Driver Cash Collection App is a mobile application built with React Native and Expo that enables drivers to:
- Submit daily cash collections with denominations
- Track cheque, online, and credit payments
- View collection history and variance reports
- Monitor active dispatch details

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo Go app on your mobile device
- Backend server running on `http://192.168.251.180:5000`

### Installation

1. **Navigate to the app directory:**
   ```bash
   cd driver-cash-app
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure API URL:**
   - Edit `.env` file if needed:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.251.180:5000/api
   ```

4. **Start the app:**
   ```bash
   npm start
   ```

5. **Scan the QR code** with Expo Go app on your device

## 📲 App Features

### 1. Login Screen
- **Phone Number**: Enter 10-digit phone number
- **Password**: Secure password entry
- **Auto-login**: Automatically logs in if credentials are saved
- **Role Validation**: Only allows drivers to access the app

**Test Driver Credentials:**
- Phone: `9876543210`
- Password: `driver123`

### 2. Home Dashboard
- **Active Dispatch Card**:
  - Dispatch date and type (Retail/Wholesale)
  - Stock value allocated
  - Cash given to driver
  - Active status badge

- **Statistics Grid**:
  - Total collections submitted
  - Total cash collected
  - Total variance (color-coded)
  - Verified collections count

- **Action Buttons**:
  - Submit Cash Collection
  - View History

- **Pull-to-Refresh**: Swipe down to refresh data

### 3. Cash Collection Screen

#### A. Dispatch Information
- Shows current dispatch details
- Display cash given amount

#### B. Cash Denominations (₹)
Enter the count of each denomination received:
- ₹2000 notes
- ₹500 notes
- ₹200 notes
- ₹100 notes
- ₹50 notes
- ₹20 notes
- ₹10 notes/coins
- ₹5 coins
- ₹2 coins
- ₹1 coins

**Auto-calculation**: Total value automatically calculated for each denomination and grand total.

#### C. Other Payment Methods
- **Cheque Received**: Enter total cheque amount
- **Online Payment**: Enter UPI/Card payment amount
- **Credit Given**: Enter total credit given to retailers

#### D. Summary Section
- **Expected Cash**: Enter the expected amount
- **Breakdown Display**:
  - Cash collected (from denominations)
  - Cheque received
  - Online payment received
  - Credit given to retailers
  - **Total Collected** = Cash + Cheque + Online
  - **Variance** = (Total Collected + Credit) - Expected

**Variance Color Coding:**
- 🟢 **Green**: Exact match (₹0)
- 🟡 **Yellow**: Minor variance (<₹100)
- 🔴 **Red**: Significant shortage/excess (≥₹100)

#### E. Notes (Optional)
- Add notes for discrepancies or special situations
- 500 character limit

#### F. Submit
- Confirmation alert shows complete summary
- Submits to backend for verification

### 4. Collection History
- **List View**: All submitted collections
- **Status Badges**: 
  - Submitted (Yellow)
  - Verified (Blue)
  - Reconciled (Green)
- **Quick Stats**: Expected, Collected, Variance
- **Verification Status**: Shows verified collections
- **Tap to View Details**: Navigate to detailed view

### 5. Collection Details
- **Full Breakdown**:
  - Submission date and time
  - Status badge
  - Summary (Expected, Collected, Variance)
  
- **Denomination Table**:
  - Each denomination with count and total
  - Grand total
  
- **Other Payments**:
  - Cheque received
  - Online payment received
  - Credit given
  - Total received
  
- **Notes**: Any notes added during submission
- **Verification Info**: Verified by and timestamp

## 🔄 Typical Workflow

### Daily Cash Collection Process:

1. **Login** with driver credentials

2. **View Active Dispatch** on home screen
   - Check dispatch type (Retail/Wholesale)
   - Note the cash given amount

3. **Submit Cash Collection**:
   - Tap "Submit Cash Collection" button
   - Count all cash denominations
   - Enter denomination counts
   - Add cheque amounts (if any)
   - Add online payment amounts (if any)
   - Add credit given (if any)
   - Enter expected cash amount
   - Review variance calculation
   - Add notes if variance exists
   - Confirm and submit

4. **View History**:
   - Check submission status
   - Monitor variance
   - Wait for verification

5. **View Details**:
   - Tap any collection in history
   - View full breakdown
   - Check verification status

## 📊 Data Mapping

### Cash Collection Submission Format:
```json
{
  "driverId": "driver_id",
  "dispatchId": "dispatch_id",
  "collectionDate": "2025-10-24",
  "denominations": [
    {"noteValue": 2000, "noteCount": 5, "totalValue": 10000},
    {"noteValue": 500, "noteCount": 10, "totalValue": 5000},
    ...
  ],
  "totalCashReceived": 15000,
  "totalChequeReceived": 5000,
  "totalOnlineReceived": 3000,
  "totalCreditGiven": 2000,
  "expectedCash": 25000,
  "notes": "Optional notes"
}
```

### Variance Calculation:
```
Total Received = Cash + Cheque + Online
Total Accounted = Total Received + Credit
Variance = Total Accounted - Expected

Example:
Cash: ₹15,000
Cheque: ₹5,000
Online: ₹3,000
Credit: ₹2,000
Expected: ₹25,000

Variance = (15000 + 5000 + 3000 + 2000) - 25000 = ₹0 ✅
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Automatic Token Refresh**: Handles token expiration
- **Secure Storage**: Credentials stored in AsyncStorage
- **Role-Based Access**: Only drivers can access the app
- **Auto-logout**: On token expiration or unauthorized access

## 📱 Permissions Required

- **Location**: For tracking driver location (future feature)
- **Camera**: For capturing cheque photos (future feature)

## 🐛 Troubleshooting

### Cannot Connect to Server
- Ensure backend is running on `http://192.168.251.180:5000`
- Check if mobile device is on the same network
- Verify API URL in `.env` file

### Login Failed
- Verify phone number is 10 digits
- Check password is correct
- Ensure driver account exists in database
- Check user role is "Driver"

### No Active Dispatch
- Contact admin to create a dispatch
- Check dispatch date is today
- Verify dispatch is not already completed

### Cannot Submit Collection
- Ensure all required fields are filled
- Check expected cash is entered
- Verify at least one denomination has a count > 0
- Check network connection

### Variance Alert
- Double-check denomination counts
- Verify cheque and online amounts
- Ensure credit amount is accurate
- Add notes explaining variance
- Contact admin if discrepancy is significant

## 🔄 Updates & Sync

- **Auto-refresh**: Pull down on any screen to refresh
- **Real-time Calculation**: All totals update automatically
- **Offline Mode**: Not supported (requires active internet)

## 📞 Support

For technical issues or questions:
- Contact: Admin Dashboard
- Phone: Check with management
- Email: Check with management

## 🎯 Best Practices

1. **Count Cash Carefully**: Double-check denomination counts
2. **Separate Payments**: Keep cash, cheque, and online separate
3. **Track Credit**: Note down credit given to retailers
4. **Add Notes**: Explain any variance immediately
5. **Submit Daily**: Submit collections at end of shift
6. **Verify Status**: Check verification status next day
7. **Keep Records**: Review history for reference

## 📈 Performance Tips

- Close other apps for better performance
- Ensure stable internet connection
- Clear app cache if slow
- Update Expo Go app regularly
- Keep device updated

## 🔮 Upcoming Features

- Photo capture for cheques
- GPS location tracking
- Offline mode with sync
- Digital signature
- Real-time notifications
- Export reports to PDF
- Multi-language support

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Platform**: React Native + Expo  
**Backend API**: Node.js + Express + MongoDB
