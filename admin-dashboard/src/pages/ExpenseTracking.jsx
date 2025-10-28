/**
 * Expense Tracking Page
 * Daily expense entry with cash denominations
 */

import { useState, useEffect } from 'react';
import { 
  createExpense, 
  getAllExpenses, 
  getDailySummary,
  approveExpense,
  rejectExpense,
  deleteExpense 
} from '../services/expenseService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const EXPENSE_CATEGORIES = [
  'COIN',
  'TEA',
  'Loder Lunch',
  'Extra Loder',
  '10 LODER',
  'Office Supplies',
  'Transport',
  'Maintenance',
  'Utilities',
  'Salary Advance',
  'Petty Cash',
  'Other'
];

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card'];

const DENOMINATION_FIELDS = [
  { key: 'note2000', label: '₹2000 Notes', value: 2000 },
  { key: 'note500', label: '₹500 Notes', value: 500 },
  { key: 'note200', label: '₹200 Notes', value: 200 },
  { key: 'note100', label: '₹100 Notes', value: 100 },
  { key: 'note50', label: '₹50 Notes', value: 50 },
  { key: 'note20', label: '₹20 Notes', value: 20 },
  { key: 'note10', label: '₹10 Notes', value: 10 },
  { key: 'coin10', label: '₹10 Coins', value: 10 },
  { key: 'coin5', label: '₹5 Coins', value: 5 },
  { key: 'coin2', label: '₹2 Coins', value: 2 },
  { key: 'coin1', label: '₹1 Coins', value: 1 }
];

export default function ExpenseTracking() {
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const [formData, setFormData] = useState({
    category: 'COIN',
    amount: '',
    description: '',
    paymentMode: 'Cash',
    date: new Date().toISOString().split('T')[0],
    denominations: {
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
    }
  });

  useEffect(() => {
    fetchExpenses();
    fetchDailySummary();
  }, [selectedDate, filterStatus, filterCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const filters = {
        startDate: selectedDate,
        endDate: selectedDate
      };
      if (filterStatus !== 'All') filters.status = filterStatus;
      if (filterCategory !== 'All') filters.category = filterCategory;
      
      const data = await getAllExpenses(filters);
      console.log('Expenses data:', data);
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert('Failed to fetch expenses');
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

  const calculateDenominationTotal = () => {
    return DENOMINATION_FIELDS.reduce((total, field) => {
      return total + (formData.denominations[field.key] * field.value);
    }, 0);
  };

  const handleDenominationChange = (key, value) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      denominations: {
        ...prev.denominations,
        [key]: numValue
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.paymentMode === 'Cash') {
      const denominationTotal = calculateDenominationTotal();
      const enteredAmount = parseFloat(formData.amount);
      
      if (denominationTotal !== enteredAmount) {
        alert(`Denomination total (₹${denominationTotal}) doesn't match amount (₹${enteredAmount})`);
        return;
      }
    }
    
    try {
      setLoading(true);
      await createExpense(formData);
      alert('Expense created successfully');
      setShowModal(false);
      resetForm();
      fetchExpenses();
      fetchDailySummary();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this expense?')) return;
    
    try {
      await approveExpense(id);
      alert('Expense approved');
      fetchExpenses();
      fetchDailySummary();
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Failed to approve expense');
    }
  };

  const handleReject = async (id) => {
    const remarks = prompt('Enter rejection reason:');
    if (!remarks) return;
    
    try {
      await rejectExpense(id, remarks);
      alert('Expense rejected');
      fetchExpenses();
      fetchDailySummary();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      alert('Failed to reject expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    
    try {
      await deleteExpense(id);
      alert('Expense deleted');
      fetchExpenses();
      fetchDailySummary();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'COIN',
      amount: '',
      description: '',
      paymentMode: 'Cash',
      date: new Date().toISOString().split('T')[0],
      denominations: {
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
      }
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  if (loading && !expenses.length) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Tracking</h1>
          <p className="text-gray-600">Monitor daily expenses with denomination breakdown</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          Add Expense
        </Button>
      </div>

      {/* Daily Summary Cards */}
      {dailySummary?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-2xl font-bold text-gray-900">{dailySummary.summary.totalExpenses}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-blue-600">₹{dailySummary.summary.totalAmount?.toFixed(2)}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{dailySummary.summary.byStatus?.Pending || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-2xl font-bold text-green-600">{dailySummary.summary.byStatus?.Approved || 0}</div>
          </Card>
        </div>
      )}

      {/* Category Breakdown */}
      {dailySummary?.summary?.byCategory && Object.keys(dailySummary.summary.byCategory).length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(dailySummary.summary.byCategory).map(([category, data]) => (
              <div key={category} className="border-l-4 border-blue-500 pl-3">
                <div className="text-sm text-gray-600">{category}</div>
                <div className="font-semibold">₹{data.amount?.toFixed(2)}</div>
                <div className="text-xs text-gray-500">{data.count} entries</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' }
            ]}
          />
          <Select
            label="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { value: 'All', label: 'All Categories' },
              ...EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
            ]}
          />
        </div>
      </Card>

      {/* Expenses Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No expenses found for selected date
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {expense.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{expense.amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {expense.paymentMode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {expense.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(expense._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(expense._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="text-gray-600 hover:text-gray-900"
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

      {/* Add Expense Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Add New Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
            />
            <Input
              type="date"
              label="Date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <Input
            type="number"
            label="Amount (₹)"
            required
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Select
            label="Payment Mode"
            required
            value={formData.paymentMode}
            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
            options={PAYMENT_MODES.map(mode => ({ value: mode, label: mode }))}
          />

          {formData.paymentMode === 'Cash' && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Cash Denomination Breakdown</h4>
                <div className="text-lg font-bold text-blue-600">
                  Total: ₹{calculateDenominationTotal()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DENOMINATION_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.denominations[field.key]}
                      onChange={(e) => handleDenominationChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Expense'}
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
