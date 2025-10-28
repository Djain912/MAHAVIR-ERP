/**
 * Dashboard Page
 * Comprehensive ERP Analytics Dashboard with nested tabs and filters
 */

import React, { useEffect, useState } from 'react';
import { 
  FaBox, FaTruck, FaUsers, FaStore, FaChartLine, FaDollarSign, 
  FaMoneyBillWave, FaCalendarAlt, FaFileInvoice, FaWarehouse,
  FaChartBar, FaChartPie, FaFilter, FaDownload, FaReceipt,
  FaCashRegister, FaMoneyCheck, FaFileInvoiceDollar, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { getDriverStats } from '../services/driverService';
import { getStockStats, getAvailableStockSummary } from '../services/stockService';
import { getDispatchStats } from '../services/dispatchService';
import { getSaleStats } from '../services/saleService';
import { getAllRetailers } from '../services/retailerService';
import { getAllWholesalers } from '../services/wholesalerService';
import { getDailySummary as getExpenseSummary } from '../services/expenseService';
import { getDailySummary as getCounterSaleSummary } from '../services/counterSaleService';
import { getDailyAttendance as getAttendanceSummary } from '../services/attendanceService';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('sales');
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [stats, setStats] = useState({
    drivers: null,
    stock: null,
    dispatches: null,
    sales: null,
    availableStock: [],
    retailers: [],
    wholesalers: [],
    expenses: null,
    counterSales: null,
    attendance: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [
        drivers, 
        stock, 
        dispatches, 
        sales, 
        availableStock,
        retailersResponse,
        wholesalersResponse,
        expenses,
        counterSales,
        attendance
      ] = await Promise.all([
        getDriverStats(),
        getStockStats(),
        getDispatchStats(),
        getSaleStats(),
        getAvailableStockSummary(),
        getAllRetailers().catch(() => ({ data: { data: [] } })),
        getAllWholesalers().catch(() => ({ data: { data: [] } })),
        getExpenseSummary(today).catch(() => null),
        getCounterSaleSummary(today).catch(() => null),
        getAttendanceSummary(today).catch(() => null)
      ]);

      // Extract actual arrays from response.data.data structure
      const retailers = retailersResponse?.data?.data || retailersResponse?.data || [];
      const wholesalers = wholesalersResponse?.data?.data || wholesalersResponse?.data || [];

      setStats({ 
        drivers, 
        stock, 
        dispatches, 
        sales, 
        availableStock: Array.isArray(availableStock) ? availableStock : [],
        retailers: Array.isArray(retailers) ? retailers : [],
        wholesalers: Array.isArray(wholesalers) ? wholesalers : [],
        expenses,
        counterSales,
        attendance
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading analytics..." />;

  // Main Tabs Configuration
  const mainTabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'sales', label: 'Sales Analytics', icon: FaDollarSign },
    { id: 'operations', label: 'Operations', icon: FaTruck },
    { id: 'inventory', label: 'Inventory', icon: FaBox },
    { id: 'financial', label: 'Financial', icon: FaMoneyBillWave },
    { id: 'hr', label: 'HR & Attendance', icon: FaUsers }
  ];

  // Sub Tabs for Sales Analytics
  const salesSubTabs = [
    { id: 'sales', label: 'Sales Overview' },
    { id: 'wholesaler', label: 'Wholesaler Sales' },
    { id: 'retailer', label: 'Retailer Sales' },
    { id: 'counter', label: 'Counter Sales' }
  ];

  // Sub Tabs for Operations
  const operationsSubTabs = [
    { id: 'dispatch', label: 'Dispatch' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'routes', label: 'Routes' }
  ];

  // Sub Tabs for Inventory
  const inventorySubTabs = [
    { id: 'stock', label: 'Stock Levels' },
    { id: 'movements', label: 'Stock Movements' },
    { id: 'products', label: 'Product Analysis' }
  ];

  // Sub Tabs for Financial
  const financialSubTabs = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'collections', label: 'Collections' },
    { id: 'cheques', label: 'Cheques' }
  ];

  // Sub Tabs for HR
  const hrSubTabs = [
    { id: 'attendance', label: 'Attendance' },
    { id: 'salary', label: 'Salary' },
    { id: 'performance', label: 'Performance' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-100 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold text-black mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 font-medium">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-rose-600'}`}>
              {trend > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color}`}>
          <Icon className="text-white" size={28} />
        </div>
      </div>
    </Card>
  );

  // Colors for charts
  const COLORS = {
    primary: '#000000',
    secondary: '#f43f5e',
    tertiary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  const CHART_COLORS = ['#000000', '#f43f5e', '#6b7280', '#10b981', '#f59e0b', '#3b82f6'];

  // Prepare chart data
  const stockChartData = stats.availableStock.slice(0, 8).map(item => ({
    name: item.productName?.substring(0, 15) || 'Unknown',
    quantity: item.totalQuantity || 0,
    value: item.totalValue || 0
  }));

  const salesTrendData = [
    { month: 'Jan', sales: 45000, target: 50000 },
    { month: 'Feb', sales: 52000, target: 55000 },
    { month: 'Mar', sales: 48000, target: 50000 },
    { month: 'Apr', sales: 61000, target: 60000 },
    { month: 'May', sales: 55000, target: 58000 },
    { month: 'Jun', sales: 67000, target: 65000 }
  ];

  const dispatchStatusData = [
    { name: 'Completed', value: stats.dispatches?.completed?.count || 0, color: COLORS.success },
    { name: 'Active', value: stats.dispatches?.active?.count || 0, color: COLORS.warning },
    { name: 'Pending', value: stats.dispatches?.pending?.count || 0, color: COLORS.tertiary }
  ];

  const customerDistributionData = [
    { name: 'Wholesalers', value: stats.wholesalers?.length || 0, color: COLORS.primary },
    { name: 'Retailers', value: stats.retailers?.length || 0, color: COLORS.secondary }
  ];

  const driverPerformanceData = [
    { name: 'Driver A', deliveries: 45, revenue: 125000 },
    { name: 'Driver B', deliveries: 38, revenue: 98000 },
    { name: 'Driver C', deliveries: 52, revenue: 142000 },
    { name: 'Driver D', deliveries: 41, revenue: 110000 },
    { name: 'Driver E', deliveries: 35, revenue: 87000 }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-black mb-2">Dashboard</h1>
          <p className="text-gray-500 font-medium">Welcome back! Here's your business overview</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Drivers"
            value={stats.drivers?.totalDrivers || 0}
            subtitle={`${stats.drivers?.activeDrivers || 0} active`}
            icon={FaUsers}
            color="bg-black"
            trend={12}
          />
          <StatCard
            title="Total Stock Value"
            value={`₹${(stats.stock?.totalStockValue || 0).toLocaleString()}`}
            subtitle={`${stats.stock?.totalQuantityRemaining || 0} items`}
            icon={FaBox}
            color="bg-black"
            trend={8}
          />
          <StatCard
            title="Active Dispatches"
            value={stats.dispatches?.active?.count || 0}
            subtitle={`₹${(stats.dispatches?.active?.totalStockValue || 0).toLocaleString()}`}
            icon={FaTruck}
            color="bg-black"
            trend={-3}
          />
          <StatCard
            title="Total Sales"
            value={`₹${(stats.sales?.totalAmount || 0).toLocaleString()}`}
            subtitle={`${stats.sales?.totalSales || 0} transactions`}
            icon={FaChartLine}
            color="bg-rose-500"
            trend={15}
          />
        </div>

        {/* Analytics Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend Chart */}
          <Card title="Sales Trend Analysis" className="border border-gray-100">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Area type="monotone" dataKey="sales" stroke={COLORS.primary} strokeWidth={2} fill="url(#colorSales)" name="Actual Sales" />
                <Area type="monotone" dataKey="target" stroke={COLORS.secondary} strokeWidth={2} fill="url(#colorTarget)" name="Target" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Stock Distribution Chart */}
          <Card title="Top Stock Products" className="border border-gray-100">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px', fontWeight: '600' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Bar dataKey="quantity" fill={COLORS.primary} name="Quantity" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Analytics Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Dispatch Status Pie Chart */}
          <Card title="Dispatch Status" className="border border-gray-100">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dispatchStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dispatchStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Customer Distribution */}
          <Card title="Customer Distribution" className="border border-gray-100">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={customerDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Driver Performance */}
          <Card title="Driver Performance" className="border border-gray-100">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={driverPerformanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '11px', fontWeight: '600' }} />
                <YAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: '11px', fontWeight: '600' }} width={70} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }} 
                />
                <Bar dataKey="deliveries" fill={COLORS.secondary} radius={[0, 8, 8, 0]} name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

      {/* Available Stock */}
      <Card title="Available Stock Summary" className="mb-8 border border-gray-100 animate-fadeIn">
        {stats.availableStock.length === 0 ? (
          <div className="text-center py-12">
            <FaWarehouse className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400 font-medium">No stock available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batches</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {Array.isArray(stats.availableStock) && stats.availableStock.length > 0 ? (
                  stats.availableStock.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-black">{item.productName}</div>
                        <div className="text-xs text-gray-500 font-medium">{item.productSize}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                        {item.totalQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                        ₹{item.totalValue?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                        {item.batches}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium">
                      No stock data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Customers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Wholesalers */}
        <Card title="Wholesalers Summary" className="border border-gray-100 animate-fadeIn">
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Total Wholesalers</p>
                <span className="text-3xl font-bold text-black">{stats.wholesalers?.length || 0}</span>
              </div>
              <FaStore className="text-gray-600" size={36} />
            </div>
          </div>
          {stats.wholesalers && stats.wholesalers.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {stats.wholesalers.slice(0, 5).map((wholesaler) => (
                <div key={wholesaler._id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-black">{wholesaler.businessName || wholesaler.name}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">{wholesaler.phone}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Credit Limit</div>
                    <div className="text-sm font-bold text-black">₹{(wholesaler.creditLimit || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {stats.wholesalers.length > 5 && (
                <a href="/wholesalers" className="block text-center text-sm font-semibold text-rose-500 hover:text-rose-600 py-3 px-4 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors">
                  View all {stats.wholesalers.length} wholesalers →
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaStore className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400 font-medium text-sm">No wholesalers found</p>
            </div>
          )}
        </Card>

        {/* Retailers */}
        <Card title="Retailers Summary" className="border border-gray-100 animate-fadeIn">
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Total Retailers</p>
                <span className="text-3xl font-bold text-black">{stats.retailers?.length || 0}</span>
              </div>
              <FaStore className="text-gray-600" size={36} />
            </div>
          </div>
          {stats.retailers && stats.retailers.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {stats.retailers.slice(0, 5).map((retailer) => (
                <div key={retailer._id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-black">{retailer.shopName || retailer.name}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">{retailer.phone}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Credit Limit</div>
                    <div className="text-sm font-bold text-black">₹{(retailer.creditLimit || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {stats.retailers.length > 5 && (
                <a href="/retailers" className="block text-center text-sm font-semibold text-rose-500 hover:text-rose-600 py-3 px-4 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors">
                  View all {stats.retailers.length} retailers →
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaStore className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-400 font-medium text-sm">No retailers found</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="border border-gray-100 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/stock-intake"
            className="group flex items-center justify-center space-x-3 p-6 border-2 border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 transition-all duration-300"
          >
            <FaBox className="text-black group-hover:scale-110 transition-transform" size={24} />
            <span className="font-semibold text-black">Add Stock</span>
          </a>
          <a
            href="/dispatch"
            className="group flex items-center justify-center space-x-3 p-6 border-2 border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 transition-all duration-300"
          >
            <FaTruck className="text-black group-hover:scale-110 transition-transform" size={24} />
            <span className="font-semibold text-black">Create Dispatch</span>
          </a>
          <a
            href="/reports"
            className="group flex items-center justify-center space-x-3 p-6 border-2 border-gray-200 rounded-2xl hover:border-rose-500 hover:bg-rose-50 transition-all duration-300"
          >
            <FaChartLine className="text-rose-500 group-hover:scale-110 transition-transform" size={24} />
            <span className="font-semibold text-black group-hover:text-rose-500">View Reports</span>
          </a>
        </div>
      </Card>
    </div>
    </div>
  );
};

export default Dashboard;
