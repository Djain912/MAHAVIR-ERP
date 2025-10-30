/**
 * Stock Intake Page
 * Manage warehouse stock intake with product selection, batch tracking, and inventory monitoring
 */

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { FaPlus, FaBox, FaExclamationTriangle } from 'react-icons/fa';
import * as stockService from '../services/stockService';
import * as productService from '../services/productService';

const StockIntake = () => {
  const [products, setProducts] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [stockSummary, setStockSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    batchNumber: '',
    expiryDate: '',
    purchaseRate: '',
    sellingRate: ''
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dropdownRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadStockList();
    loadStockSummary();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProducts = async () => {
    try {
      // Pass false to get ALL products (not just active ones)
      const data = await productService.getAllProducts(false);
      console.log('📦 Loaded products:', data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    }
  };

  const loadStockList = async () => {
    try {
      const data = await stockService.getAllStock();
      setStockList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load stock list');
      setStockList([]);
    }
  };

  const loadStockSummary = async () => {
    try {
      const data = await stockService.getStockSummary();
      setStockSummary(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load stock summary:', error);
      setStockSummary([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.brandFullName || `${product.name} - ${product.size}`);
    setFormData(prev => ({
      ...prev,
      product: product._id,
      purchaseRate: product.purchaseRate || product.pricePerUnit || ''
    }));
    setShowProductDropdown(false);
    
    // Clear product error
    if (errors.product) {
      setErrors(prev => ({ ...prev, product: '' }));
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowProductDropdown(true);
    
    // Clear selection if user types
    if (selectedProduct) {
      setSelectedProduct(null);
      setFormData(prev => ({
        ...prev,
        product: '',
        purchaseRate: ''
      }));
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = product.brandFullName || `${product.name} - ${product.size}`;
    const brand = product.brand || product.name || '';
    const type = product.type || '';
    const ml = product.ml || product.size || '';
    
    return (
      fullName.toLowerCase().includes(searchLower) ||
      brand.toLowerCase().includes(searchLower) ||
      type.toLowerCase().includes(searchLower) ||
      ml.toLowerCase().includes(searchLower)
    );
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product) newErrors.product = 'Product is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.batchNumber) newErrors.batchNumber = 'Batch number is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!formData.purchaseRate || formData.purchaseRate <= 0) newErrors.purchaseRate = 'Valid purchase rate is required';
    if (!formData.sellingRate || formData.sellingRate <= 0) newErrors.sellingRate = 'Valid selling rate is required';

    // Check if expiry date is in the future
    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setLoading(true);
    try {
      await stockService.createStock({
        product: formData.product,
        quantity: parseInt(formData.quantity),
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate,
        purchaseRate: parseFloat(formData.purchaseRate),
        sellingRate: parseFloat(formData.sellingRate)
      });

      toast.success('Stock added successfully!');
      
      // Reset form
      setFormData({
        product: '',
        quantity: '',
        batchNumber: '',
        expiryDate: '',
        purchaseRate: '',
        sellingRate: ''
      });
      setSearchTerm('');
      setSelectedProduct(null);
      setShowForm(false);
      
      // Reload data
      loadStockList();
      loadStockSummary();
    } catch (error) {
      toast.error(error.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const isLowStock = (available, threshold = 100) => {
    return available < threshold;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Stock Intake</h1>
        <Button
          variant="primary"
          icon={showForm ? null : FaPlus}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Stock'}
        </Button>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
              <FaBox className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <FaBox className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{stockList.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockSummary.filter(s => isLowStock(s.availableQuantity)).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Stock Form */}
      {showForm && (
        <Card title="Add New Stock">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Searchable Product Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder="Search products..."
                    className={`w-full px-4 py-2 border ${
                      errors.product ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                  {selectedProduct && (
                    <div className="absolute right-3 top-2.5 text-green-600">
                      ✓
                    </div>
                  )}
                </div>
                {errors.product && (
                  <p className="mt-1 text-sm text-red-600">{errors.product}</p>
                )}
                
                {/* Dropdown List */}
                {showProductDropdown && filteredProducts.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductSelect(product)}
                        className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {product.brandFullName || `${product.name} - ${product.size}`}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex justify-between">
                          <span>{product.brand} • {product.type} • {product.ml || product.size}</span>
                          <span className="font-semibold text-green-600">
                            ₹{product.purchaseRate || product.pricePerUnit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No results */}
                {showProductDropdown && searchTerm && filteredProducts.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    No products found
                  </div>
                )}
              </div>

              <Input
                label="Quantity *"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                error={errors.quantity}
                placeholder="Enter quantity"
                min="1"
              />

              <Input
                label="Batch Number *"
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                error={errors.batchNumber}
                placeholder="e.g., BATCH001"
              />

              <Input
                label="Expiry Date *"
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                error={errors.expiryDate}
              />

              <Input
                label="Purchase Rate (₹) *"
                type="number"
                name="purchaseRate"
                value={formData.purchaseRate}
                onChange={handleInputChange}
                error={errors.purchaseRate}
                placeholder="0.00"
                step="0.01"
                min="0"
              />

              <Input
                label="Selling Rate (₹) *"
                type="number"
                name="sellingRate"
                value={formData.sellingRate}
                onChange={handleInputChange}
                error={errors.sellingRate}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Stock'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Available Stock Summary */}
      <Card title="Available Stock Summary">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockSummary.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No stock available
                  </td>
                </tr>
              ) : (
                stockSummary.map((item) => (
                  <tr key={item._id} className={isLowStock(item.availableQuantity) ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">{item.productSize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.productCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {item.availableQuantity} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isLowStock(item.availableQuantity) ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stock Intake History */}
      <Card title="Stock Intake History">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rates (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No stock intake records found
                  </td>
                </tr>
              ) : (
                stockList.map((stock) => (
                  <tr key={stock._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {stock.product?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stock.product?.size || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.batchNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {stock.remainingQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(stock.expiryDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>P: ₹{stock.purchaseRate}</div>
                      <div>S: ₹{stock.sellingRate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(stock.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StockIntake;
