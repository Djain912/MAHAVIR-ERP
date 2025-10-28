/**
 * Counter Sales Page
 * On-the-spot sales to wholesalers and walk-in customers
 */

import { useState, useEffect } from 'react';
import {
  createCounterSale,
  getAllCounterSales,
  getDailySummary,
  getAvailableProducts,
  deleteCounterSale
} from '../services/counterSaleService';
import { getAllWholesalers } from '../services/wholesalerService';
import { getAllRetailers } from '../services/retailerService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const CUSTOMER_TYPES = ['Wholesaler', 'Retailer', 'Walk-in', 'Other'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Mixed'];

const DENOMINATION_FIELDS = [
  { key: 'note2000', label: '₹2000', value: 2000 },
  { key: 'note500', label: '₹500', value: 500 },
  { key: 'note200', label: '₹200', value: 200 },
  { key: 'note100', label: '₹100', value: 100 },
  { key: 'note50', label: '₹50', value: 50 },
  { key: 'note20', label: '₹20', value: 20 },
  { key: 'note10', label: '₹10', value: 10 },
  { key: 'coin10', label: '₹10', value: 10 },
  { key: 'coin5', label: '₹5', value: 5 },
  { key: 'coin2', label: '₹2', value: 2 },
  { key: 'coin1', label: '₹1', value: 1 }
];

export default function CounterSales() {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    customerType: 'Walk-in',
    customerName: '',
    customerPhone: '',
    wholesalerId: '',
    retailerId: '',
    items: [{ productId: '', quantity: 1, ratePerUnit: 0 }],
    discount: 0,
    paymentMode: 'Cash',
    cashReceived: {
      note2000: 0,
      note500: 0,
      note200: 0,
      note100: 0,
      note50: 0,
      note20: 0,
      note10: 0,
      coin10: 0,
      coin5: 0,
      coin2: 0,
      coin1: 0
    },
    digitalPayment: {
      amount: 0,
      transactionId: '',
      mode: 'UPI'
    }
  });

  useEffect(() => {
    fetchSales();
    fetchDailySummary();
    fetchProducts();
    fetchCustomers();
  }, [selectedDate]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await getAllCounterSales({
        startDate: selectedDate,
        endDate: selectedDate
      });
      console.log('Sales data:', data);
      setSales(data.sales || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      alert('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const summary = await getDailySummary(selectedDate);
      console.log('Daily summary:', summary);
      setDailySummary(summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAvailableProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const [wholesalersData, retailersData] = await Promise.all([
        getAllWholesalers(),
        getAllRetailers()
      ]);
      setWholesalers(wholesalersData || []);
      setRetailers(retailersData || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const calculateCashTotal = () => {
    return DENOMINATION_FIELDS.reduce((total, field) => {
      return total + (formData.cashReceived[field.key] * field.value);
    }, 0);
  };

  const calculateItemsTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.ratePerUnit);
    }, 0);
  };

  const calculateFinalAmount = () => {
    return calculateItemsTotal() - formData.discount;
  };

  const calculateTotalReceived = () => {
    return calculateCashTotal() + (formData.paymentMode === 'Mixed' ? formData.digitalPayment.amount : 0);
  };

  const calculateChange = () => {
    const totalReceived = formData.paymentMode === 'Cash' || formData.paymentMode === 'Mixed' 
      ? calculateTotalReceived() 
      : 0;
    return Math.max(0, totalReceived - calculateFinalAmount());
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, ratePerUnit: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-fill rate when product is selected
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index].ratePerUnit = product.pricePerUnit || 0;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleDenominationChange = (key, value) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      cashReceived: {
        ...prev.cashReceived,
        [key]: numValue
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate items
    if (formData.items.some(item => !item.productId || item.quantity <= 0)) {
      alert('Please fill all item details');
      return;
    }

    // Validate payment
    if (formData.paymentMode === 'Cash' || formData.paymentMode === 'Mixed') {
      const totalReceived = calculateTotalReceived();
      const finalAmount = calculateFinalAmount();
      
      if (totalReceived < finalAmount) {
        alert(`Insufficient payment received. Need ₹${finalAmount}, got ₹${totalReceived}`);
        return;
      }
    }

    try {
      setLoading(true);
      await createCounterSale(formData);
      alert('Counter sale created successfully');
      setShowModal(false);
      resetForm();
      fetchSales();
      fetchDailySummary();
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale?')) return;

    try {
      await deleteCounterSale(id);
      alert('Sale deleted');
      fetchSales();
      fetchDailySummary();
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Failed to delete sale');
    }
  };

  const resetForm = () => {
    setFormData({
      customerType: 'Walk-in',
      customerName: '',
      customerPhone: '',
      wholesalerId: '',
      retailerId: '',
      items: [{ productId: '', quantity: 1, ratePerUnit: 0 }],
      discount: 0,
      paymentMode: 'Cash',
      cashReceived: {
        note2000: 0,
        note500: 0,
        note200: 0,
        note100: 0,
        note50: 0,
        note20: 0,
        note10: 0,
        coin10: 0,
        coin5: 0,
        coin2: 0,
        coin1: 0
      },
      digitalPayment: {
        amount: 0,
        transactionId: '',
        mode: 'UPI'
      }
    });
  };

  if (loading && !sales.length) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Counter Sales</h1>
          <p className="text-gray-600">On-the-spot sales to wholesalers and walk-in customers</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          New Sale
        </Button>
      </div>

      {/* Daily Summary Cards */}
      {dailySummary?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-sm text-gray-600">Total Sales</div>
            <div className="text-2xl font-bold text-gray-900">{dailySummary.summary.totalSales}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-blue-600">₹{dailySummary.summary.totalAmount?.toFixed(2)}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Cash Collected</div>
            <div className="text-2xl font-bold text-green-600">
              ₹{dailySummary.summary.byPaymentMode?.Cash?.amount?.toFixed(2) || 0}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Digital Payment</div>
            <div className="text-2xl font-bold text-purple-600">
              ₹{((dailySummary.summary.byPaymentMode?.UPI?.amount || 0) + 
                 (dailySummary.summary.byPaymentMode?.Card?.amount || 0)).toFixed(2)}
            </div>
          </Card>
        </div>
      )}

      {/* Date Filter */}
      <Card>
        <Input
          type="date"
          label="Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </Card>

      {/* Sales Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No sales found for selected date
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {sale.saleNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{sale.customerName || 'Walk-in'}</div>
                      <div className="text-gray-500 text-xs">{sale.customerType}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sale.items?.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      ₹{sale.finalAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {sale.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(sale._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Sale Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="New Counter Sale"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Customer Details */}
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-3">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Customer Type"
                required
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                options={CUSTOMER_TYPES.map(type => ({ value: type, label: type }))}
              />

              {formData.customerType === 'Wholesaler' && (
                <Select
                  label="Select Wholesaler"
                  value={formData.wholesalerId}
                  onChange={(e) => setFormData({ ...formData, wholesalerId: e.target.value })}
                  options={[
                    { value: '', label: 'Select...' },
                    ...wholesalers.map(w => ({ value: w._id, label: w.name }))
                  ]}
                />
              )}

              {formData.customerType === 'Retailer' && (
                <Select
                  label="Select Retailer"
                  value={formData.retailerId}
                  onChange={(e) => setFormData({ ...formData, retailerId: e.target.value })}
                  options={[
                    { value: '', label: 'Select...' },
                    ...retailers.map(r => ({ value: r._id, label: r.name }))
                  ]}
                />
              )}
            </div>

            {(formData.customerType === 'Walk-in' || formData.customerType === 'Other') && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Input
                  label="Customer Name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                + Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-3 mb-3">
                <div className="col-span-2">
                  <Select
                    label="Product"
                    required
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    options={[
                      { value: '', label: 'Select product...' },
                      ...products.map(p => ({ 
                        value: p._id, 
                        label: `${p.name} - ${p.size}` 
                      }))
                    ]}
                  />
                </div>
                <Input
                  type="number"
                  label="Quantity"
                  required
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                />
                <div className="flex items-end gap-2">
                  <Input
                    type="number"
                    label="Rate (₹)"
                    required
                    step="0.01"
                    value={item.ratePerUnit}
                    onChange={(e) => handleItemChange(index, 'ratePerUnit', parseFloat(e.target.value) || 0)}
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <span className="font-medium">Subtotal:</span>
              <span className="text-lg font-bold">₹{calculateItemsTotal().toFixed(2)}</span>
            </div>

            <Input
              type="number"
              label="Discount (₹)"
              step="0.01"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
            />

            <div className="flex justify-between items-center text-lg font-bold text-blue-600">
              <span>Final Amount:</span>
              <span>₹{calculateFinalAmount().toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-semibold mb-3">Payment Details</h3>
            <Select
              label="Payment Mode"
              required
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              options={PAYMENT_MODES.map(mode => ({ value: mode, label: mode }))}
            />

            {(formData.paymentMode === 'Cash' || formData.paymentMode === 'Mixed') && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Cash Received</h4>
                <div className="grid grid-cols-3 gap-2">
                  {DENOMINATION_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="text-xs text-gray-600">{field.label}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.cashReceived[field.key]}
                        onChange={(e) => handleDenominationChange(field.key, e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right font-semibold">
                  Cash Total: ₹{calculateCashTotal()}
                </div>
              </div>
            )}

            {formData.paymentMode === 'Mixed' && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  label="Digital Amount (₹)"
                  step="0.01"
                  value={formData.digitalPayment.amount}
                  onChange={(e) => setFormData({
                    ...formData,
                    digitalPayment: { ...formData.digitalPayment, amount: parseFloat(e.target.value) || 0 }
                  })}
                />
                <Input
                  label="Transaction ID"
                  value={formData.digitalPayment.transactionId}
                  onChange={(e) => setFormData({
                    ...formData,
                    digitalPayment: { ...formData.digitalPayment, transactionId: e.target.value }
                  })}
                />
              </div>
            )}

            {(formData.paymentMode === 'UPI' || formData.paymentMode === 'Card') && (
              <Input
                label="Transaction ID"
                required
                value={formData.digitalPayment.transactionId}
                onChange={(e) => setFormData({
                  ...formData,
                  digitalPayment: { 
                    ...formData.digitalPayment, 
                    transactionId: e.target.value,
                    amount: calculateFinalAmount()
                  }
                })}
              />
            )}

            {(formData.paymentMode === 'Cash' || formData.paymentMode === 'Mixed') && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Change to Return:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{calculateChange().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Complete Sale'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
