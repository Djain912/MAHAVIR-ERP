import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import * as cashCollectionService from '../services/cashCollectionService';
import * as driverService from '../services/driverService';

const CashReconciliation = () => {
  const [collections, setCollections] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [filter, setFilter] = useState({ status: '', driverId: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const DENOMINATION_VALUES = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

  useEffect(() => {
    fetchData();
  }, [filter, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [collectionsData, driversData] = await Promise.all([
        cashCollectionService.getAllCashCollections({
          ...filter,
          page: pagination.page,
          limit: pagination.limit
        }),
        driverService.getAllDrivers({ active: true })
      ]);

      setCollections(collectionsData.data || []);
      setDrivers(driversData.data || []);
      
      if (collectionsData.pagination) {
        setPagination(collectionsData.pagination);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch cash collections');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (collection) => {
    setSelectedCollection(collection);
    setShowDetailsModal(true);
  };

  const handleVerify = async (collectionId, notes = '') => {
    if (!window.confirm('Are you sure you want to verify this cash collection?')) {
      return;
    }

    try {
      await cashCollectionService.verifyCashCollection(collectionId, notes);
      alert('Cash collection verified successfully');
      fetchData();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error verifying collection:', error);
      alert('Failed to verify cash collection');
    }
  };

  const handleReconcile = async (collectionId, notes = '') => {
    if (!window.confirm('Are you sure you want to reconcile this cash collection?')) {
      return;
    }

    try {
      await cashCollectionService.reconcileCashCollection(collectionId, notes);
      alert('Cash collection reconciled successfully');
      fetchData();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error reconciling collection:', error);
      alert('Failed to reconcile cash collection');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Submitted: 'bg-yellow-100 text-yellow-800',
      Verified: 'bg-blue-100 text-blue-800',
      Reconciled: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getVarianceColor = (variance) => {
    if (variance === 0) return 'text-green-600';
    if (Math.abs(variance) < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading && collections.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Cash Reconciliation</h1>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filter.driverId}
                onChange={(e) => setFilter({ ...filter, driverId: e.target.value })}
              >
                <option value="">All Drivers</option>
                {drivers.map(driver => (
                  <option key={driver._id} value={driver._id}>{driver.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
                <option value="Reconciled">Reconciled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
              <Button onClick={fetchData}>Refresh</Button>
            </div>
          </div>
        </Card>

        {/* Collections Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Cash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collected Cash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance
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
                {collections.map((collection) => (
                  <tr key={collection._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(collection.collectionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {collection.driverId?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {collection.driverId?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{collection.expectedCash.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{collection.totalCashCollected.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${getVarianceColor(collection.variance)}`}>
                        {collection.variance >= 0 ? '+' : ''}₹{collection.variance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(collection.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleViewDetails(collection)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {collection.status === 'Submitted' && (
                        <button
                          onClick={() => handleVerify(collection._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Verify
                        </button>
                      )}
                      {collection.status === 'Verified' && (
                        <button
                          onClick={() => handleReconcile(collection._id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Reconcile
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {collections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No cash collections found
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
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

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Cash Collection Details"
        >
          {selectedCollection && (
            <div className="space-y-6">
              {/* Driver and Date Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="font-medium">{selectedCollection.driverId?.name}</p>
                  <p className="text-sm text-gray-500">{selectedCollection.driverId?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Collection Date</p>
                  <p className="font-medium">
                    {new Date(selectedCollection.collectionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Cash Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Expected</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{selectedCollection.expectedCash.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Collected</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{selectedCollection.totalCashCollected.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Variance</p>
                    <p className={`text-lg font-bold ${getVarianceColor(selectedCollection.variance)}`}>
                      {selectedCollection.variance >= 0 ? '+' : ''}₹{selectedCollection.variance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Denominations Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Cash Denominations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Denomination
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Count
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedCollection.denominations
                        .filter(d => d.noteCount > 0)
                        .sort((a, b) => b.noteValue - a.noteValue)
                        .map((denom, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              ₹{denom.noteValue}
                            </td>
                            <td className="px-4 py-2 text-sm text-center text-gray-900">
                              {denom.noteCount}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                              ₹{denom.totalValue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="2" className="px-4 py-2 text-sm font-bold text-gray-900">
                          Total Cash Collected
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-right text-gray-900">
                          ₹{selectedCollection.totalCashCollected.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedCollection.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                    {selectedCollection.notes}
                  </p>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(selectedCollection.status)}
                </div>
                <div className="space-x-3">
                  {selectedCollection.status === 'Submitted' && (
                    <Button onClick={() => handleVerify(selectedCollection._id)}>
                      Verify Collection
                    </Button>
                  )}
                  {selectedCollection.status === 'Verified' && (
                    <Button onClick={() => handleReconcile(selectedCollection._id)}>
                      Reconcile Collection
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
  );
};

export default CashReconciliation;
