import React, { useState, useEffect } from 'react';
import { getCashCollections, updateCollectionDetails } from '../services/cashCollectionService';
import { createCheque } from '../services/chequeService';
import { getAllRetailers } from '../services/retailerService';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';

export default function DriverCollectionsManagement() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    driverId: '',
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });

  // Modal states
  const [showChequeModal, setShowChequeModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showBounceModal, setShowBounceModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Form states
  const [chequeForm, setChequeForm] = useState({
    chequeNumber: '',
    bankName: '',
    amount: '',
    chequeDate: '',
    partyName: ''
  });

  const [creditForm, setCreditForm] = useState({
    creditAmount: '',
    creditReason: '',
    retailerName: '',
    creditType: 'cash' // cash or cheque
  });

  const [bounceForm, setBounceForm] = useState({
    bounceAmount: '',
    bounceReason: '',
    chequeNumber: '',
    bankName: '',
    bounceType: 'cash' // cash or cheque
  });

  useEffect(() => {
    loadCollections();
    loadRetailers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [collections, filters]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await getCashCollections({
        page: 1,
        limit: 1000
      });
      
      console.log('Collections response:', response);
      console.log('Response data:', response.data);
      console.log('First collection:', response.data?.[0]);
      console.log('First collection driverId:', response.data?.[0]?.driverId);
      
      if (response.success) {
        setCollections(response.data || []);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRetailers = async () => {
    try {
      const response = await getAllRetailers();
      setRetailers(response || []);
    } catch (error) {
      console.error('Error loading retailers:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...collections];

    // Driver filter
    if (filters.driverId) {
      filtered = filtered.filter(c => c.driverId?._id === filters.driverId);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(c => new Date(c.collectionDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(c => new Date(c.collectionDate) <= new Date(filters.endDate));
    }

    // Search term (driver name or ID)
    if (filters.searchTerm) {
      filtered = filtered.filter(c => 
        c.driverId?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        c.driverId?.phone?.includes(filters.searchTerm)
      );
    }

    setFilteredCollections(filtered);
  };

  const handleAddCheque = (collection) => {
    setSelectedCollection(collection);
    setChequeForm({
      chequeNumber: '',
      bankName: '',
      amount: collection.totalChequeReceived || '',
      chequeDate: new Date().toISOString().split('T')[0],
      partyName: collection.driverId?.name || ''
    });
    setShowChequeModal(true);
  };

  const handleAddCredit = (collection) => {
    setSelectedCollection(collection);
    setCreditForm({
      creditAmount: collection.totalCreditGiven || '',
      creditReason: '',
      retailerName: '',
      creditType: 'cash'
    });
    setShowCreditModal(true);
  };

  const handleAddBounce = (collection) => {
    setSelectedCollection(collection);
    setBounceForm({
      bounceAmount: '',
      bounceReason: '',
      chequeNumber: '',
      bankName: '',
      bounceType: 'cash'
    });
    setShowBounceModal(true);
  };

  const submitCheque = async () => {
    try {
      if (!chequeForm.chequeNumber || !chequeForm.bankName || !chequeForm.amount) {
        alert('Please fill all required fields');
        return;
      }

      const chequeData = {
        chequeNumber: chequeForm.chequeNumber,
        amount: parseFloat(chequeForm.amount),
        bankName: chequeForm.bankName,
        partyName: chequeForm.partyName || selectedCollection.driverId?.name,
        partyType: 'Driver',
        partyId: selectedCollection.driverId?._id,
        chequeDate: chequeForm.chequeDate,
        receivedDate: selectedCollection.collectionDate,
        status: 'Received',
        collectionId: selectedCollection._id
      };

      await createCheque(chequeData);
      
      alert('Cheque details saved successfully!');
      setShowChequeModal(false);
      loadCollections();
    } catch (error) {
      console.error('Error saving cheque:', error);
      alert('Error saving cheque details');
    }
  };

  const submitCredit = async () => {
    try {
      if (!creditForm.creditAmount) {
        alert('Please enter credit amount');
        return;
      }

      const creditData = {
        creditAmount: parseFloat(creditForm.creditAmount),
        creditReason: creditForm.creditReason,
        retailerName: creditForm.retailerName,
        creditType: creditForm.creditType,
        collectionId: selectedCollection._id
      };

      // Update collection with credit details
      await updateCollectionDetails(selectedCollection._id, {
        creditDetails: creditData
      });

      alert('Credit details saved successfully!');
      setShowCreditModal(false);
      loadCollections();
    } catch (error) {
      console.error('Error saving credit:', error);
      alert('Error saving credit details');
    }
  };

  const submitBounce = async () => {
    try {
      if (!bounceForm.bounceAmount) {
        alert('Please enter bounce amount');
        return;
      }

      const bounceData = {
        bounceAmount: parseFloat(bounceForm.bounceAmount),
        bounceReason: bounceForm.bounceReason,
        chequeNumber: bounceForm.chequeNumber,
        bankName: bounceForm.bankName,
        bounceType: bounceForm.bounceType,
        collectionId: selectedCollection._id
      };

      // Update collection with bounce details
      await updateCollectionDetails(selectedCollection._id, {
        bounceDetails: bounceData
      });

      alert('Bounce details saved successfully!');
      setShowBounceModal(false);
      loadCollections();
    } catch (error) {
      console.error('Error saving bounce:', error);
      alert('Error saving bounce details');
    }
  };

  const getVarianceColor = (variance) => {
    if (variance === 0) return 'text-green-600';
    if (Math.abs(variance) < 100) return 'text-yellow-600';
    return variance > 0 ? 'text-green-600' : 'text-red-600';
  };

  const uniqueDrivers = [...new Set(collections.map(c => c.driverId?._id))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Driver Collections Management</h1>
          <p className="text-gray-600 mt-1">Manage cheques, credits, and bounce details for all driver collections</p>
        </div>
        <Button onClick={loadCollections}>
          Refresh
        </Button>
      </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Driver</label>
              <Input
                type="text"
                placeholder="Name or Phone"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
                <option value="Reconciled">Reconciled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => setFilters({ driverId: '', status: '', startDate: '', endDate: '', searchTerm: '' })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-blue-600 text-sm font-medium">Total Collections</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">{filteredCollections.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-green-600 text-sm font-medium">Total Cash Collected</div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              ₹{filteredCollections.reduce((sum, c) => sum + (c.totalCashCollected || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-purple-600 text-sm font-medium">Total Cheques</div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              ₹{filteredCollections.reduce((sum, c) => sum + (c.totalChequeReceived || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-6">
            <div className="text-orange-600 text-sm font-medium">Total Credit Given</div>
            <div className="text-3xl font-bold text-orange-900 mt-2">
              ₹{filteredCollections.reduce((sum, c) => sum + (c.totalCreditGiven || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Collections Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bottles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCollections.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                      No collections found
                    </td>
                  </tr>
                ) : (
                  filteredCollections.map((collection) => (
                    <tr key={collection._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(collection.collectionDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{collection.driverId?.name}</div>
                        <div className="text-sm text-gray-500">{collection.driverId?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{collection.expectedCash?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{((collection.totalCashCollected || 0) + 
                           (collection.creditReceivedCash || 0) + 
                           (collection.bounceReceivedCash || 0)).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{((collection.totalChequeReceived || 0) + 
                           (collection.creditReceivedCheque || 0) + 
                           (collection.bounceReceivedCheque || 0)).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{collection.totalOnlineReceived?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{collection.totalCreditGiven?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {collection.emptyBottlesReceived || 0}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getVarianceColor(collection.variance)}`}>
                        {collection.variance >= 0 ? '+' : ''}₹{collection.variance?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${collection.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                            collection.status === 'Reconciled' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {collection.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {collection.totalChequeReceived > 0 && (
                            <button
                              onClick={() => handleAddCheque(collection)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                              title="Add Cheque Details"
                            >
                              💳
                            </button>
                          )}
                          {collection.totalCreditGiven > 0 && (
                            <button
                              onClick={() => handleAddCredit(collection)}
                              className="text-orange-600 hover:text-orange-900 font-medium"
                              title="Add Credit Details"
                            >
                              💰
                            </button>
                          )}
                          <button
                            onClick={() => handleAddBounce(collection)}
                            className="text-red-600 hover:text-red-900 font-medium"
                            title="Add Bounce Details"
                          >
                            ⚠️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cheque Modal */}
        {showChequeModal && (
          <Modal
            isOpen={showChequeModal}
            onClose={() => setShowChequeModal(false)}
            title="Add Cheque Details"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                <Input
                  type="text"
                  value={selectedCollection?.driverId?.name}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Number *</label>
                <Input
                  type="text"
                  value={chequeForm.chequeNumber}
                  onChange={(e) => setChequeForm({ ...chequeForm, chequeNumber: e.target.value })}
                  placeholder="Enter cheque number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                <Input
                  type="text"
                  value={chequeForm.bankName}
                  onChange={(e) => setChequeForm({ ...chequeForm, bankName: e.target.value })}
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <Input
                  type="number"
                  value={chequeForm.amount}
                  onChange={(e) => setChequeForm({ ...chequeForm, amount: e.target.value })}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date *</label>
                <Input
                  type="date"
                  value={chequeForm.chequeDate}
                  onChange={(e) => setChequeForm({ ...chequeForm, chequeDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party Name</label>
                <Input
                  type="text"
                  value={chequeForm.partyName}
                  onChange={(e) => setChequeForm({ ...chequeForm, partyName: e.target.value })}
                  placeholder="Enter party name (optional)"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <Button onClick={submitCheque} className="flex-1">
                  Save Cheque
                </Button>
                <Button variant="secondary" onClick={() => setShowChequeModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Credit Modal */}
        {showCreditModal && (
          <Modal
            isOpen={showCreditModal}
            onClose={() => setShowCreditModal(false)}
            title="Add Credit Details"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                <Input
                  type="text"
                  value={selectedCollection?.driverId?.name}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Type *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={creditForm.creditType}
                  onChange={(e) => setCreditForm({ ...creditForm, creditType: e.target.value })}
                >
                  <option value="cash">Cash Credit</option>
                  <option value="cheque">Cheque Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Amount *</label>
                <Input
                  type="number"
                  value={creditForm.creditAmount}
                  onChange={(e) => setCreditForm({ ...creditForm, creditAmount: e.target.value })}
                  placeholder="Enter credit amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retailer Name</label>
                <input
                  type="text"
                  list="retailers-list"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={creditForm.retailerName}
                  onChange={(e) => setCreditForm({ ...creditForm, retailerName: e.target.value })}
                  placeholder="Search and select retailer"
                />
                <datalist id="retailers-list">
                  {retailers.map((retailer) => (
                    <option key={retailer._id} value={retailer.name}>
                      {retailer.name} - {retailer.phone}
                    </option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  value={creditForm.creditReason}
                  onChange={(e) => setCreditForm({ ...creditForm, creditReason: e.target.value })}
                  placeholder="Enter reason for credit"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <Button onClick={submitCredit} className="flex-1">
                  Save Credit
                </Button>
                <Button variant="secondary" onClick={() => setShowCreditModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Bounce Modal */}
        {showBounceModal && (
          <Modal
            isOpen={showBounceModal}
            onClose={() => setShowBounceModal(false)}
            title="Add Bounce Details"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                <Input
                  type="text"
                  value={selectedCollection?.driverId?.name}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bounce Type *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={bounceForm.bounceType}
                  onChange={(e) => setBounceForm({ ...bounceForm, bounceType: e.target.value })}
                >
                  <option value="cash">Cash Bounce</option>
                  <option value="cheque">Cheque Bounce</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bounce Amount *</label>
                <Input
                  type="number"
                  value={bounceForm.bounceAmount}
                  onChange={(e) => setBounceForm({ ...bounceForm, bounceAmount: e.target.value })}
                  placeholder="Enter bounce amount"
                />
              </div>
              {bounceForm.bounceType === 'cheque' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Number</label>
                    <Input
                      type="text"
                      value={bounceForm.chequeNumber}
                      onChange={(e) => setBounceForm({ ...bounceForm, chequeNumber: e.target.value })}
                      placeholder="Enter cheque number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <Input
                      type="text"
                      value={bounceForm.bankName}
                      onChange={(e) => setBounceForm({ ...bounceForm, bankName: e.target.value })}
                      placeholder="Enter bank name"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bounce Reason</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  value={bounceForm.bounceReason}
                  onChange={(e) => setBounceForm({ ...bounceForm, bounceReason: e.target.value })}
                  placeholder="Enter reason for bounce"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <Button onClick={submitBounce} className="flex-1">
                  Save Bounce
                </Button>
                <Button variant="secondary" onClick={() => setShowBounceModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
    </div>
  );
}
