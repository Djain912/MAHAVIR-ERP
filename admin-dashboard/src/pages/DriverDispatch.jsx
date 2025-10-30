/**
 * Driver Dispatch Page
 * Create and manage driver dispatches with stock and cash assignments
 */

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTruck, FaEye, FaCheck, FaTimes, FaTrash, FaSearch } from 'react-icons/fa';
import Card from '../components/Card';
import {
  createDriverDispatch,
  getAllDispatches,
  getDispatchById,
  updateDispatchStatus
} from '../services/dispatchService';
import { getAllDrivers } from '../services/driverService';
import { getAllProducts } from '../services/productService';
import { getStockSummary } from '../services/stockService';

const DriverDispatch = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dispatches, setDispatches] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockSummary, setStockSummary] = useState([]);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDispatches: 0,
    activeDispatches: 0,
    completedToday: 0,
    totalStockValue: 0
  });

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDriver, setFilterDriver] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    driverId: '',
    date: new Date().toISOString().split('T')[0],
    items: []
  });

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [selectedRate, setSelectedRate] = useState('');
  const [selectedItemType, setSelectedItemType] = useState('Retail'); // NEW: Item type for each product
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productDropdownRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterDriver]);

  // Handle clicks outside product dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch dispatches with filters
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterDriver) filters.driverId = filterDriver;
      
      const [dispatchesData, driversData, productsData, stockData] = await Promise.all([
        getAllDispatches(filters),
        getAllDrivers({ role: 'Driver', active: true }),
        // Request all products (not only active) so the dropdown shows everything like StockIntake
        getAllProducts(false),
        getStockSummary()
      ]);

      console.log('Raw driversData:', driversData);
      console.log('Drivers array:', driversData.data || driversData);

      // Ensure all data is arrays
      const dispatchesArray = Array.isArray(dispatchesData) ? dispatchesData : (Array.isArray(dispatchesData?.data) ? dispatchesData.data : []);
      const driversArray = Array.isArray(driversData) ? driversData : (Array.isArray(driversData?.data) ? driversData.data : []);
      const productsArray = Array.isArray(productsData) ? productsData : (Array.isArray(productsData?.data) ? productsData.data : []);
      const stockArray = Array.isArray(stockData) ? stockData : (Array.isArray(stockData?.data) ? stockData.data : []);

  setDispatches(dispatchesArray);
  setDrivers(driversArray);
  console.log('📦 Products fetched for DriverDispatch:', productsArray);
  console.log('📦 Products count:', productsArray.length);
  setProducts(productsArray);
      setStockSummary(stockArray);

      // Calculate stats
      const totalDispatches = dispatchesArray.length;
      const activeDispatches = dispatchesArray.filter(d => d.status === 'Active').length;
      const today = new Date().toISOString().split('T')[0];
      const completedToday = dispatchesArray.filter(d => 
        d.status === 'Completed' && 
        new Date(d.date).toISOString().split('T')[0] === today
      ).length;
      const totalStockValue = dispatchesArray
        .filter(d => d.status === 'Active')
        .reduce((sum, d) => sum + (d.totalStockValue || 0), 0);

      setStats({
        totalDispatches,
        activeDispatches,
        completedToday,
        totalStockValue
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dispatch data');
      setDispatches([]);
      setDrivers([]);
      setProducts([]);
      setStockSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !selectedQuantity || !selectedRate) {
      toast.error('Please select product, quantity, and rate');
      return;
    }

    const product = products.find(p => p._id === selectedProduct);
    const stock = stockSummary.find(s => s.productId === selectedProduct);
    
    if (!stock || stock.totalQuantity < parseInt(selectedQuantity)) {
      toast.error(`Insufficient stock. Available: ${stock?.totalQuantity || 0}`);
      return;
    }

    // Allow same product to be added multiple times (no duplicate check)

    const newItem = {
      productId: selectedProduct,
      productName: product.name,
      quantity: parseInt(selectedQuantity),
      ratePerUnit: parseFloat(selectedRate),
      totalValue: parseInt(selectedQuantity) * parseFloat(selectedRate),
      itemType: selectedItemType // NEW: Add item type
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });

    // Reset selection
    setSelectedProduct('');
    setSelectedQuantity('');
    setSelectedRate('');
    setSelectedItemType('Retail'); // Reset to default
  };

  const handleRemoveProduct = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!productSearchTerm) return true;
    const searchLower = productSearchTerm.toLowerCase();
    return (
      product.brandFullName?.toLowerCase().includes(searchLower) ||
      product.name?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower) ||
      product.type?.toLowerCase().includes(searchLower)
    );
  });

  const handleProductSelect = (product) => {
    setSelectedProduct(product._id);
    setProductSearchTerm(product.brandFullName || product.name);
    setSelectedRate(product.purchaseRate || product.price || '');
    setShowProductDropdown(false);
  };

  const calculateTotalStock = () => {
    return formData.items.reduce((sum, item) => sum + item.totalValue, 0);
  };

  const handleCreateDispatch = async (e) => {
    e.preventDefault();

    if (!formData.driverId) {
      toast.error('Please select a driver');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare dispatch data
      const dispatchData = {
        driverId: formData.driverId,
        date: formData.date,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          ratePerUnit: item.ratePerUnit
        })),
        cashDenominations: [] // No cash denominations
      };

      await createDriverDispatch(dispatchData);
      
      toast.success('Dispatch created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchData();
      
    } catch (error) {
      console.error('Error creating dispatch:', error);
      toast.error(error.response?.data?.message || 'Failed to create dispatch');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      driverId: '',
      date: new Date().toISOString().split('T')[0],
      items: []
    });
    setSelectedProduct('');
    setSelectedQuantity('');
    setSelectedRate('');
    setSelectedItemType('Retail'); // Reset item type
    setProductSearchTerm('');
    setShowProductDropdown(false);
  };

  const handleViewDetails = async (dispatch) => {
    try {
      setLoading(true);
      const details = await getDispatchById(dispatch._id);
      setSelectedDispatch(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching dispatch details:', error);
      toast.error('Failed to load dispatch details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (dispatchId, newStatus) => {
    try {
      setLoading(true);
      await updateDispatchStatus(dispatchId, newStatus);
      toast.success(`Dispatch ${newStatus.toLowerCase()} successfully!`);
      fetchData();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error updating dispatch status:', error);
      toast.error(error.response?.data?.message || 'Failed to update dispatch status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Completed: 'bg-blue-100 text-blue-800',
      Settled: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Driver Dispatch</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaPlus /> Create New Dispatch
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Dispatches</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDispatches}</p>
            </div>
            <FaTruck className="text-3xl text-red-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Dispatches</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeDispatches}</p>
            </div>
            <FaTruck className="text-3xl text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completedToday}</p>
            </div>
            <FaCheck className="text-3xl text-blue-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Stock Value (Active)</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalStockValue.toFixed(2)}</p>
            </div>
            <FaTruck className="text-3xl text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Settled">Settled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Drivers</option>
              {drivers.map(driver => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} - {driver.phone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Dispatches Table */}
      <Card title="All Dispatches">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : dispatches.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No dispatches found</td>
                </tr>
              ) : (
                dispatches.map(dispatch => (
                  <tr key={dispatch._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(dispatch.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dispatch.driverId?.name || 'Unknown Driver'}
                      <br />
                      <span className="text-xs text-gray-500">{dispatch.driverId?.phone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{dispatch.totalStockValue?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{dispatch.totalCashValue?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(dispatch.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(dispatch)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        <FaEye className="inline" />
                      </button>
                      {dispatch.status === 'Active' && (
                        <button
                          onClick={() => handleUpdateStatus(dispatch._id, 'Completed')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Completed"
                        >
                          <FaCheck className="inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Dispatch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-visible">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Create New Dispatch</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleCreateDispatch}>
                {/* Driver, Dispatch Type, and Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Driver <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">Select Driver</option>
                      {drivers.map(driver => (
                        <option key={driver._id} value={driver._id}>
                          {driver.name} - {driver.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>

                {/* Product Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Add Products</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="md:col-span-2 relative" ref={productDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={productSearchTerm}
                          onChange={(e) => {
                            setProductSearchTerm(e.target.value);
                            setShowProductDropdown(true);
                            setSelectedProduct('');
                          }}
                          onFocus={() => setShowProductDropdown(true)}
                          placeholder="Search by brand, name, or type..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-red-500"
                        />
                        {selectedProduct ? (
                          <div className="absolute right-3 top-2.5 text-green-600 text-xl">
                            ✓
                          </div>
                        ) : (
                          <FaSearch className="absolute right-3 top-3 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Dropdown */}
                      {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute z-60 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProducts.map(product => {
                            const stock = stockSummary.find(s => s.productId === product._id);
                            return (
                              <div
                                key={product._id}
                                onClick={() => handleProductSelect(product)}
                                className="px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">
                                  {product.brandFullName || `${product.name} - ${product.size}`}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 flex justify-between">
                                  <span>
                                    {product.brand && <span>{product.brand}</span>}
                                    {product.type && <span> • {product.type}</span>}
                                    {product.ml && <span> • {product.ml}ml</span>}
                                    {product.size && <span> • {product.size}</span>}
                                  </span>
                                  {product.purchaseRate && (
                                    <span className="font-semibold text-green-600">
                                      ₹{product.purchaseRate}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Stock: {stock?.totalQuantity || 0}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                        min="1"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={selectedRate}
                        onChange={(e) => setSelectedRate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={selectedItemType}
                        onChange={(e) => setSelectedItemType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                      >
                        <option value="Retail">Retail</option>
                        <option value="Wholesale">Wholesale</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaPlus className="inline mr-2" /> Add Product
                  </button>

                  {/* Added Products Table */}
                  {formData.items.length > 0 && (
                    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rate</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm">{item.productName}</td>
                              <td className="px-4 py-2 text-sm">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  item.itemType === 'Retail' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {item.itemType}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-sm">{item.quantity}</td>
                              <td className="px-4 py-2 text-sm">₹{item.ratePerUnit.toFixed(2)}</td>
                              <td className="px-4 py-2 text-sm">₹{item.totalValue.toFixed(2)}</td>
                              <td className="px-4 py-2 text-sm">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-3">Dispatch Summary</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Stock Value:</p>
                      <p className="text-xl font-bold text-gray-900">₹{calculateTotalStock().toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Creating...' : 'Create Dispatch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Details Modal */}
      {showDetailsModal && selectedDispatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Dispatch Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {/* Dispatch Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Driver:</p>
                  <p className="text-lg font-semibold">{selectedDispatch.driverId?.name}</p>
                  <p className="text-sm text-gray-500">{selectedDispatch.driverId?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date:</p>
                  <p className="text-lg font-semibold">{new Date(selectedDispatch.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status:</p>
                  <p className="text-lg">{getStatusBadge(selectedDispatch.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Stock Value:</p>
                  <p className="text-lg font-semibold">₹{selectedDispatch.totalStockValue?.toFixed(2)}</p>
                </div>
              </div>

              {/* Products */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Products</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Remaining</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rate</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedDispatch.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.productId?.name}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">{item.remainingQuantity}</td>
                          <td className="px-4 py-2 text-sm">₹{item.ratePerUnit?.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">₹{item.totalValue?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cash Denominations */}
              {selectedDispatch.cashDenominations && selectedDispatch.cashDenominations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Cash Denominations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedDispatch.cashDenominations.map((denom, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-600">₹{denom.noteValue} Notes</p>
                        <p className="text-lg font-semibold">{denom.noteCount}</p>
                        <p className="text-xs text-gray-500">Total: ₹{denom.totalValue?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Cash Value:</p>
                    <p className="text-xl font-bold">₹{selectedDispatch.totalCashValue?.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                {selectedDispatch.status === 'Active' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedDispatch._id, 'Completed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                  </>
                )}
                {selectedDispatch.status === 'Completed' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedDispatch._id, 'Settled')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mark as Settled
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDispatch;
