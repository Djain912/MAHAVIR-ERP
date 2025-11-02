/**
 * Layout Component
 * Main layout wrapper with sidebar and header
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaTruck, FaUsers, FaStore, FaCubes, FaChartBar, FaBars, FaTimes, FaSignOutAlt, FaMoneyBillWave, FaWarehouse, FaFilePdf, FaMoneyCheck, FaCalendarCheck, FaFileInvoiceDollar, FaReceipt, FaCashRegister, FaClipboardList, FaRecycle } from 'react-icons/fa';
import { logout, getStoredUser } from '../services/authService';
import { toast } from 'react-toastify';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: FaHome },
    { path: '/stock-intake', label: 'Purchase', icon: FaBox },
    { path: '/dispatch', label: 'Driver Dispatch', icon: FaTruck },
    { path: '/users', label: 'User Management', icon: FaUsers },
    { path: '/retailers', label: 'Retailers', icon: FaStore },
    { path: '/wholesalers', label: 'Wholesalers', icon: FaWarehouse },
    { path: '/products', label: 'Products', icon: FaCubes },
    { path: '/cash-reconciliation', label: 'Cash Reconciliation', icon: FaMoneyBillWave },
    { path: '/driver-collections', label: 'Driver Collections', icon: FaClipboardList },
    { path: '/cheques', label: 'Cheque Management', icon: FaMoneyCheck },
    { path: '/attendance', label: 'Attendance', icon: FaCalendarCheck },
    { path: '/salary', label: 'Salary (Old)', icon: FaFileInvoiceDollar },
    { path: '/salary-new', label: 'Salary Management', icon: FaFileInvoiceDollar },
    { path: '/expenses', label: 'Expense Tracking', icon: FaReceipt },
    { path: '/counter-sales', label: 'Counter Sales', icon: FaCashRegister },
    { path: '/picklist-extraction', label: 'PickList Extraction', icon: FaFilePdf },
    { path: '/rgb-reconciliation', label: 'RGB Reconciliation', icon: FaRecycle },
    { path: '/reports', label: 'Reports', icon: FaChartBar },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside
        className={`bg-black text-white transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden fixed lg:relative h-screen z-20`}
      >
        <div className={`p-4 h-full flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          <div className="flex items-center justify-between mb-8 px-2">
            {sidebarOpen && <h1 className="text-xl font-bold whitespace-nowrap">Coca-Cola ERP</h1>}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <nav className="space-y-1 overflow-y-auto flex-1 pr-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-lg'
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon className="flex-shrink-0" size={20} />
                  {sidebarOpen && <span className="whitespace-nowrap text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-black hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <FaBars size={24} />
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-black">{user?.name}</p>
              <p className="text-xs text-gray-500 font-medium">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-auto bg-white">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
