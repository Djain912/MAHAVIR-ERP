/**
 * PickList Extraction Management Page
 * Upload, view, and manage extracted pick lists from PDFs
 */

import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import * as pickListService from '../services/pickListExtractedService';

export default function PickListExtraction() {
  const [pickLists, setPickLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPickList, setSelectedPickList] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({
    active: true,
    vehicleNumber: '',
    salesMan: '',
    loadoutType: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchPickLists();
    fetchStats();
  }, [searchTerm, filter, pagination.page]);

  const fetchPickLists = async () => {
    try {
      setLoading(true);
      const response = await pickListService.getAllPickLists({
        search: searchTerm,
        ...filter,
        page: pagination.page,
        limit: pagination.limit
      });

      // Ensure pickLists is always an array
      const pickListsArray = Array.isArray(response.data) ? response.data : 
                             Array.isArray(response) ? response : [];
      setPickLists(pickListsArray);
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching pick lists:', error);
      setPickLists([]); // Set empty array on error
      alert('Failed to fetch pick lists');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await pickListService.getPickListStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
      e.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first');
      return;
    }

    try {
      setUploading(true);
      const response = await pickListService.uploadAndExtractPickList(selectedFile);
      
      // Backend returns { pickList, stockReduction } or { pickList, stockReductionError }
      const pickList = response.data.pickList || response.data;
      const pickListNumber = pickList.pickListNumber || 'N/A';
      const totalItems = pickList.items?.length || pickList.totalItems || 0;
      const stockReduction = response.data.stockReduction;
      
      let message = `✅ Pick list extracted successfully!\nPick List: ${pickListNumber}\nItems: ${totalItems} products`;
      
      if (stockReduction) {
        if (stockReduction.success) {
          message += `\n✅ Stock reduced: ${stockReduction.itemsProcessed} items processed`;
        } else {
          message += `\n⚠️ Stock reduction: ${stockReduction.itemsProcessed} succeeded, ${stockReduction.itemsFailed} failed`;
          message += `\n${stockReduction.message}`;
        }
      } else if (response.data.stockReductionError) {
        message += `\n❌ Stock reduction failed: ${response.data.stockReductionError}`;
      }
      
      alert(message);
      
      setSelectedFile(null);
      document.getElementById('pdfUpload').value = '';
      fetchPickLists();
      fetchStats();
    } catch (error) {
      console.error('Error uploading pick list:', error);
      if (error.message && error.message.includes('already extracted')) {
        alert('⚠️ This pick list has already been extracted');
      } else {
        alert('❌ Failed to extract pick list: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleViewDetails = async (pickList) => {
    try {
      const fullData = await pickListService.getPickListById(pickList._id);
      setSelectedPickList(fullData);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching pick list details:', error);
      alert('Failed to load pick list details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pick list?')) {
      return;
    }

    try {
      await pickListService.deletePickList(id);
      alert('Pick list deleted successfully');
      fetchPickLists();
      fetchStats();
    } catch (error) {
      console.error('Error deleting pick list:', error);
      alert('Failed to delete pick list');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pick List Extraction</h1>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-sm text-gray-600">Total Pick Lists</div>
            <div className="text-2xl font-bold">{stats.totalPickLists || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Total Items</div>
            <div className="text-2xl font-bold">{stats.totalItems || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Total Sell Qty</div>
            <div className="text-2xl font-bold">{stats.totalSellQty?.toFixed(2) || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Unique Vehicles</div>
            <div className="text-2xl font-bold">{stats.uniqueVehicles || 0}</div>
          </Card>
        </div>
      )}

      {/* Upload Section */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Upload Pick List PDF</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Select PDF File
            </label>
            <input
              id="pdfUpload"
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={uploading}
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Extracting...' : 'Upload & Extract'}
          </Button>
        </div>
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </Card>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pick list, vehicle, salesman..."
          />
          <Input
            label="Vehicle Number"
            value={filter.vehicleNumber}
            onChange={(e) => setFilter({ ...filter, vehicleNumber: e.target.value })}
            placeholder="e.g., MH01CV8603"
          />
          <Input
            label="Sales Man"
            value={filter.salesMan}
            onChange={(e) => setFilter({ ...filter, salesMan: e.target.value })}
            placeholder="Salesman name"
          />
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filter.active}
              onChange={(e) => setFilter({ ...filter, active: e.target.value === 'true' })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Pick Lists Table */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Extracted Pick Lists</h2>
        
        {loading ? (
          <Loading />
        ) : pickLists.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pick lists found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pick List #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loadout #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Man</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sell Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(pickLists) && pickLists.length > 0 ? (
                    pickLists.map((pickList) => (
                      <tr key={pickList._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">{pickList.pickListNumber}</td>
                        <td className="px-4 py-3 text-sm">{pickList.loadoutNumber}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{pickList.vehicleNumber}</td>
                        <td className="px-4 py-3 text-sm">{formatDate(pickList.loadOutDate)}</td>
                        <td className="px-4 py-3 text-sm">{pickList.route}</td>
                        <td className="px-4 py-3 text-sm">{pickList.salesMan}</td>
                        <td className="px-4 py-3 text-sm text-center">{pickList.totalItems}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">{pickList.totalSellQty?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(pickList)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(pickList._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        {loading ? 'Loading pick lists...' : 'No pick lists found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {pickLists.length} of {pagination.total} pick lists
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  variant="secondary"
                >
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Details Modal */}
      {showDetails && selectedPickList && (
        <Modal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedPickList(null);
          }}
          title="Pick List Details"
          size="large"
        >
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <div className="text-xs text-gray-500">Pick List Number</div>
                <div className="font-semibold font-mono">{selectedPickList.pickListNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Loadout Number</div>
                <div className="font-semibold">{selectedPickList.loadoutNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Vehicle Number</div>
                <div className="font-semibold">{selectedPickList.vehicleNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Load Out Date</div>
                <div className="font-semibold">{formatDate(selectedPickList.loadOutDate)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Route</div>
                <div className="font-semibold">{selectedPickList.route}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Sales Man</div>
                <div className="font-semibold">{selectedPickList.salesMan}</div>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-xs text-blue-600">Total Items</div>
                <div className="text-xl font-bold text-blue-700">{selectedPickList.totalItems}</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-xs text-green-600">LO Qty</div>
                <div className="text-xl font-bold text-green-700">{selectedPickList.totalLoQty?.toFixed(2)}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-xs text-purple-600">Sell Qty</div>
                <div className="text-xl font-bold text-purple-700">{selectedPickList.totalSellQty?.toFixed(2)}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <div className="text-xs text-orange-600">Load In Qty</div>
                <div className="text-xl font-bold text-orange-700">{selectedPickList.totalLoadInQty?.toFixed(2)}</div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-3">Items ({selectedPickList.items?.length})</h3>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Code</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Category1</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Category2</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">MRP</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">LO Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Sell Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Load In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {selectedPickList.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-xs">{item.itemCode}</td>
                        <td className="px-3 py-2 font-medium">{item.itemName}</td>
                        <td className="px-3 py-2">{item.category1}</td>
                        <td className="px-3 py-2">{item.category2}</td>
                        <td className="px-3 py-2 text-right">₹{item.mrp?.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">{item.loQty?.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-green-600">{item.sellQty?.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">{item.totalLoadInQty?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
