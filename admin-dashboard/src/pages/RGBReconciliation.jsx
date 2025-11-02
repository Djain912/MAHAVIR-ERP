import React, { useState, useEffect } from 'react';
import { getAllPickLists, getPickListById, getRGBTracking } from '../services/pickListExtractedService';

const RGBReconciliation = () => {
  const [pickLists, setPickLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPickList, setSelectedPickList] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rgbTracking, setRgbTracking] = useState(null);
  const [loadingRGB, setLoadingRGB] = useState(false);

  useEffect(() => {
    fetchPickLists();
  }, []);

  const fetchPickLists = async () => {
    try {
      setLoading(true);
      const response = await getAllPickLists();
      const pickListsArray = response.data || response;
      // Sort by most recent first
      const sorted = pickListsArray.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPickLists(sorted);
    } catch (error) {
      console.error('Error fetching pick lists:', error);
      alert('Failed to load pick lists');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (pickList) => {
    setSelectedPickList(pickList);
    setShowDetails(true);
    setRgbTracking(null);
    
    // Fetch RGB tracking data for this pick list
    try {
      setLoadingRGB(true);
      const response = await getRGBTracking({ pickListId: pickList._id });
      if (response.data && response.data.length > 0) {
        setRgbTracking(response.data[0]); // Get the first (most recent) RGB tracking record
      }
    } catch (error) {
      console.error('Error fetching RGB tracking:', error);
    } finally {
      setLoadingRGB(false);
    }
  };

  const getStatusBadge = (pickList) => {
    if (!pickList.stockReduced) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Stock Pending</span>;
    }
    if (pickList.rgbProcessed) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">RGB Processed</span>;
    }
    if (pickList.stockReduced) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Stock Reduced</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">New</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reconciliation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">RGB Reconciliation</h1>
              <p className="text-gray-600 mt-2">Track pick lists, stock reduction, and RGB returns</p>
            </div>
            <button
              onClick={fetchPickLists}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-semibold">Total Pick Lists</p>
              <p className="text-2xl font-bold text-blue-800">{pickLists.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-semibold">Stock Reduced</p>
              <p className="text-2xl font-bold text-green-800">
                {pickLists.filter(pl => pl.stockReduced).length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-semibold">RGB Processed</p>
              <p className="text-2xl font-bold text-purple-800">
                {pickLists.filter(pl => pl.rgbProcessed).length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600 font-semibold">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">
                {pickLists.filter(pl => !pl.stockReduced).length}
              </p>
            </div>
          </div>
        </div>

        {/* Pick Lists Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pick List #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pickLists.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No pick lists found. Upload a PDF to get started.
                    </td>
                  </tr>
                ) : (
                  pickLists.map((pickList) => (
                    <tr key={pickList._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {pickList.pickListNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pickList.vehicleNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pickList.items?.length || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pickList.totalLoQty || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pickList)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(pickList.loadOutDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(pickList)}
                          className="text-red-600 hover:text-red-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedPickList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Pick List: {selectedPickList.pickListNumber}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Vehicle Number</p>
                  <p className="text-lg font-semibold">{selectedPickList.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Driver</p>
                  <p className="text-lg font-semibold">{selectedPickList.salesMan || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Load Out Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(selectedPickList.loadOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-lg font-semibold">{selectedPickList.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Quantity</p>
                  <p className="text-lg font-semibold">{selectedPickList.totalLoQty || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Collection</p>
                  <p className="text-lg font-semibold text-green-600">₹{selectedPickList.totalCollectionAmt?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">RGB Crates Loaded</p>
                  <p className="text-lg font-semibold text-blue-600">{selectedPickList.rgbCratesLoaded || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Load Out Type</p>
                  <p className="text-lg font-semibold">{selectedPickList.loadOutType || 'N/A'}</p>
                </div>
              </div>

              {/* Stock Reduction Status */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Stock Reduction</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedPickList.stockReduced ? (
                    <div>
                      <p className="text-green-600 font-semibold">✅ Stock Reduced</p>
                      <p className="text-sm text-gray-600">
                        Reduced at: {new Date(selectedPickList.stockReducedAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-yellow-600 font-semibold">⚠️ Stock Not Yet Reduced</p>
                      {selectedPickList.stockReductionError && (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {selectedPickList.stockReductionError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RGB Tracking Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">RGB (Returnable Glass Bottles) Tracking</h3>
                {loadingRGB ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">Loading RGB data...</p>
                  </div>
                ) : rgbTracking ? (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    {/* RGB Status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          rgbTracking.status === 'verified' ? 'bg-green-100 text-green-800' :
                          rgbTracking.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          rgbTracking.status === 'settled' ? 'bg-gray-100 text-gray-800' :
                          rgbTracking.status === 'disputed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rgbTracking.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="text-sm font-semibold">
                          {rgbTracking.submittedAt ? new Date(rgbTracking.submittedAt).toLocaleString() : 'Not yet'}
                        </p>
                      </div>
                    </div>

                    {/* RGB Crates Info */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Loaded Crates</p>
                        <p className="text-2xl font-bold text-blue-600">{rgbTracking.totalLoadedCrates}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Sold Crates</p>
                        <p className="text-2xl font-bold text-green-600">{rgbTracking.totalSoldCrates}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Returned Full</p>
                        <p className="text-2xl font-bold text-purple-600">{rgbTracking.returnedFullCrates}</p>
                      </div>
                    </div>

                    {/* Empty Bottles Reconciliation */}
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold mb-3 text-gray-800">Empty Bottles Reconciliation</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Expected Empty Crates</p>
                          <p className="text-xl font-bold text-gray-800">{rgbTracking.expectedEmptyCrates}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Returned Empty Crates</p>
                          <p className="text-xl font-bold text-green-600">{rgbTracking.returnedEmptyCrates}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Missing Empty Crates</p>
                          <p className="text-xl font-bold text-red-600">{rgbTracking.missingEmptyCrates}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Penalty Amount</p>
                          <p className="text-xl font-bold text-red-600">₹{rgbTracking.penaltyAmount}</p>
                          <p className="text-xs text-gray-500">@ ₹{rgbTracking.emptyBottleValue} per crate</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {rgbTracking.notes && (
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm text-gray-800">{rgbTracking.notes}</p>
                      </div>
                    )}

                    {/* Dispute Info if any */}
                    {rgbTracking.status === 'disputed' && rgbTracking.disputeReason && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-red-800">⚠️ Dispute Reason</p>
                        <p className="text-sm text-gray-800">{rgbTracking.disputeReason}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">ℹ️ No RGB tracking data yet. Driver needs to submit collection details.</p>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Items ({selectedPickList.items?.length || 0})</h3>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">LO Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sell Qty</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedPickList.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.itemCode}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.itemName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.loQty}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.sellQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RGBReconciliation;
