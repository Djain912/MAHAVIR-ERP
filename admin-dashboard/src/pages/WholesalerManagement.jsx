import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import * as wholesalerService from '../services/wholesalerService';
import * as wholesalerBillService from '../services/wholesalerBillService';

const WholesalerManagement = () => {
  const [activeTab, setActiveTab] = useState('wholesalers'); // 'wholesalers' or 'billing'
  const [wholesalers, setWholesalers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWholesaler, setEditingWholesaler] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ active: true });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    creditLimit: 0,
    outstandingBalance: 0,
    active: true,
    notes: ''
  });

  // Billing tab state
  const [billData, setBillData] = useState({
    dispatches: [],
    totalAmount: 0,
    itemCount: 0
  });
  const [billFilters, setBillFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDispatches, setSelectedDispatches] = useState([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (activeTab === 'wholesalers') {
      fetchWholesalers();
    } else if (activeTab === 'billing') {
      fetchBillData();
    }
  }, [searchTerm, filter, pagination.page, activeTab, billFilters.startDate, billFilters.endDate]);

  const fetchWholesalers = async () => {
    try {
      setLoading(true);
      const response = await wholesalerService.getAllWholesalers({
        search: searchTerm,
        ...filter,
        page: pagination.page,
        limit: pagination.limit
      });

      console.log('📦 Wholesalers response:', response);

      // Response structure: response.data = { success, message, data: [...], pagination }
      // Extract the actual wholesalers array from response.data.data
      const wholesalersArray = response.data?.data || response.data || [];
      setWholesalers(Array.isArray(wholesalersArray) ? wholesalersArray : []);
      
      // Extract pagination from response.data.pagination
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching wholesalers:', error);
      alert('Failed to fetch wholesalers');
      setWholesalers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
      alert('Please provide a valid 6-digit pincode');
      return;
    }
    
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      alert('Please provide a valid GST number (Format: 22AAAAA0000A1Z5)');
      return;
    }
    
    try {
      if (editingWholesaler) {
        await wholesalerService.updateWholesaler(editingWholesaler._id, formData);
        alert('Wholesaler updated successfully');
      } else {
        await wholesalerService.createWholesaler(formData);
        alert('Wholesaler created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchWholesalers();
    } catch (error) {
      console.error('Error saving wholesaler:', error);
      const errorMessage = error.message || error.error || 'Failed to save wholesaler';
      alert(errorMessage);
    }
  };

  const handleEdit = (wholesaler) => {
    setEditingWholesaler(wholesaler);
    setFormData({
      name: wholesaler.name,
      businessName: wholesaler.businessName,
      phone: wholesaler.phone,
      email: wholesaler.email || '',
      address: wholesaler.address || '',
      city: wholesaler.city || '',
      state: wholesaler.state || '',
      pincode: wholesaler.pincode || '',
      gstNumber: wholesaler.gstNumber || '',
      creditLimit: wholesaler.creditLimit,
      outstandingBalance: wholesaler.outstandingBalance,
      active: wholesaler.active,
      notes: wholesaler.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wholesaler?')) {
      return;
    }

    try {
      await wholesalerService.deleteWholesaler(id);
      alert('Wholesaler deleted successfully');
      fetchWholesalers();
    } catch (error) {
      console.error('Error deleting wholesaler:', error);
      alert('Failed to delete wholesaler');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      businessName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstNumber: '',
      creditLimit: 0,
      outstandingBalance: 0,
      active: true,
      notes: ''
    });
    setEditingWholesaler(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Billing functions
  const fetchBillData = async () => {
    try {
      setLoading(true);
      console.log('Fetching bill data with filters:', billFilters);
      const response = await wholesalerBillService.getAllWholesaleBillData(billFilters);
      console.log('Bill data response:', response);
      
      // Handle response structure - api.js interceptor returns response.data
      const data = response.data || response;
      
      // Ensure dispatches is always an array
      const normalizedData = {
        dispatches: Array.isArray(data?.dispatches) ? data.dispatches : [],
        totalAmount: data?.totalAmount || 0,
        itemCount: data?.itemCount || 0
      };
      
      setBillData(normalizedData);
    } catch (error) {
      console.error('Error fetching bill data:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', error ? Object.keys(error) : 'null');
      
      let errorMessage = 'Failed to fetch bill data';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage += `: ${error.message}`;
      } else if (error?.error) {
        errorMessage += `: ${error.error}`;
      }
      
      alert(errorMessage);
      setBillData({ dispatches: [], totalAmount: 0, itemCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!billDate) {
      alert('Please enter a bill date');
      return;
    }

    if (selectedDispatches.length === 0 && !billFilters.startDate && !billFilters.endDate) {
      alert('Please select dispatches or specify a date range');
      return;
    }

    try {
      setGeneratingPDF(true);
      const response = await wholesalerBillService.generateAllWholesaleBill({
        billDate,
        startDate: billFilters.startDate,
        endDate: billFilters.endDate,
        dispatchIds: selectedDispatches
      });

      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wholesale-bill-${billDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Bill generated successfully!');
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Failed to generate bill');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDispatchSelection = (dispatchId) => {
    setSelectedDispatches(prev => {
      if (prev.includes(dispatchId)) {
        return prev.filter(id => id !== dispatchId);
      } else {
        return [...prev, dispatchId];
      }
    });
  };

  if (loading && wholesalers.length === 0 && billData.dispatches.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
        {/* Header with Tabs */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wholesaler Management</h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('wholesalers')}
                className={`${
                  activeTab === 'wholesalers'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Wholesalers
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`${
                  activeTab === 'billing'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Bill Generation
              </button>
            </nav>
          </div>
        </div>

        {/* Wholesalers Tab Content */}
        {activeTab === 'wholesalers' && (
          <>
            {/* Header Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                + Add Wholesaler
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Search"
                  placeholder="Search by name, business, or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={filter.active === undefined ? 'all' : filter.active}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilter({ 
                        ...filter, 
                        active: value === 'all' ? undefined : value === 'true' 
                      });
                    }}
                  >
                    <option value="all">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Wholesalers Table */}
            <Card>
              <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding
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
                {wholesalers.map((wholesaler) => (
                  <tr key={wholesaler._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{wholesaler.businessName}</div>
                      {wholesaler.gstNumber && (
                        <div className="text-xs text-gray-500">GST: {wholesaler.gstNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {wholesaler.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {wholesaler.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {wholesaler.city ? `${wholesaler.city}, ${wholesaler.state}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{wholesaler.creditLimit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        wholesaler.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ₹{wholesaler.outstandingBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        wholesaler.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {wholesaler.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(wholesaler)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(wholesaler._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {wholesalers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No wholesalers found
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="text-sm text-gray-700">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
        </>
        )}

        {/* Billing Tab Content */}
        {activeTab === 'billing' && (
          <>
            {/* Bill Date and Filters */}
            <Card>
              <h2 className="text-lg font-semibold mb-4">Bill Generation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Bill Date *"
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  required
                />
                <Input
                  label="Start Date (Filter)"
                  type="date"
                  value={billFilters.startDate}
                  onChange={(e) => setBillFilters({ ...billFilters, startDate: e.target.value })}
                />
                <Input
                  label="End Date (Filter)"
                  type="date"
                  value={billFilters.endDate}
                  onChange={(e) => setBillFilters({ ...billFilters, endDate: e.target.value })}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  * Bill Date: The date that will appear on the PDF bill (can be any date)
                </p>
                <p className="text-sm text-gray-600">
                  * Date Filters: Select date range to filter wholesale dispatches
                </p>
              </div>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="text-sm text-gray-600">Total Dispatches</div>
                <div className="text-2xl font-bold">{billData.dispatches?.length || 0}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-600">Total Items</div>
                <div className="text-2xl font-bold">{billData.itemCount || 0}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{(billData.totalAmount || 0).toFixed(2)}
                </div>
              </Card>
            </div>

            {/* Dispatches Table */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Wholesale Dispatches</h3>
                <Button
                  onClick={handleGenerateBill}
                  disabled={generatingPDF || billData.dispatches?.length === 0}
                >
                  {generatingPDF ? 'Generating...' : '📄 Generate PDF Bill'}
                </Button>
              </div>

              {loading ? (
                <Loading />
              ) : billData.dispatches?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No wholesale dispatches found for the selected criteria
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDispatches(billData.dispatches.map(d => d._id));
                              } else {
                                setSelectedDispatches([]);
                              }
                            }}
                            checked={selectedDispatches.length === billData.dispatches?.length}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {billData.dispatches?.map((dispatch) => (
                        <tr key={dispatch._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedDispatches.includes(dispatch._id)}
                              onChange={() => handleDispatchSelection(dispatch._id)}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(dispatch.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-sm">{dispatch.driverId?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{dispatch.driverId?.vehicleNumber || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm">{dispatch.items?.length || 0}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            ₹{(dispatch.totalAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingWholesaler ? 'Edit Wholesaler' : 'Add New Wholesaler'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Person Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Business Name *"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
              />

              <Input
                label="Phone *"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={10}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />

              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />

              <Input
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                pattern="[0-9]{6}"
                placeholder="6 digits (e.g., 110001)"
              />

              <Input
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                maxLength={15}
                placeholder="22AAAAA0000A1Z5 (optional)"
              />

              <Input
                label="Credit Limit *"
                name="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={handleChange}
                required
                min={0}
              />

              <Input
                label="Outstanding Balance"
                name="outstandingBalance"
                type="number"
                value={formData.outstandingBalance}
                onChange={handleChange}
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                maxLength={500}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Active</label>
            </div>

            <div className="flex justify-end space-x-3">
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
              <Button type="submit">
                {editingWholesaler ? 'Update' : 'Create'} Wholesaler
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
};

export default WholesalerManagement;
