# Coca-Cola Distributor ERP System

A complete, production-ready ERP system for Coca-Cola distributors built with Node.js, Express, MongoDB, React, and React Native.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Default Credentials](#default-credentials)
- [Environment Variables](#environment-variables)

## ✨ Features

### Backend Features
- JWT-based authentication for Admins and Drivers
- Comprehensive error handling and input validation
- MongoDB database with future-proof schema design
- Cloudinary integration for cheque image storage
- Role-based access control (Admin, Supervisor, Driver)
- Modular architecture (Controllers → Services → Models → Routes)
- **NEW:** Wholesaler management with credit tracking
- **NEW:** Cash collection tracking with denominations
- **NEW:** Retail vs Wholesale dispatch categories

### Admin Dashboard Features
- Stock intake management
- Driver stock assignment with cash denominations
- **NEW:** Dual dispatch system (Retail/Wholesale)
- User management (Add/Remove drivers, Reset passwords)
- Retailer management
- **NEW:** Wholesaler management (credit limits, GST, outstanding balances)
- Product management
- **NEW:** Cash reconciliation with denomination breakdown
- Daily reconciliation reports
- Real-time dashboard with statistics

### Driver Mobile App Features
- Login/Logout
- View assigned stock
- Select retailer from list
- Sales entry (items sold, cash, cheque, credit, empty bottles)
- Upload cheque photos to Cloudinary
- **NEW:** Cash collection with denomination input (Pending - New app to be created)
- Daily summary view
- Offline support (optional with AsyncStorage)

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Joi for validation
- Cloudinary for image storage
- Multer for file uploads

**Admin Dashboard:**
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- React Icons
- React Toastify

**Driver Mobile App:**
- React Native (Expo)
- React Navigation
- Axios
- AsyncStorage
- Expo Image Picker
- Expo Location

## 📁 Folder Structure

```
erp-system/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── middlewares/       # Auth, validation, error handling
│   │   ├── utils/             # Helper functions
│   │   └── index.js           # Express server entry
│   ├── package.json
│   └── .env.example
│
├── admin-dashboard/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Dashboard pages
│   │   ├── services/          # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
├── driver-app/
│   ├── src/
│   │   ├── components/        # Reusable RN components
│   │   ├── screens/           # App screens
│   │   ├── services/          # API calls
│   │   ├── navigation/        # React Navigation setup
│   │   └── App.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- Expo CLI (for mobile app)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd erp-system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Important: Update MongoDB URI, JWT secret, and Cloudinary credentials
```

**Backend .env Configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/coca_cola_erp
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:3000
```

### 3. Admin Dashboard Setup

```bash
cd ../admin-dashboard
npm install

# Create .env file
cp .env.example .env

# Edit .env
VITE_API_URL=http://localhost:5000/api
```

### 4. Driver Mobile App Setup

```bash
cd ../driver-app
npm install

# Create .env file
cp .env.example .env

# Edit .env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
# For testing on physical device, use your computer's IP
# EXPO_PUBLIC_API_URL=http://192.168.1.x:5000/api
```

## 🏃‍♂️ Running the Application

### Start MongoDB
```bash
# Make sure MongoDB is running
mongod
```

### Start Backend Server
```bash
cd backend

# Seed database with sample data (first time only)
npm run seed

# Start development server
npm run dev
```

The backend will be available at `http://localhost:5000`

### Start Admin Dashboard
```bash
cd admin-dashboard
npm run dev
```

The admin dashboard will be available at `http://localhost:3000`

### Start Driver Mobile App
```bash
cd driver-app

# For Expo Go
npm start

# For Android emulator
npm run android

# For iOS simulator (Mac only)
npm run ios

# For web
npm run web
```

## 🔑 Default Credentials

After running `npm run seed` in the backend:

**Admin:**
- Phone: 9999999999
- Password: admin123

**Driver:**
- Phone: 9876543210
- Password: driver123

**Supervisor:**
- Phone: 9876543212
- Password: supervisor123

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login user
```json
{
  "phone": "9999999999",
  "password": "admin123"
}
```

#### GET /api/auth/me
Get current user (requires authentication)

#### POST /api/auth/logout
Logout user (requires authentication)

### Driver Endpoints (Admin only)

#### POST /api/drivers
Create new driver
```json
{
  "name": "John Doe",
  "phone": "9876543213",
  "password": "password123",
  "role": "Driver"
}
```

#### GET /api/drivers
Get all drivers (supports filtering by role and active status)

#### PUT /api/drivers/:id
Update driver

#### DELETE /api/drivers/:id
Deactivate driver

#### PUT /api/drivers/:id/password
Reset driver password

### Retailer Endpoints

#### POST /api/retailers
Create new retailer
```json
{
  "name": "ABC Store",
  "address": "123 Main St",
  "phone": "9111111111",
  "route": "Route A"
}
```

#### GET /api/retailers
Get all retailers

#### GET /api/retailers/routes/all
Get all unique routes

### Wholesaler Endpoints (NEW)

#### POST /api/wholesalers
Create new wholesaler (Admin/Supervisor)
```json
{
  "name": "Rajesh Kumar",
  "businessName": "Kumar Distributors",
  "phone": "9111111111",
  "email": "rajesh@example.com",
  "address": "123 Market Road",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "gstNumber": "27AABCU9603R1ZM",
  "creditLimit": 500000,
  "outstandingBalance": 0,
  "active": true
}
```

#### GET /api/wholesalers
Get all wholesalers (supports search, filters, pagination)

#### GET /api/wholesalers/:id
Get wholesaler by ID

#### PUT /api/wholesalers/:id
Update wholesaler (Admin/Supervisor)

#### DELETE /api/wholesalers/:id
Delete wholesaler (Admin only)

### Product Endpoints

#### POST /api/products
Create new product
```json
{
  "name": "Coca-Cola",
  "size": "500ml",
  "pricePerUnit": 20
}
```

#### GET /api/products
Get all products

### Stock Endpoints (Admin/Supervisor only)

#### POST /api/stock
Create stock intake
```json
{
  "productId": "65abc123...",
  "quantity": 100,
  "batchNo": "BATCH001",
  "dateReceived": "2024-01-15",
  "ratePerUnit": 18
}
```

#### GET /api/stock/available/summary
Get available stock summary

#### GET /api/stock/alerts/low
Get low stock alerts

### Dispatch Endpoints

#### POST /api/dispatches
Create driver dispatch
```json
{
  "driverId": "65abc123...",
  "dispatchType": "Retail",
  "date": "2024-01-15",
  "items": [
    {
      "productId": "65xyz789...",
      "quantity": 50
    }
  ],
  "cashDenominations": [
    { "noteValue": 100, "noteCount": 10 },
    { "noteValue": 50, "noteCount": 20 }
  ]
}
```

#### GET /api/dispatches/driver/:driverId/active
Get active dispatch for driver

### Cash Collection Endpoints (NEW)

#### POST /api/cash-collections
Submit cash collection (Driver/Admin/Supervisor)
```json
{
  "driverId": "65abc123...",
  "dispatchId": "65def456...",
  "collectionDate": "2024-01-15",
  "denominations": [
    { "noteValue": 2000, "noteCount": 5 },
    { "noteValue": 500, "noteCount": 10 },
    { "noteValue": 100, "noteCount": 20 }
  ],
  "expectedCash": 15000,
  "notes": "Optional notes"
}
```

#### GET /api/cash-collections
Get all cash collections (filtered by role, status, date)

#### GET /api/cash-collections/:id
Get cash collection by ID

#### GET /api/cash-collections/stats/:driverId
Get driver cash statistics

#### PATCH /api/cash-collections/:id/verify
Verify cash collection (Admin/Supervisor)

#### PATCH /api/cash-collections/:id/reconcile
Reconcile cash collection (Admin only)

#### PUT /api/cash-collections/:id
Update cash collection (before verification)

#### DELETE /api/cash-collections/:id
Delete cash collection (Admin only)

### Sale Endpoints

#### POST /api/sales
Create sale
```json
{
  "driverId": "65abc123...",
  "retailerId": "65def456...",
  "dispatchId": "65ghi789...",
  "productsSold": [
    {
      "productId": "65xyz789...",
      "quantity": 10,
      "ratePerUnit": 20
    }
  ],
  "payments": {
    "cash": 150,
    "cheque": [
      {
        "chequeNumber": "CHQ001",
        "amount": 50,
        "photoUrl": "https://cloudinary.../cheque.jpg"
      }
    ],
    "credit": 0
  },
  "emptyBottlesReturned": 5,
  "geoLocation": {
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

#### POST /api/sales/upload-cheque
Upload cheque image (multipart/form-data with 'cheque' field)

#### GET /api/sales/reconciliation/:dispatchId
Get reconciliation report for dispatch

## 📊 MongoDB Collections

1. **drivers**: Driver/Admin user accounts
2. **retailers**: Retailer/shop information
3. **wholesalers**: Wholesaler/distributor information (NEW)
4. **products**: Product catalog
5. **stockins**: Warehouse stock intake records
6. **driverdispatches**: Driver dispatch assignments (updated with dispatchType)
7. **driverdispatchitems**: Items in each dispatch
8. **cashdenominations**: Cash assigned to drivers
9. **cashcollections**: Daily cash collection tracking (NEW)
10. **sales**: Sales transactions

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation using Joi
- Secure HTTP headers
- CORS protection
- Environment variable protection

## 🎨 UI Features

- Clean, modern, responsive design
- Tailwind CSS for styling
- Mobile-first approach
- Toast notifications for user feedback
- Loading states
- Error handling
- Modal dialogs
- Form validation

## 🧪 Testing

The system includes sample seed data for testing:
- 4 drivers (1 Admin, 1 Supervisor, 2 Drivers)
- 6 retailers across 3 routes
- 16 products (various Coca-Cola products)

## 📝 Notes

- The MongoDB schema is designed to be modular for easy future migration to SQL/hybrid databases
- All collections use reference IDs for relational consistency
- Stock management uses FIFO (First In, First Out) methodology
- The system supports offline functionality in the mobile app (optional)
- Cheque images are stored in Cloudinary with URLs saved in MongoDB
- **NEW:** Cash collections automatically calculate variance (expected vs collected)
- **NEW:** Wholesaler credit limits prevent over-extension
- **NEW:** Three-stage verification: Submitted → Verified → Reconciled

## 📖 Additional Documentation

- **QUICK_START_GUIDE.md** - User guide for new features (Wholesaler & Cash Collection)
- **PROJECT_STATUS.md** - Complete system status and pending tasks
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

## 🚀 What's New (Version 2.0)

### October 2025 Update

**Backend Enhancements:**
- ✅ Wholesaler management module (complete CRUD)
- ✅ Cash collection tracking with denomination breakdown
- ✅ Dispatch type categorization (Retail vs Wholesale)
- ✅ Auto-calculation of cash variance
- ✅ Three-stage cash verification workflow

**Dashboard Enhancements:**
- ✅ Wholesaler Management page with credit tracking
- ✅ Cash Reconciliation page with detailed views
- ✅ Updated Driver Dispatch with type selection
- ✅ Enhanced navigation with new menu items

**Pending:**
- ⏳ New driver mobile app for cash collection
- ⏳ Mobile app with denomination input interface

## 🤝 Contributing

This is a production-ready ERP system. For any modifications:
1. Maintain code modularity
2. Follow the established patterns
3. Add proper validation
4. Update documentation
5. Test thoroughly

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, please refer to the code comments or contact the development team.

---

**Built with ❤️ for Coca-Cola Distributors**
