/**
 * Retailer Management Page
 * Full CRUD for managing retail shops and routes
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { FaPlus, FaEdit, FaTrash, FaStore, FaMapMarkerAlt, FaPhone, FaRoute } from 'react-icons/fa';
import * as retailerService from '../services/retailerService';

const RetailerManagement = () => {
  const [retailers, setRetailers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    route: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadRetailers();
    loadRoutes();
  }, []);

  const loadRetailers = async () => {
    try {
      setLoading(true);
      const data = await retailerService.getAllRetailers();
      setRetailers(data);
    } catch (error) {
      toast.error('Failed to load retailers');
      console.error('Error loading retailers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const data = await retailerService.getAllRoutes();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading routes:', error);
      setRoutes([]);
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
      newErrors.name = 'Retailer name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    
    if (!formData.route.trim()) {
      newErrors.route = 'Route is required';
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
      if (editingRetailer) {
        await retailerService.updateRetailer(editingRetailer._id, formData);
        toast.success('Retailer updated successfully!');
      } else {
        await retailerService.createRetailer(formData);
        toast.success('Retailer created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      loadRetailers();
      loadRoutes(); // Reload routes in case a new one was added
    } catch (error) {
      toast.error(error.message || 'Operation failed');
      console.error('Error saving retailer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (retailer) => {
    setEditingRetailer(retailer);
    setFormData({
      name: retailer.name,
      address: retailer.address,
      phone: retailer.phone,
      route: retailer.route
    });
    setShowModal(true);
  };

  const handleDelete = async (retailerId) => {
    if (!window.confirm('Are you sure you want to deactivate this retailer?')) {
      return;
    }
    
    try {
      await retailerService.deleteRetailer(retailerId);
      toast.success('Retailer deactivated successfully!');
      loadRetailers();
    } catch (error) {
      toast.error('Failed to deactivate retailer');
      console.error('Error deleting retailer:', error);
    }
  };

  const handleToggleActive = async (retailer) => {
    try {
      await retailerService.updateRetailer(retailer._id, { active: !retailer.active });
      toast.success(`Retailer ${retailer.active ? 'deactivated' : 'activated'} successfully!`);
      loadRetailers();
    } catch (error) {
      toast.error('Failed to update retailer status');
      console.error('Error toggling retailer status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      route: ''
    });
    setEditingRetailer(null);
    setErrors({});
  };

  const filteredRetailers = retailers.filter(retailer => {
    const matchesSearch = 
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      retailer.phone.includes(searchTerm) ||
      retailer.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoute = !routeFilter || retailer.route === routeFilter;
    return matchesSearch && matchesRoute;
  });

  const stats = [
    {
      label: 'Total Retailers',
      count: retailers.length,
      icon: FaStore,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      label: 'Active Retailers',
      count: retailers.filter(r => r.active).length,
      icon: FaStore,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      label: 'Total Routes',
      count: routes.length,
      icon: FaRoute,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      label: 'Inactive Retailers',
      count: retailers.filter(r => !r.active).length,
      icon: FaStore,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Retailer Management</h1>
        <Button
          variant="primary"
          icon={FaPlus}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add New Retailer
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
            placeholder="Search by name, phone, or address..."
          />
          <Select
            label="Filter by Route"
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            options={[
              { value: '', label: 'All Routes' },
              ...(Array.isArray(routes) ? routes.map(route => ({ value: route, label: route })) : [])
            ]}
          />
        </div>
      </Card>

      {/* Retailers Table */}
      <Card title="Retailers List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retailer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
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
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading retailers...
                  </td>
                </tr>
              ) : filteredRetailers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No retailers found
                  </td>
                </tr>
              ) : (
                filteredRetailers.map((retailer) => (
                  <tr key={retailer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaStore className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{retailer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                        <div className="text-sm text-gray-500">{retailer.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaPhone className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-500">{retailer.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaRoute className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {retailer.route}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(retailer)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                          retailer.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {retailer.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(retailer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit retailer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(retailer._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deactivate retailer"
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

      {/* Add/Edit Retailer Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingRetailer ? 'Edit Retailer' : 'Add New Retailer'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Retailer Name *"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Enter retailer/shop name"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter complete address"
              rows="3"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          
          <Input
            label="Phone *"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            placeholder="10-digit phone number"
            maxLength="10"
          />
          
          <Input
            label="Route *"
            type="text"
            name="route"
            value={formData.route}
            onChange={handleInputChange}
            error={errors.route}
            placeholder="Enter route name (e.g., Route A, North Zone)"
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
              {loading ? 'Saving...' : (editingRetailer ? 'Update Retailer' : 'Create Retailer')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RetailerManagement;
