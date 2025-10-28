/**
 * Reports Page
 * Comprehensive analytics and reporting for ERP
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ComposedChart
} from 'recharts';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { 
  FaFileDownload, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaTruck,
  FaStore,
  FaBoxes,
  FaCalendarAlt,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaChartPie,
  FaChartBar
} from 'react-icons/fa';
import * as saleService from '../services/saleService';
import * as driverService from '../services/driverService';
import * as retailerService from '../services/retailerService';
import * as productService from '../services/productService';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('overview');
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCash: 0,
    totalCredit: 0,
    totalCheque: 0,
    totalDrivers: 0,
    totalRetailers: 0,
    totalProducts: 0,
    activeSales: 0
  });
  const [drivers, setDrivers] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadReportData();
    }
  }, [dateRange, reportType]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [driversData, retailersData, productsData] = await Promise.all([
        driverService.getAllDrivers(),
        retailerService.getAllRetailers(),
        productService.getAllProducts(true)
      ]);
      
      setDrivers(driversData);
      setRetailers(retailersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Get sales data
      const sales = await saleService.getAllSales({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      // Ensure sales is an array
      const salesArray = Array.isArray(sales) ? sales : [];
      setSalesData(salesArray);
      
      // Calculate statistics
      const totalSales = salesArray.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalCash = salesArray
        .filter(s => s.paymentMethod === 'cash')
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalCredit = salesArray
        .filter(s => s.paymentMethod === 'credit')
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalCheque = salesArray
        .filter(s => s.paymentMethod === 'cheque')
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
      
      setStats({
        totalSales,
        totalCash,
        totalCredit,
        totalCheque,
        totalDrivers: drivers.length,
        totalRetailers: retailers.length,
        totalProducts: products.length,
        activeSales: salesArray.length
      });
    } catch (error) {
      toast.error('Failed to load report data');
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const getDriverWiseReport = () => {
    const driverSales = {};
    const salesArray = Array.isArray(salesData) ? salesData : [];
    
    salesArray.forEach(sale => {
      const driverId = sale.driver?._id || sale.driverId;
      const driverName = sale.driver?.name || 'Unknown Driver';
      
      if (!driverSales[driverId]) {
        driverSales[driverId] = {
          name: driverName,
          totalSales: 0,
          totalAmount: 0,
          cash: 0,
          credit: 0,
          cheque: 0,
          salesCount: 0
        };
      }
      
      driverSales[driverId].totalAmount += sale.totalAmount;
      driverSales[driverId].salesCount += 1;
      
      if (sale.paymentMethod === 'cash') driverSales[driverId].cash += sale.totalAmount;
      if (sale.paymentMethod === 'credit') driverSales[driverId].credit += sale.totalAmount;
      if (sale.paymentMethod === 'cheque') driverSales[driverId].cheque += sale.totalAmount;
    });
    
    return Object.values(driverSales);
  };

  const getRetailerWiseReport = () => {
    const retailerSales = {};
    const salesArray = Array.isArray(salesData) ? salesData : [];
    
    salesArray.forEach(sale => {
      const retailerId = sale.retailer?._id || sale.retailerId;
      const retailerName = sale.retailer?.name || 'Unknown Retailer';
      
      if (!retailerSales[retailerId]) {
        retailerSales[retailerId] = {
          name: retailerName,
          totalAmount: 0,
          salesCount: 0,
          outstanding: 0
        };
      }
      
      retailerSales[retailerId].totalAmount += sale.totalAmount;
      retailerSales[retailerId].salesCount += 1;
      
      if (sale.paymentMethod === 'credit') {
        retailerSales[retailerId].outstanding += sale.totalAmount;
      }
    });
    
    return Object.values(retailerSales);
  };

  const getProductWiseReport = () => {
    const productSales = {};
    const salesArray = Array.isArray(salesData) ? salesData : [];
    
    salesArray.forEach(sale => {
      sale.items?.forEach(item => {
        const productId = item.product?._id || item.productId;
        const productName = item.product?.name || 'Unknown Product';
        const productSize = item.product?.size || '';
        
        const key = `${productId}-${productSize}`;
        
        if (!productSales[key]) {
          productSales[key] = {
            name: productName,
            size: productSize,
            totalQuantity: 0,
            totalAmount: 0,
            salesCount: 0
          };
        }
        
        productSales[key].totalQuantity += item.quantity;
        productSales[key].totalAmount += item.totalPrice;
        productSales[key].salesCount += 1;
      });
    });
    
    return Object.values(productSales);
  };

  const getPaymentMethodReport = () => {
    const salesArray = Array.isArray(salesData) ? salesData : [];
    return [
      { method: 'Cash', amount: stats.totalCash, count: salesArray.filter(s => s.paymentMethod === 'cash').length },
      { method: 'Credit', amount: stats.totalCredit, count: salesArray.filter(s => s.paymentMethod === 'credit').length },
      { method: 'Cheque', amount: stats.totalCheque, count: salesArray.filter(s => s.paymentMethod === 'cheque').length }
    ];
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon!');
  };

  // Chart colors
  const COLORS = {
    primary: '#000000',
    secondary: '#f43f5e',
    tertiary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6'
  };

  const CHART_COLORS = ['#000000', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  // Prepare advanced chart data
  const salesComparisonData = getDriverWiseReport().map((driver, index) => ({
    name: driver.name.substring(0, 10),
    cash: driver.cash,
    credit: driver.credit,
    cheque: driver.cheque,
    total: driver.totalAmount
  }));

  const productPerformanceData = getProductWiseReport().slice(0, 10).map(product => ({
    name: product.name.substring(0, 12),
    quantity: product.totalQuantity,
    revenue: product.totalAmount,
    avgPrice: product.totalAmount / product.totalQuantity
  }));

  const paymentTrendData = [
    { month: 'Jan', cash: 45000, credit: 23000, cheque: 12000 },
    { month: 'Feb', cash: 52000, credit: 28000, cheque: 15000 },
    { month: 'Mar', cash: 48000, credit: 25000, cheque: 13000 },
    { month: 'Apr', cash: 61000, credit: 32000, cheque: 18000 },
    { month: 'May', cash: 55000, credit: 29000, cheque: 16000 },
    { month: 'Jun', cash: 67000, credit: 35000, cheque: 20000 }
  ];

  const retailerAnalyticsData = getRetailerWiseReport().slice(0, 8).map(retailer => ({
    name: retailer.name.substring(0, 15),
    sales: retailer.totalAmount,
    transactions: retailer.salesCount,
    outstanding: retailer.outstanding
  }));

  const performanceMetricsData = [
    { metric: 'Sales Volume', value: 85, fullMark: 100 },
    { metric: 'Customer Satisfaction', value: 92, fullMark: 100 },
    { metric: 'On-time Delivery', value: 78, fullMark: 100 },
    { metric: 'Product Quality', value: 95, fullMark: 100 },
    { metric: 'Revenue Growth', value: 88, fullMark: 100 },
    { metric: 'Cost Efficiency', value: 73, fullMark: 100 }
  ];

  const overviewStats = [
    {
      label: 'Total Sales',
      value: `₹${stats.totalSales.toFixed(2)}`,
      icon: FaChartLine,
      bgColor: 'bg-black',
      textColor: 'text-white',
      trend: 15.3,
      trendUp: true
    },
    {
      label: 'Cash Collection',
      value: `₹${stats.totalCash.toFixed(2)}`,
      icon: FaMoneyBillWave,
      bgColor: 'bg-black',
      textColor: 'text-white',
      trend: 8.7,
      trendUp: true
    },
    {
      label: 'Credit Outstanding',
      value: `₹${stats.totalCredit.toFixed(2)}`,
      icon: FaClock,
      bgColor: 'bg-black',
      textColor: 'text-white',
      trend: 3.2,
      trendUp: false
    },
    {
      label: 'Cheque Payments',
      value: `₹${stats.totalCheque.toFixed(2)}`,
      icon: FaCheckCircle,
      bgColor: 'bg-rose-500',
      textColor: 'text-white',
      trend: 12.1,
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">Reports & Analytics</h1>
          <p className="text-gray-500 font-medium">Comprehensive business insights and performance metrics</p>
        </div>
        <Button
          variant="primary"
          icon={FaFileDownload}
          onClick={handleExport}
        >
          Export Report
        </Button>
      </div>

      {/* Date Range & Report Type Selector */}
      <Card className="border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
          />
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: 'overview', label: '📊 Overview Dashboard' },
              { value: 'driver', label: '🚗 Driver-wise Sales' },
              { value: 'retailer', label: '🏪 Retailer-wise Sales' },
              { value: 'product', label: '📦 Product-wise Sales' },
              { value: 'payment', label: '💳 Payment Analysis' }
            ]}
          />
        </div>
      </Card>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {overviewStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} rounded-2xl p-4`}>
                  <Icon className={`h-7 w-7 ${stat.textColor}`} />
                </div>
                {stat.trend && (
                  <div className={`flex items-center text-sm font-semibold ${stat.trendUp ? 'text-green-600' : 'text-rose-600'}`}>
                    {stat.trendUp ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {stat.trend}%
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-black">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Report Content Based on Type */}
      {loading ? (
        <Card>
          <div className="text-center py-8 text-gray-500">Loading report data...</div>
        </Card>
      ) : reportType === 'overview' ? (
        <>
          {/* Advanced Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Trend Analysis */}
            <Card title="Payment Method Trends" icon={FaChartLine} className="border border-gray-100">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={paymentTrendData}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCheque" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                  <Area type="monotone" dataKey="cash" stroke={COLORS.success} strokeWidth={2} fill="url(#colorCash)" name="Cash" />
                  <Area type="monotone" dataKey="credit" stroke={COLORS.warning} strokeWidth={2} fill="url(#colorCredit)" name="Credit" />
                  <Area type="monotone" dataKey="cheque" stroke={COLORS.purple} strokeWidth={2} fill="url(#colorCheque)" name="Cheque" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Performance Metrics Radar */}
            <Card title="Business Performance Metrics" icon={FaChartPie} className="border border-gray-100">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceMetricsData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" stroke="#6b7280" style={{ fontSize: '11px', fontWeight: '600' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '10px', fontWeight: '600' }} />
                  <Radar name="Performance" dataKey="value" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.6} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Product Performance & Retailer Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card title="Top Performing Products" icon={FaBoxes} className="border border-gray-100">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={productPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px', fontWeight: '600' }} angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                  <Bar yAxisId="left" dataKey="quantity" fill={COLORS.primary} name="Quantity Sold" radius={[8, 8, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={COLORS.secondary} strokeWidth={2} name="Revenue (₹)" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Retailer Analytics */}
            <Card title="Top Retailers Analysis" icon={FaStore} className="border border-gray-100">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={retailerAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px', fontWeight: '600' }} angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                  <Bar dataKey="sales" fill={COLORS.success} name="Total Sales (₹)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="outstanding" fill={COLORS.warning} name="Outstanding (₹)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Quick Stats" className="border border-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <FaTruck className="h-5 w-5 text-black mr-3" />
                    <span className="text-sm font-semibold text-gray-700">Active Drivers</span>
                  </div>
                  <span className="text-xl font-bold text-black">{stats.totalDrivers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <FaStore className="h-5 w-5 text-black mr-3" />
                    <span className="text-sm font-semibold text-gray-700">Retailers</span>
                  </div>
                  <span className="text-xl font-bold text-black">{stats.totalRetailers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <FaBoxes className="h-5 w-5 text-black mr-3" />
                    <span className="text-sm font-semibold text-gray-700">Products</span>
                  </div>
                  <span className="text-xl font-bold text-black">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <FaCalendarAlt className="h-5 w-5 text-black mr-3" />
                    <span className="text-sm font-semibold text-gray-700">Total Sales</span>
                  </div>
                  <span className="text-xl font-bold text-black">{stats.activeSales}</span>
                </div>
              </div>
            </Card>

            <Card title="Payment Distribution" className="border border-gray-100">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={getPaymentMethodReport()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, amount }) => `${method}: ₹${amount.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {getPaymentMethodReport().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Collection Summary" className="border border-gray-100">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Cash Collection</span>
                    <span className="text-sm font-bold text-green-600">
                      {stats.totalSales > 0 ? ((stats.totalCash / stats.totalSales) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalSales > 0 ? (stats.totalCash / stats.totalSales) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Credit Outstanding</span>
                    <span className="text-sm font-bold text-orange-600">
                      {stats.totalSales > 0 ? ((stats.totalCredit / stats.totalSales) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalSales > 0 ? (stats.totalCredit / stats.totalSales) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Cheque Payments</span>
                    <span className="text-sm font-bold text-purple-600">
                      {stats.totalSales > 0 ? ((stats.totalCheque / stats.totalSales) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalSales > 0 ? (stats.totalCheque / stats.totalSales) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : reportType === 'driver' ? (
        <>
          {/* Driver Sales Comparison Chart */}
          <Card title="Driver Sales Comparison" icon={FaTruck} className="border border-gray-100 mb-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '600' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }} />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} />
                <Bar dataKey="cash" stackId="a" fill={COLORS.success} name="Cash" radius={[0, 0, 0, 0]} />
                <Bar dataKey="credit" stackId="a" fill={COLORS.warning} name="Credit" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cheque" stackId="a" fill={COLORS.purple} name="Cheque" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          
          {/* Driver Details Table */}
          <Card title="Driver-wise Sales Report" className="border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales Count</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cash</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cheque</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {getDriverWiseReport().length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-medium">No data available</td>
                    </tr>
                  ) : (
                    getDriverWiseReport().map((driver, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">{driver.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{driver.salesCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">₹{driver.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{driver.cash.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">₹{driver.credit.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">₹{driver.cheque.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : reportType === 'retailer' ? (
        <Card title="Retailer-wise Sales Report" className="border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Retailer Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales Count</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Outstanding Credit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {getRetailerWiseReport().length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium">No data available</td>
                  </tr>
                ) : (
                  getRetailerWiseReport().map((retailer, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">{retailer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{retailer.salesCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">₹{retailer.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">₹{retailer.outstanding.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : reportType === 'product' ? (
        <Card title="Product-wise Sales Report" className="border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Price/Unit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {getProductWiseReport().length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">No data available</td>
                  </tr>
                ) : (
                  getProductWiseReport().map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{product.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{product.totalQuantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">₹{product.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">
                        ₹{(product.totalAmount / product.totalQuantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card title="Payment Method Analysis" className="border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction Count</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {getPaymentMethodReport().map((payment, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">{payment.method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{payment.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">₹{payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">
                      {stats.totalSales > 0 ? ((payment.amount / stats.totalSales) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;
