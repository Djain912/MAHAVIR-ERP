/**
 * Cheque Management Page
 * Manage all cheques with filters, bulk updates, and PDF reports
 */

import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Loading from '../components/Loading';
import * as chequeService from '../services/chequeService';
import * as driverService from '../services/driverService';
import * as retailerService from '../services/retailerService';

const ChequeManagement = () => {
  // State
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    bankName: '',
    retailerId: '',
    driverId: '',
    chequeNumber: '',
    page: 1,
    limit: 50
  });

  // Selection
  const [selectedCheques, setSelectedCheques] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Bulk update modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('Cleared');
  const [bulkRemarks, setBulkRemarks] = useState('');

  // Load initial data
  useEffect(() => {
    loadDrivers();
    loadRetailers();
  }, []);

  useEffect(() => {
    loadCheques();
    loadSummary();
  }, [filters]);

  const loadDrivers = async () => {
    try {
      const data = await driverService.getAllDrivers();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading drivers:', error);
      setDrivers([]);
    }
  };

  const loadRetailers = async () => {
    try {
      const data = await retailerService.getAllRetailers();
      setRetailers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading retailers:', error);
      setRetailers([]);
    }
  };

  const loadCheques = async () => {
    try {
      setLoading(true);
      const data = await chequeService.getAllCheques(filters);
      
      console.log('=== CHEQUE DEBUG ===');
      console.log('API Response:', data);
      console.log('Has cheques property?', data && data.cheques);
      console.log('Is array?', Array.isArray(data));
      console.log('Cheques count:', data?.cheques?.length || 0);
      console.log('==================');
      
      // Handle response structure
      if (data && data.cheques) {
        setCheques(data.cheques);
        setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        // If data is directly an array
        setCheques(data);
        setPagination({ total: data.length, page: 1, pages: 1 });
      } else {
        // Empty response
        setCheques([]);
        setPagination({ total: 0, page: 1, pages: 1 });
      }
    } catch (error) {
      console.error('Error loading cheques:', error);
      setCheques([]);
      setPagination({ total: 0, page: 1, pages: 1 });
      alert('Failed to load cheques: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await chequeService.getChequeSummary(
        filters.startDate,
        filters.endDate
      );
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
      // Set default summary on error
      setSummary({
        totalCheques: 0,
        totalAmount: 0,
        pending: { count: 0, amount: 0 },
        deposited: { count: 0, amount: 0 },
        cleared: { count: 0, amount: 0 },
        bounced: { count: 0, amount: 0 }
      });
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page on filter change
    }));
    setSelectedCheques(new Set());
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCheques(new Set());
    } else {
      const allIds = new Set(cheques.map(c => c._id));
      setSelectedCheques(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCheque = (chequeId) => {
    const newSelected = new Set(selectedCheques);
    if (newSelected.has(chequeId)) {
      newSelected.delete(chequeId);
    } else {
      newSelected.add(chequeId);
    }
    setSelectedCheques(newSelected);
    setSelectAll(newSelected.size === cheques.length);
  };

  const deselectBounced = () => {
    const newSelected = new Set(selectedCheques);
    cheques.forEach(cheque => {
      if (cheque.status === 'Bounced') {
        newSelected.delete(cheque._id);
      }
    });
    setSelectedCheques(newSelected);
    setSelectAll(false);
  };

  const handleBulkUpdate = async () => {
    if (selectedCheques.size === 0) {
      alert('Please select cheques to update');
      return;
    }

    try {
      setLoading(true);
      const result = await chequeService.bulkUpdateChequeStatus(
        Array.from(selectedCheques),
        bulkStatus,
        bulkRemarks
      );
      
      const success = result?.success || 0;
      const failed = result?.failed || 0;
      
      alert(`Updated ${success} cheques successfully${failed > 0 ? `, ${failed} failed` : ''}`);
      
      setShowBulkModal(false);
      setBulkRemarks('');
      setSelectedCheques(new Set());
      setSelectAll(false);
      
      loadCheques();
      loadSummary();
    } catch (error) {
      console.error('Error bulk updating:', error);
      alert('Failed to update cheques: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      await chequeService.downloadChequePDF(filters);
      alert('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromSales = async () => {
    if (!window.confirm('Import all cheques from sales? This may take a while.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await chequeService.importChequesFromSales();
      
      const imported = result?.imported || 0;
      alert(`Imported ${imported} cheques from sales`);
      
      loadCheques();
      loadSummary();
    } catch (error) {
      console.error('Error importing:', error);
      alert('Failed to import cheques: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Deposited': 'bg-blue-100 text-blue-800',
      'Cleared': 'bg-green-100 text-green-800',
      'Bounced': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && cheques.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Cheque Management</h1>
        <div className="space-x-2">
          <Button onClick={handleImportFromSales} variant="secondary">
            Import from Sales
          </Button>
          <Button onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Total Cheques</div>
            <div className="text-2xl font-bold">{summary.totalCheques}</div>
            <div className="text-sm text-gray-500">
              ₹{summary.totalAmount.toLocaleString()}
            </div>
          </Card>
          
          <Card className="p-4 bg-yellow-50">
            <div className="text-sm text-yellow-700">Pending</div>
            <div className="text-2xl font-bold text-yellow-800">
              {summary.pending.count}
            </div>
            <div className="text-sm text-yellow-600">
              ₹{summary.pending.amount.toLocaleString()}
            </div>
          </Card>
          
          <Card className="p-4 bg-blue-50">
            <div className="text-sm text-blue-700">Deposited</div>
            <div className="text-2xl font-bold text-blue-800">
              {summary.deposited.count}
            </div>
            <div className="text-sm text-blue-600">
              ₹{summary.deposited.amount.toLocaleString()}
            </div>
          </Card>
          
          <Card className="p-4 bg-green-50">
            <div className="text-sm text-green-700">Cleared</div>
            <div className="text-2xl font-bold text-green-800">
              {summary.cleared.count}
            </div>
            <div className="text-sm text-green-600">
              ₹{summary.cleared.amount.toLocaleString()}
            </div>
          </Card>
          
          <Card className="p-4 bg-red-50">
            <div className="text-sm text-red-700">Bounced</div>
            <div className="text-2xl font-bold text-red-800">
              {summary.bounced.count}
            </div>
            <div className="text-sm text-red-600">
              ₹{summary.bounced.amount.toLocaleString()}
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
          
          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
          
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Deposited', label: 'Deposited' },
              { value: 'Cleared', label: 'Cleared' },
              { value: 'Bounced', label: 'Bounced' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
          />
          
          <Input
            label="Bank Name"
            type="text"
            placeholder="Search by bank..."
            value={filters.bankName}
            onChange={(e) => handleFilterChange('bankName', e.target.value)}
          />
          
          <Select
            label="Retailer"
            value={filters.retailerId}
            onChange={(e) => handleFilterChange('retailerId', e.target.value)}
            options={[
              { value: '', label: 'All Retailers' },
              ...retailers.map(r => ({ value: r._id, label: r.name }))
            ]}
          />
          
          <Select
            label="Driver"
            value={filters.driverId}
            onChange={(e) => handleFilterChange('driverId', e.target.value)}
            options={[
              { value: '', label: 'All Drivers' },
              ...drivers.map(d => ({ value: d._id, label: d.name }))
            ]}
          />
          
          <Input
            label="Cheque Number"
            type="text"
            placeholder="Search by number..."
            value={filters.chequeNumber}
            onChange={(e) => handleFilterChange('chequeNumber', e.target.value)}
          />
          
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({
                startDate: '',
                endDate: '',
                status: '',
                bankName: '',
                retailerId: '',
                driverId: '',
                chequeNumber: '',
                page: 1,
                limit: 50
              })}
              variant="secondary"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedCheques.size > 0 && (
        <Card className="p-4 bg-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold">{selectedCheques.size}</span> cheques selected
            </div>
            <div className="space-x-2">
              <Button
                onClick={deselectBounced}
                variant="secondary"
                size="sm"
              >
                Deselect Bounced
              </Button>
              <Button
                onClick={() => setShowBulkModal(true)}
                size="sm"
              >
                Update Status
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Cheques Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cheque #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Retailer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Driver
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cheques.map(cheque => (
                <tr key={cheque._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCheques.has(cheque._id)}
                      onChange={() => handleSelectCheque(cheque._id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(cheque.depositDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {cheque.chequeNumber}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {cheque.retailerId?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {cheque.bankName}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    ₹{cheque.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cheque.status)}`}>
                      {cheque.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {cheque.driverId?.name || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="space-x-2">
              <Button
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
                size="sm"
                variant="secondary"
              >
                Previous
              </Button>
              <span className="px-3 py-1">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={filters.page === pagination.pages}
                size="sm"
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Update {selectedCheques.size} Cheques
            </h3>
            
            <div className="space-y-4">
              <Select
                label="New Status"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                options={[
                  { value: 'Deposited', label: 'Deposited' },
                  { value: 'Cleared', label: 'Cleared' },
                  { value: 'Bounced', label: 'Bounced' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  value={bulkRemarks}
                  onChange={(e) => setBulkRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Enter remarks..."
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleBulkUpdate}
                  className="flex-1"
                >
                  Update
                </Button>
                <Button
                  onClick={() => setShowBulkModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChequeManagement;
