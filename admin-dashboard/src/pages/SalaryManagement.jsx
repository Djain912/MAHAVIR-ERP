/**
 * Salary Management Page
 * Generate and manage salary slips
 */

import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import * as salarySlipService from '../services/salarySlipService';
import * as driverService from '../services/driverService';

const SalaryManagement = () => {
  const [loading, setLoading] = useState(true);
  const [salarySlips, setSalarySlips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: '',
    paymentStatus: ''
  });

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Generate form
  const [generateForm, setGenerateForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    commission: 0
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    paymentMode: 'Cash',
    paymentReference: '',
    paidAmount: 0
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadSalarySlips();
  }, [filters]);

  const loadEmployees = async () => {
    try {
      const data = await driverService.getAllDrivers();
      setEmployees(Array.isArray(data) ? data.filter(d => d.active) : []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadSalarySlips = async () => {
    try {
      setLoading(true);
      const data = await salarySlipService.getAllSalarySlips(filters);
      setSalarySlips(data.salarySlips || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Error loading salary slips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlip = async () => {
    try {
      await salarySlipService.generateSalarySlip(generateForm);
      alert('Salary slip generated successfully!');
      setShowGenerateModal(false);
      loadSalarySlips();
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to generate salary slip'));
    }
  };

  const handleBulkGenerate = async () => {
    try {
      if (!confirm(`Generate salary slips for all employees for ${getMonthName(filters.month)} ${filters.year}?`)) {
        return;
      }

      await salarySlipService.bulkGenerateSalarySlips({
        month: filters.month,
        year: filters.year,
        commissions: {} // Can be enhanced to take commission input
      });

      alert('Salary slips generated for all employees!');
      loadSalarySlips();
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to bulk generate'));
    }
  };

  const handleApproveSlip = async (slipId) => {
    try {
      await salarySlipService.approveSalarySlip(slipId);
      alert('Salary slip approved!');
      loadSalarySlips();
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to approve'));
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await salarySlipService.markAsPaid(selectedSlip._id, paymentForm);
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      loadSalarySlips();
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to record payment'));
    }
  };

  const handleViewSlip = (slip) => {
    setSelectedSlip(slip);
    setShowSlipModal(true);
  };

  const handlePaymentClick = (slip) => {
    setSelectedSlip(slip);
    setPaymentForm({
      paymentMode: 'Cash',
      paymentReference: '',
      paidAmount: slip.netSalary - (slip.paidAmount || 0)
    });
    setShowPaymentModal(true);
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Partially-Paid': return 'bg-orange-100 text-orange-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowGenerateModal(true)} variant="secondary">
            Generate Single
          </Button>
          <Button onClick={handleBulkGenerate}>
            Generate for All
          </Button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Slips</div>
              <div className="text-2xl font-bold">{summary.totalSlips}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Gross Salary</div>
              <div className="text-2xl font-bold text-green-600">₹{summary.totalGross.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Deductions</div>
              <div className="text-2xl font-bold text-red-600">₹{summary.totalDeductions.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Net Salary</div>
              <div className="text-2xl font-bold text-blue-600">₹{summary.totalNet.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-orange-600">₹{summary.totalPending.toLocaleString()}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Month"
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
            options={[
              { value: 1, label: 'January' },
              { value: 2, label: 'February' },
              { value: 3, label: 'March' },
              { value: 4, label: 'April' },
              { value: 5, label: 'May' },
              { value: 6, label: 'June' },
              { value: 7, label: 'July' },
              { value: 8, label: 'August' },
              { value: 9, label: 'September' },
              { value: 10, label: 'October' },
              { value: 11, label: 'November' },
              { value: 12, label: 'December' }
            ]}
          />
          <Input
            label="Year"
            type="number"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: '', label: 'All Status' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Paid', label: 'Paid' }
            ]}
          />
          <Select
            label="Payment Status"
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            options={[
              { value: '', label: 'All Payments' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Partially-Paid', label: 'Partially Paid' },
              { value: 'Paid', label: 'Paid' }
            ]}
          />
        </div>
      </Card>

      {/* Salary Slips Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salarySlips.map(slip => (
                <tr key={slip._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{slip.employeeId?.name}</div>
                    <div className="text-xs text-gray-600">{slip.employeeId?.role}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {getMonthName(slip.month)} {slip.year}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {slip.attendance.workingDays} / {slip.attendance.totalDays}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    ₹{slip.grossSalary.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-red-600">
                    ₹{slip.totalDeductions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-600">
                    ₹{slip.netSalary.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(slip.status)}`}>
                      {slip.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(slip.paymentStatus)}`}>
                      {slip.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewSlip(slip)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </button>
                      {slip.status === 'Draft' && (
                        <button
                          onClick={() => handleApproveSlip(slip._id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Approve
                        </button>
                      )}
                      {slip.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => handlePaymentClick(slip)}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate Modal */}
      {showGenerateModal && (
        <Modal onClose={() => setShowGenerateModal(false)} title="Generate Salary Slip">
          <div className="space-y-4">
            <Select
              label="Employee"
              value={generateForm.employeeId}
              onChange={(e) => setGenerateForm({ ...generateForm, employeeId: e.target.value })}
              options={[
                { value: '', label: 'Select Employee' },
                ...employees.map(emp => ({ value: emp._id, label: `${emp.name} (${emp.role})` }))
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Month"
                value={generateForm.month}
                onChange={(e) => setGenerateForm({ ...generateForm, month: parseInt(e.target.value) })}
                options={[
                  { value: 1, label: 'January' },
                  { value: 2, label: 'February' },
                  { value: 3, label: 'March' },
                  { value: 4, label: 'April' },
                  { value: 5, label: 'May' },
                  { value: 6, label: 'June' },
                  { value: 7, label: 'July' },
                  { value: 8, label: 'August' },
                  { value: 9, label: 'September' },
                  { value: 10, label: 'October' },
                  { value: 11, label: 'November' },
                  { value: 12, label: 'December' }
                ]}
              />
              <Input
                label="Year"
                type="number"
                value={generateForm.year}
                onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
              />
            </div>
            <Input
              label="Commission (₹)"
              type="number"
              value={generateForm.commission}
              onChange={(e) => setGenerateForm({ ...generateForm, commission: parseFloat(e.target.value) || 0 })}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowGenerateModal(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleGenerateSlip} disabled={!generateForm.employeeId}>
                Generate
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedSlip && (
        <Modal onClose={() => setShowPaymentModal(false)} title="Record Payment">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Employee</div>
              <div className="font-medium">{selectedSlip.employeeId?.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Net Salary</div>
              <div className="text-lg font-bold text-blue-600">₹{selectedSlip.netSalary.toLocaleString()}</div>
            </div>
            {selectedSlip.paidAmount > 0 && (
              <div>
                <div className="text-sm text-gray-600">Already Paid</div>
                <div className="font-medium text-green-600">₹{selectedSlip.paidAmount.toLocaleString()}</div>
              </div>
            )}
            <Select
              label="Payment Mode"
              value={paymentForm.paymentMode}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Cheque', label: 'Cheque' },
                { value: 'UPI', label: 'UPI' }
              ]}
            />
            <Input
              label="Payment Reference"
              value={paymentForm.paymentReference}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
              placeholder="Transaction ID / Cheque No."
            />
            <Input
              label="Amount (₹)"
              type="number"
              value={paymentForm.paidAmount}
              onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: parseFloat(e.target.value) || 0 })}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowPaymentModal(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleMarkAsPaid}>
                Record Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Slip Modal */}
      {showSlipModal && selectedSlip && (
        <Modal onClose={() => setShowSlipModal(false)} title="Salary Slip Details">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-bold text-lg mb-2">{selectedSlip.employeeId?.name}</h3>
              <div className="text-sm text-gray-600">{selectedSlip.employeeId?.role} | {selectedSlip.employeeId?.phone}</div>
              <div className="text-sm font-medium mt-1">{getMonthName(selectedSlip.month)} {selectedSlip.year}</div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Attendance</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-600">Total Days:</span> {selectedSlip.attendance.totalDays}</div>
                <div><span className="text-gray-600">Present:</span> {selectedSlip.attendance.presentDays}</div>
                <div><span className="text-gray-600">Absent:</span> {selectedSlip.attendance.absentDays}</div>
                <div><span className="text-gray-600">Half Days:</span> {selectedSlip.attendance.halfDays}</div>
                <div><span className="text-gray-600">Leave:</span> {selectedSlip.attendance.leaveDays}</div>
                <div><span className="text-gray-600">Working:</span> <strong>{selectedSlip.attendance.workingDays}</strong></div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Earnings</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Salary:</span>
                  <span>₹{selectedSlip.earnings.basicAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission:</span>
                  <span>₹{selectedSlip.earnings.commission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600 border-t pt-1">
                  <span>Gross Salary:</span>
                  <span>₹{selectedSlip.grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Deductions</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Absent Deduction:</span>
                  <span>₹{selectedSlip.deductions.absentDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-red-600 border-t pt-1">
                  <span>Total Deductions:</span>
                  <span>₹{selectedSlip.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Net Salary:</span>
                <span className="font-bold text-2xl text-blue-600">₹{selectedSlip.netSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SalaryManagement;
