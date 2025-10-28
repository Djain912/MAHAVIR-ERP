/**
 * Comprehensive Salary Management Page
 * Manages salary slips, advances, leaves, and payments
 */

import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaCalendarAlt, FaMoneyBillWave, FaUserClock, FaFileInvoice, FaPlus, FaCheck, FaTimes, FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import * as salaryService from '../services/salaryService';
import { getAllDrivers } from '../services/driverService';

const SalaryManagement = () => {
  const [activeTab, setActiveTab] = useState('slips'); // slips, advances, leaves, summary
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // Data
  const [employees, setEmployees] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState(null);
  
  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [slipForm, setSlipForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    commission: 0
  });
  
  const [advanceForm, setAdvanceForm] = useState({
    employeeId: '',
    amount: '',
    reason: '',
    paymentMethod: 'Cash',
    installments: 1,
    paymentDetails: {}
  });
  
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    leaveType: 'Sick Leave',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  
  const [paymentForm, setPaymentForm] = useState({
    paymentMode: 'Cash',
    paymentReference: '',
    paidAmount: 0
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (activeTab === 'slips') {
      loadSalarySlips();
      loadMonthlyReport();
    } else if (activeTab === 'advances') {
      loadAdvances();
    } else if (activeTab === 'leaves') {
      loadLeaves();
    } else if (activeTab === 'summary' && selectedEmployee) {
      loadEmployeeSummary();
    }
  }, [activeTab, selectedMonth, selectedYear, selectedEmployee]);

  const loadEmployees = async () => {
    try {
      const data = await getAllDrivers();
      const employeeList = Array.isArray(data) ? data : [];
      setEmployees(employeeList);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    }
  };

  const loadSalarySlips = async () => {
    try {
      setLoading(true);
      const filters = {
        month: selectedMonth,
        year: selectedYear
      };
      if (selectedEmployee) filters.employeeId = selectedEmployee;
      
      const data = await salaryService.getAllSalarySlips(filters);
      setSalarySlips(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading salary slips:', error);
      setSalarySlips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      const data = await salaryService.getMonthlySalaryReport(selectedMonth, selectedYear);
      setMonthlyReport(data);
    } catch (error) {
      console.error('Error loading monthly report:', error);
    }
  };

  const loadAdvances = async () => {
    try {
      setLoading(true);
      const filters = {
        month: selectedMonth,
        year: selectedYear
      };
      if (selectedEmployee) filters.employeeId = selectedEmployee;
      
      const data = await salaryService.getAllAdvances(filters);
      setAdvances(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading advances:', error);
      setAdvances([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const filters = {
        month: selectedMonth,
        year: selectedYear
      };
      if (selectedEmployee) filters.employeeId = selectedEmployee;
      
      const data = await salaryService.getAllLeaves(filters);
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading leaves:', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeSummary = async () => {
    try {
      setLoading(true);
      const data = await salaryService.getEmployeeSalarySummary(selectedEmployee, selectedYear);
      setEmployeeSummary(data);
    } catch (error) {
      console.error('Error loading employee summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSalarySlip = async () => {
    try {
      setLoading(true);
      await salaryService.generateSalarySlip(slipForm);
      alert('Salary slip generated successfully!');
      setShowGenerateModal(false);
      loadSalarySlips();
      loadMonthlyReport();
      setSlipForm({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        commission: 0
      });
    } catch (error) {
      console.error('Error generating salary slip:', error);
      alert(error.response?.data?.message || 'Failed to generate salary slip');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAllSlips = async () => {
    if (!confirm(`Generate salary slips for all employees for ${getMonthName(selectedMonth)} ${selectedYear}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await salaryService.generateAllSalarySlips(selectedMonth, selectedYear);
      alert(`Generated ${result.generated?.length || 0} salary slips successfully!`);
      loadSalarySlips();
      loadMonthlyReport();
    } catch (error) {
      console.error('Error generating all slips:', error);
      alert('Failed to generate salary slips');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdvance = async () => {
    try {
      setLoading(true);
      await salaryService.createAdvance(advanceForm);
      alert('Advance request created successfully!');
      setShowAdvanceModal(false);
      loadAdvances();
      setAdvanceForm({
        employeeId: '',
        amount: '',
        reason: '',
        paymentMethod: 'Cash',
        installments: 1,
        paymentDetails: {}
      });
    } catch (error) {
      console.error('Error creating advance:', error);
      alert('Failed to create advance request');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdvance = async (id) => {
    try {
      await salaryService.approveAdvance(id);
      alert('Advance approved successfully!');
      loadAdvances();
    } catch (error) {
      console.error('Error approving advance:', error);
      alert('Failed to approve advance');
    }
  };

  const handleRejectAdvance = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await salaryService.rejectAdvance(id, reason);
      alert('Advance rejected successfully!');
      loadAdvances();
    } catch (error) {
      console.error('Error rejecting advance:', error);
      alert('Failed to reject advance');
    }
  };

  const handleCreateLeave = async () => {
    try {
      setLoading(true);
      await salaryService.createLeave(leaveForm);
      alert('Leave application created successfully!');
      setShowLeaveModal(false);
      loadLeaves();
      setLeaveForm({
        employeeId: '',
        leaveType: 'Sick Leave',
        fromDate: '',
        toDate: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error creating leave:', error);
      alert('Failed to create leave application');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (id) => {
    try {
      await salaryService.approveLeave(id);
      alert('Leave approved successfully!');
      loadLeaves();
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave');
    }
  };

  const handleRejectLeave = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await salaryService.rejectLeave(id, reason);
      alert('Leave rejected successfully!');
      loadLeaves();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave');
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      setLoading(true);
      await salaryService.markSalaryAsPaid(selectedItem._id, paymentForm);
      alert('Salary marked as paid successfully!');
      setShowPaymentModal(false);
      setSelectedItem(null);
      loadSalarySlips();
      loadMonthlyReport();
      setPaymentForm({
        paymentMode: 'Cash',
        paymentReference: '',
        paidAmount: 0
      });
    } catch (error) {
      console.error('Error marking salary as paid:', error);
      alert('Failed to mark salary as paid');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Paid': 'bg-blue-100 text-blue-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Recovering': 'bg-purple-100 text-purple-800',
      'Recovered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <option key={m} value={m}>{getMonthName(m)}</option>
          ))}
        </Select>
        
        <Select
          label="Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>
        
        <Select
          label="Employee"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">All Employees</option>
          {employees.map(emp => (
            <option key={emp._id} value={emp._id}>{emp.name} ({emp.role})</option>
          ))}
        </Select>
        
        <div className="flex items-end">
          <Button
            onClick={() => {
              if (activeTab === 'slips') loadSalarySlips();
              else if (activeTab === 'advances') loadAdvances();
              else if (activeTab === 'leaves') loadLeaves();
            }}
            className="w-full"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSummaryCards = () => {
    if (!monthlyReport || !monthlyReport.summary) return null;
    
    const { summary } = monthlyReport;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Employees</p>
              <p className="text-2xl font-bold">{summary.totalEmployees}</p>
            </div>
            <FaUserClock className="text-3xl text-blue-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Gross Salary</p>
              <p className="text-2xl font-bold">₹{summary.totalGrossSalary?.toLocaleString()}</p>
            </div>
            <FaRupeeSign className="text-3xl text-green-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Deductions</p>
              <p className="text-2xl font-bold">₹{summary.totalDeductions?.toLocaleString()}</p>
            </div>
            <FaMoneyBillWave className="text-3xl text-red-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Net Salary</p>
              <p className="text-2xl font-bold">₹{summary.totalNetSalary?.toLocaleString()}</p>
            </div>
            <FaFileInvoice className="text-3xl text-purple-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-orange-600">₹{summary.totalPending?.toLocaleString()}</p>
            </div>
            <FaCalendarAlt className="text-3xl text-orange-500" />
          </div>
        </Card>
      </div>
    );
  };

  const renderSalarySlipsTab = () => (
    <div>
      {renderSummaryCards()}
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Salary Slips - {getMonthName(selectedMonth)} {selectedYear}</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowGenerateModal(true)} icon={FaPlus}>
              Generate Single
            </Button>
            <Button onClick={handleGenerateAllSlips} variant="success">
              Generate All
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salarySlips.map((slip) => (
                <tr key={slip._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{slip.employeeId?.name}</div>
                      <div className="text-sm text-gray-500">{slip.employeeId?.role}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">₹{slip.basicSalary?.toLocaleString()}</td>
                  <td className="px-6 py-4">₹{slip.grossSalary?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-600">₹{slip.totalDeductions?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold">₹{slip.netSalary?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(slip.status)}`}>
                      {slip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(slip);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {slip.status !== 'Paid' && (
                        <button
                          onClick={() => {
                            setSelectedItem(slip);
                            setPaymentForm({
                              paymentMode: 'Cash',
                              paymentReference: '',
                              paidAmount: slip.netSalary - (slip.paidAmount || 0)
                            });
                            setShowPaymentModal(true);
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Paid"
                        >
                          <FaMoneyBillWave />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {salarySlips.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No salary slips found for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdvancesTab = () => (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Salary Advances</h2>
          <Button onClick={() => setShowAdvanceModal(true)} icon={FaPlus}>
            New Advance
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recovered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Installments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {advances.map((advance) => (
                <tr key={advance._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{advance.employeeId?.name}</div>
                      <div className="text-sm text-gray-500">{new Date(advance.advanceDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">₹{advance.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-600">₹{advance.recovery?.totalRecovered?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-orange-600">₹{advance.recovery?.remainingAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4">{advance.recoveryPlan?.installments}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(advance.status)}`}>
                      {advance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {advance.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveAdvance(advance._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleRejectAdvance(advance._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedItem(advance);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {advances.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No advances found
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLeavesTab = () => (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Leave Applications</h2>
          <Button onClick={() => setShowLeaveModal(true)} icon={FaPlus}>
            Apply Leave
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{leave.employeeId?.name}</div>
                      <div className="text-sm text-gray-500">{new Date(leave.appliedDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{leave.leaveType}</td>
                  <td className="px-6 py-4">{new Date(leave.fromDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(leave.toDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{leave.numberOfDays}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {leave.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveLeave(leave._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleRejectLeave(leave._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {leaves.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No leave applications found
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmployeeSummaryTab = () => {
    if (!selectedEmployee) {
      return (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">Please select an employee to view summary</p>
        </div>
      );
    }

    if (!employeeSummary) return <div>Loading...</div>;

    return (
      <div>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">{employeeSummary.employee?.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600">Role</p>
              <p className="font-semibold">{employeeSummary.employee?.role}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-semibold">{employeeSummary.employee?.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Basic Salary</p>
              <p className="font-semibold">₹{employeeSummary.employee?.basicSalary?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-gray-600 text-sm">Total Gross</p>
            <p className="text-2xl font-bold text-green-600">₹{employeeSummary.totalGrossSalary?.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Total Deductions</p>
            <p className="text-2xl font-bold text-red-600">₹{employeeSummary.totalDeductions?.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Total Net</p>
            <p className="text-2xl font-bold text-blue-600">₹{employeeSummary.totalNetSalary?.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-gray-600 text-sm">Pending Advance</p>
            <p className="text-2xl font-bold text-orange-600">₹{employeeSummary.pendingAdvanceAmount?.toLocaleString()}</p>
          </Card>
        </div>

        {/* Leave Balance */}
        {employeeSummary.leaveBalance && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Leave Balance - {selectedYear}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border p-4 rounded">
                <p className="text-gray-600 text-sm">Sick Leave</p>
                <p className="text-lg font-bold">{employeeSummary.leaveBalance.sickLeave?.remaining || 0} / {employeeSummary.leaveBalance.sickLeave?.total || 12}</p>
              </div>
              <div className="border p-4 rounded">
                <p className="text-gray-600 text-sm">Casual Leave</p>
                <p className="text-lg font-bold">{employeeSummary.leaveBalance.casualLeave?.remaining || 0} / {employeeSummary.leaveBalance.casualLeave?.total || 12}</p>
              </div>
              <div className="border p-4 rounded">
                <p className="text-gray-600 text-sm">Paid Leave</p>
                <p className="text-lg font-bold">{employeeSummary.leaveBalance.paidLeave?.remaining || 0} / {employeeSummary.leaveBalance.paidLeave?.total || 15}</p>
              </div>
              <div className="border p-4 rounded">
                <p className="text-gray-600 text-sm">Unpaid Leave</p>
                <p className="text-lg font-bold">{employeeSummary.leaveBalance.unpaidLeave?.used || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Salary Management</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('slips')}
          className={`pb-2 px-4 ${activeTab === 'slips' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Salary Slips
        </button>
        <button
          onClick={() => setActiveTab('advances')}
          className={`pb-2 px-4 ${activeTab === 'advances' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Advances
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-2 px-4 ${activeTab === 'leaves' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Leaves
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-2 px-4 ${activeTab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Employee Summary
        </button>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Tab Content */}
      {loading && <div className="text-center py-8">Loading...</div>}
      {!loading && activeTab === 'slips' && renderSalarySlipsTab()}
      {!loading && activeTab === 'advances' && renderAdvancesTab()}
      {!loading && activeTab === 'leaves' && renderLeavesTab()}
      {!loading && activeTab === 'summary' && renderEmployeeSummaryTab()}

      {/* Generate Salary Slip Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Salary Slip"
      >
        <div className="space-y-4">
          <Select
            label="Employee *"
            value={slipForm.employeeId}
            onChange={(e) => setSlipForm({...slipForm, employeeId: e.target.value})}
            required
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name} - {emp.role}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Month *"
              value={slipForm.month}
              onChange={(e) => setSlipForm({...slipForm, month: parseInt(e.target.value)})}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </Select>

            <Select
              label="Year *"
              value={slipForm.year}
              onChange={(e) => setSlipForm({...slipForm, year: parseInt(e.target.value)})}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Commission (Optional)"
            type="number"
            value={slipForm.commission}
            onChange={(e) => setSlipForm({...slipForm, commission: parseFloat(e.target.value) || 0})}
            placeholder="0"
          />

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateSalarySlip} disabled={!slipForm.employeeId}>
              Generate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Advance Modal */}
      <Modal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        title="Create Salary Advance"
      >
        <div className="space-y-4">
          <Select
            label="Employee *"
            value={advanceForm.employeeId}
            onChange={(e) => setAdvanceForm({...advanceForm, employeeId: e.target.value})}
            required
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name} - {emp.role}</option>
            ))}
          </Select>

          <Input
            label="Amount *"
            type="number"
            value={advanceForm.amount}
            onChange={(e) => setAdvanceForm({...advanceForm, amount: e.target.value})}
            placeholder="Enter amount"
            required
          />

          <Input
            label="Reason *"
            value={advanceForm.reason}
            onChange={(e) => setAdvanceForm({...advanceForm, reason: e.target.value})}
            placeholder="Enter reason for advance"
            required
          />

          <Select
            label="Payment Method *"
            value={advanceForm.paymentMethod}
            onChange={(e) => setAdvanceForm({...advanceForm, paymentMethod: e.target.value})}
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="UPI">UPI</option>
          </Select>

          <Input
            label="Recovery Installments"
            type="number"
            value={advanceForm.installments}
            onChange={(e) => setAdvanceForm({...advanceForm, installments: parseInt(e.target.value) || 1})}
            min="1"
            max="12"
          />

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAdvanceModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdvance} disabled={!advanceForm.employeeId || !advanceForm.amount || !advanceForm.reason}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Leave Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Apply Leave"
      >
        <div className="space-y-4">
          <Select
            label="Employee *"
            value={leaveForm.employeeId}
            onChange={(e) => setLeaveForm({...leaveForm, employeeId: e.target.value})}
            required
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name} - {emp.role}</option>
            ))}
          </Select>

          <Select
            label="Leave Type *"
            value={leaveForm.leaveType}
            onChange={(e) => setLeaveForm({...leaveForm, leaveType: e.target.value})}
          >
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Paid Leave">Paid Leave</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
            <option value="Half Day">Half Day</option>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Date *"
              type="date"
              value={leaveForm.fromDate}
              onChange={(e) => setLeaveForm({...leaveForm, fromDate: e.target.value})}
              required
            />

            <Input
              label="To Date *"
              type="date"
              value={leaveForm.toDate}
              onChange={(e) => setLeaveForm({...leaveForm, toDate: e.target.value})}
              required
            />
          </div>

          <Input
            label="Reason *"
            value={leaveForm.reason}
            onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
            placeholder="Enter reason for leave"
            required
          />

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLeave} disabled={!leaveForm.employeeId || !leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Mark Salary as Paid"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Employee</p>
              <p className="font-semibold">{selectedItem.employeeId?.name}</p>
              <p className="text-sm text-gray-600 mt-2">Net Salary</p>
              <p className="text-xl font-bold">₹{selectedItem.netSalary?.toLocaleString()}</p>
              {selectedItem.paidAmount > 0 && (
                <>
                  <p className="text-sm text-gray-600 mt-2">Already Paid</p>
                  <p className="text-green-600">₹{selectedItem.paidAmount?.toLocaleString()}</p>
                </>
              )}
            </div>

            <Select
              label="Payment Method *"
              value={paymentForm.paymentMode}
              onChange={(e) => setPaymentForm({...paymentForm, paymentMode: e.target.value})}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="UPI">UPI</option>
            </Select>

            <Input
              label="Payment Reference"
              value={paymentForm.paymentReference}
              onChange={(e) => setPaymentForm({...paymentForm, paymentReference: e.target.value})}
              placeholder="Transaction ID / Cheque No."
            />

            <Input
              label="Amount to Pay *"
              type="number"
              value={paymentForm.paidAmount}
              onChange={(e) => setPaymentForm({...paymentForm, paidAmount: parseFloat(e.target.value) || 0})}
              required
            />

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkAsPaid} disabled={paymentForm.paidAmount <= 0}>
                Mark as Paid
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Details"
      >
        {selectedItem && (
          <div className="space-y-4">
            <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(selectedItem, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalaryManagement;
