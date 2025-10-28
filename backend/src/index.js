/**
 * Express Server Entry Point
 * Main application file for Coca-Cola Distributor ERP Backend
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';

// Import utilities
import connectDB from './utils/database.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import retailerRoutes from './routes/retailerRoutes.js';
import wholesalerRoutes from './routes/wholesalerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import dispatchRoutes from './routes/dispatchRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import cashCollectionRoutes from './routes/cashCollectionRoutes.js';
import pickListExtractedRoutes from './routes/pickListExtractedRoutes.js';
import chequeManagementRoutes from './routes/chequeManagementRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import salarySlipRoutes from './routes/salarySlipRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import counterSaleRoutes from './routes/counterSaleRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/wholesalers', wholesalerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/cash-collections', cashCollectionRoutes);
app.use('/api/picklists-extracted', pickListExtractedRoutes);
app.use('/api/cheques', chequeManagementRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary-slips', salarySlipRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/counter-sales', counterSaleRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Coca-Cola Distributor ERP API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💊 Health check: http://localhost:${PORT}/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

export default app;
