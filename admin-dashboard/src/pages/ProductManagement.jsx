/**
 * Product Management Page
 * Full CRUD for managing Coca-Cola products
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    pricePerUnit: ''
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
      console.log('📦 Is array?', Array.isArray(data));
      console.log('📦 data.data exists?', data?.data);
      
      // Handle nested response structure: response.data might contain { success, message, data: [...] }
      const productsArray = data?.data || data;
      console.log('📦 Extracted products array:', productsArray);
      
      setProducts(Array.isArray(productsArray) ? productsArray : []);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('❌ Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.size.trim()) {
      newErrors.size = 'Size is required';
    }
    
    if (!formData.pricePerUnit) {
      newErrors.pricePerUnit = 'Price is required';
    } else if (isNaN(formData.pricePerUnit) || parseFloat(formData.pricePerUnit) < 0) {
      newErrors.pricePerUnit = 'Price must be a positive number';
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
        name: formData.name.trim(),
        size: formData.size.trim(),
        pricePerUnit: parseFloat(formData.pricePerUnit)
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
      name: product.name,
      size: product.size,
      pricePerUnit: product.pricePerUnit.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) {
      return;
    }
    
    try {
      await productService.deleteProduct(productId);
      toast.success('Product deactivated successfully!');
      loadProducts();
    } catch (error) {
      toast.error('Failed to deactivate product');
      console.error('Error deleting product:', error);
    }
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
      name: '',
      size: '',
      pricePerUnit: ''
    });
    setEditingProduct(null);
    setErrors({});
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.size.toLowerCase().includes(searchLower) ||
      product.pricePerUnit.toString().includes(searchTerm)
    );
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
      count: products.filter(p => p.active).length,
      icon: FaCheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Inactive Products',
      count: products.filter(p => !p.active).length,
      icon: FaTimesCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      label: 'Avg Price',
      count: products.length > 0 
        ? `₹${(products.reduce((sum, p) => sum + p.pricePerUnit, 0) / products.length).toFixed(2)}`
        : '₹0',
      icon: FaRupeeSign,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, size, or price..."
          />
          <div className="flex items-end">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Show Inactive Products</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card title="Products List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price per Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBoxes className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.size}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-semibold text-gray-900">
                        <FaRupeeSign className="h-4 w-4 mr-1" />
                        {product.pricePerUnit.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit product"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deactivate product"
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
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name *"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="e.g., Coca-Cola, Sprite, Fanta"
          />
          
          <Input
            label="Size *"
            type="text"
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            error={errors.size}
            placeholder="e.g., 250ml, 500ml, 1L, 2L"
          />
          
          <Input
            label="Price per Unit (₹) *"
            type="number"
            name="pricePerUnit"
            value={formData.pricePerUnit}
            onChange={handleInputChange}
            error={errors.pricePerUnit}
            placeholder="Enter price"
            step="0.01"
            min="0"
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
    </div>
  );
};

export default ProductManagement;
