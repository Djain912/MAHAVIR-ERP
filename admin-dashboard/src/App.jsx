/**
 * Main App Component
 * Root component with routing
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import { isAuthenticated } from './services/authService';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockIntake from './pages/StockIntake';
import DriverDispatch from './pages/DriverDispatch';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import RetailerManagement from './pages/RetailerManagement';
import ProductManagement from './pages/ProductManagement';
import WholesalerManagement from './pages/WholesalerManagement';
import CashReconciliation from './pages/CashReconciliation';
import PickListExtraction from './pages/PickListExtraction';
import RGBReconciliation from './pages/RGBReconciliation';
import ChequeManagement from './pages/ChequeManagement';
import AttendanceMarking from './pages/AttendanceMarking';
import SalaryManagement from './pages/SalaryManagement';
import SalaryManagementNew from './pages/SalaryManagementNew';
import ExpenseTracking from './pages/ExpenseTracking';
import CounterSales from './pages/CounterSales';
import DriverCollectionsManagement from './pages/DriverCollectionsManagement';

// Layout
import Layout from './components/Layout';

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="stock-intake" element={<StockIntake />} />
          <Route path="dispatch" element={<DriverDispatch />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="retailers" element={<RetailerManagement />} />
          <Route path="wholesalers" element={<WholesalerManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="cash-reconciliation" element={<CashReconciliation />} />
          <Route path="picklist-extraction" element={<PickListExtraction />} />
          <Route path="rgb-reconciliation" element={<RGBReconciliation />} />
          <Route path="cheques" element={<ChequeManagement />} />
          <Route path="attendance" element={<AttendanceMarking />} />
          <Route path="salary" element={<SalaryManagement />} />
          <Route path="salary-new" element={<SalaryManagementNew />} />
          <Route path="expenses" element={<ExpenseTracking />} />
          <Route path="counter-sales" element={<CounterSales />} />
          <Route path="driver-collections" element={<DriverCollectionsManagement />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
