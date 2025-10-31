/**
 * Product Management Page
 * Full CRUD for managing Coca-Cola products with complete schema
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { FaPlus, FaEdit, FaTrash, FaBoxes, FaRupeeSign, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import * as productService from '../services/productService';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    headBrand: '',
    serialNumber: '',
    brandName: '',
    subSrNo: '',
    code: '',
    brandFullName: '',
    ml: '',
    type: '',
    brand: '',
    mrp: '',
    packSize: '',
    purchaseRate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProducts();
  }, [showInactive]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('📦 Loading products...');
      const data = await productService.getAllProducts(!showInactive);
      console.log('📦 Products data received:', data);
      
      // Handle nested response structure
      const productsArray = data?.data || data;
      console.log('📦 Extracted products array:', productsArray);
      
      setProducts(Array.isArray(productsArray) ? productsArray : []);
      toast.success(`Loaded ${Array.isArray(productsArray) ? productsArray.length : 0} products`);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('❌ Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique brands and types for filters
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const types = [...new Set(products.map(p => p.type).filter(Boolean))].sort();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required';
    }
    
    if (!formData.brandFullName.trim()) {
      newErrors.brandFullName = 'Full brand name is required';
    }
    
    if (!formData.mrp) {
      newErrors.mrp = 'MRP is required';
    } else if (isNaN(formData.mrp) || parseFloat(formData.mrp) < 0) {
      newErrors.mrp = 'MRP must be a positive number';
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
      const productData = {
        headBrand: formData.headBrand.trim(),
        serialNumber: formData.serialNumber.trim(),
        brandName: formData.brandName.trim(),
        subSrNo: formData.subSrNo.trim(),
        code: formData.code.trim().toUpperCase(),
        brandFullName: formData.brandFullName.trim(),
        ml: formData.ml.trim(),
        type: formData.type.trim(),
        brand: formData.brand.trim(),
        mrp: parseFloat(formData.mrp),
        packSize: formData.packSize ? parseInt(formData.packSize) : undefined,
        purchaseRate: formData.purchaseRate ? parseFloat(formData.purchaseRate) : undefined
      };
      
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, productData);
        toast.success('Product updated successfully!');
      } else {
        await productService.createProduct(productData);
        toast.success('Product created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      headBrand: product.headBrand || '',
      serialNumber: product.serialNumber || '',
      brandName: product.brandName || '',
      subSrNo: product.subSrNo || '',
      code: product.code || '',
      brandFullName: product.brandFullName || '',
      ml: product.ml || '',
      type: product.type || '',
      brand: product.brand || '',
      mrp: product.mrp?.toString() || '',
      packSize: product.packSize?.toString() || '',
      purchaseRate: product.purchaseRate?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    
    setLoading(true);
    try {
      await productService.deleteProduct(deletingProduct._id);
      toast.success('Product deleted successfully!');
      setShowDeleteModal(false);
      setDeletingProduct(null);
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const handleToggleActive = async (product) => {
    try {
      await productService.updateProduct(product._id, { active: !product.active });
      toast.success(`Product ${product.active ? 'deactivated' : 'activated'} successfully!`);
      loadProducts();
    } catch (error) {
      toast.error('Failed to update product status');
      console.error('Error toggling product status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      headBrand: '',
      serialNumber: '',
      brandName: '',
      subSrNo: '',
      code: '',
      brandFullName: '',
      ml: '',
      type: '',
      brand: '',
      mrp: '',
      packSize: '',
      purchaseRate: ''
    });
    setEditingProduct(null);
    setErrors({});
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      product.brandFullName?.toLowerCase().includes(searchLower) ||
      product.code?.toLowerCase().includes(searchLower) ||
      product.brandName?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower);
    
    const matchesBrand = !filterBrand || product.brand === filterBrand;
    const matchesType = !filterType || product.type === filterType;
    const matchesActive = showInactive || product.active !== false;
    
    return matchesSearch && matchesBrand && matchesType && matchesActive;
  });

  const stats = [
    {
      label: 'Total Products',
      count: products.length,
      icon: FaBoxes,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      label: 'Active Products',
      count: products.filter(p => p.active !== false).length,
      icon: FaCheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Brands',
      count: brands.length,
      icon: FaBoxes,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      label: 'Avg MRP',
      count: products.length > 0 
        ? `₹${(products.reduce((sum, p) => sum + (p.mrp || 0), 0) / products.length).toFixed(2)}`
        : '₹0',
      icon: FaRupeeSign,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <Button
          variant="primary"
          icon={FaPlus}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add New Product
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code, name, brand..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Show Inactive</span>
            </label>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </Card>

      {/* Products Table */}
      <Card title="Products List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ML
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pack Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.code || '-'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{product.brandName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
                      {product.brandFullName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{product.ml}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{product.type}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{product.brand}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-gray-900">
                        <FaRupeeSign className="h-3 w-3 mr-1" />
                        {product.mrp}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{product.packSize}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit product"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete product"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Head Brand"
              type="text"
              name="headBrand"
              value={formData.headBrand}
              onChange={handleInputChange}
              placeholder="e.g., Coca Cola"
            />
            
            <Input
              label="Serial Number"
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleInputChange}
              placeholder="e.g., 1"
            />
            
            <Input
              label="Brand Name *"
              type="text"
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
              error={errors.brandName}
              placeholder="e.g., Coca Cola"
            />
            
            <Input
              label="Sub Sr No"
              type="text"
              name="subSrNo"
              value={formData.subSrNo}
              onChange={handleInputChange}
              placeholder="e.g., 1"
            />
            
            <Input
              label="Product Code"
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., KOC200/KOC200P"
            />
            
            <Input
              label="ML"
              type="text"
              name="ml"
              value={formData.ml}
              onChange={handleInputChange}
              placeholder="e.g., 200ml"
            />
            
            <Input
              label="Type"
              type="text"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="e.g., RGB, PET, Can"
            />
            
            <Input
              label="Brand"
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., Coca Cola"
            />
            
            <Input
              label="MRP (₹) *"
              type="number"
              name="mrp"
              value={formData.mrp}
              onChange={handleInputChange}
              error={errors.mrp}
              placeholder="Enter MRP"
              step="0.01"
              min="0"
            />
            
            <Input
              label="Pack Size"
              type="number"
              name="packSize"
              value={formData.packSize}
              onChange={handleInputChange}
              placeholder="e.g., 24"
              min="1"
            />
            
            <Input
              label="Purchase Rate (₹)"
              type="number"
              name="purchaseRate"
              value={formData.purchaseRate}
              onChange={handleInputChange}
              placeholder="Enter purchase rate"
              step="0.01"
              min="0"
            />
          </div>
          
          <Input
            label="Brand Full Name *"
            type="text"
            name="brandFullName"
            value={formData.brandFullName}
            onChange={handleInputChange}
            error={errors.brandFullName}
            placeholder="e.g., 200ML RGB Coca Cola RS. 10 (Pack of 24)"
          />
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingProduct(null);
        }}
        title="Confirm Delete"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this product?</p>
          {deletingProduct && (
            <p className="text-gray-800 font-medium">{deletingProduct.brandFullName}</p>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;
