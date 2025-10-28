/**
 * Daily Attendance Marking Page
 * Mark daily attendance for all employees
 */

import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Loading from '../components/Loading';
import * as attendanceService from '../services/attendanceService';
import * as driverService from '../services/driverService';

const AttendanceMarking = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [markedAttendance, setMarkedAttendance] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadDailyAttendance();
    }
  }, [selectedDate]);

  const loadEmployees = async () => {
    try {
      const data = await driverService.getAllDrivers();
      console.log('=== EMPLOYEES DEBUG ===');
      console.log('Raw response:', data);
      console.log('Is array?', Array.isArray(data));
      console.log('Count:', data?.length);
      console.log('=====================');
      
      const filteredEmployees = Array.isArray(data) ? data.filter(d => d.active) : [];
      console.log('Filtered active employees:', filteredEmployees.length);
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('Failed to load employees');
      setEmployees([]);
    }
  };

  const loadDailyAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getDailyAttendance(selectedDate);
      
      setMarkedAttendance(data.marked || []);
      setSummary(data.summary || null);
      
      // Initialize attendance data
      const initialData = {};
      employees.forEach(emp => {
        const existing = data.marked?.find(a => a.employeeId._id === emp._id);
        initialData[emp._id] = {
          status: existing?.status || 'Present',
          remarks: existing?.remarks || ''
        };
      });
      
      setAttendanceData(initialData);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (employeeId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], status }
    }));
  };

  const handleRemarksChange = (employeeId, remarks) => {
    setAttendanceData(prev => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], remarks }
    }));
  };

  const handleBulkMarkAll = (status) => {
    const updated = {};
    employees.forEach(emp => {
      updated[emp._id] = { status, remarks: '' };
    });
    setAttendanceData(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      
      const attendanceRecords = employees.map(emp => ({
        employeeId: emp._id,
        status: attendanceData[emp._id]?.status || 'Present',
        remarks: attendanceData[emp._id]?.remarks || ''
      }));

      await attendanceService.bulkMarkAttendance(selectedDate, attendanceRecords);
      
      alert('Attendance marked successfully!');
      loadDailyAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Half-Day': return 'bg-yellow-100 text-yellow-800';
      case 'Leave': return 'bg-blue-100 text-blue-800';
      case 'Holiday': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Daily Attendance</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Summary */}
      {summary && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Today's Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.present}</div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.halfDay}</div>
              <div className="text-sm text-gray-600">Half Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.leave}</div>
              <div className="text-sm text-gray-600">Leave</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.holiday}</div>
              <div className="text-sm text-gray-600">Holiday</div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => handleBulkMarkAll('Present')} size="sm" variant="secondary">
            Mark All Present
          </Button>
          <Button onClick={() => handleBulkMarkAll('Absent')} size="sm" variant="secondary">
            Mark All Absent
          </Button>
          <Button onClick={() => handleBulkMarkAll('Holiday')} size="sm" variant="secondary">
            Mark All Holiday
          </Button>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee, index) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{employee.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{employee.phone}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={attendanceData[employee._id]?.status || 'Present'}
                      onChange={(e) => handleStatusChange(employee._id, e.target.value)}
                      className={`px-3 py-1 text-sm rounded-full font-semibold ${getStatusColor(attendanceData[employee._id]?.status || 'Present')}`}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half-Day">Half Day</option>
                      <option value="Leave">Leave</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={attendanceData[employee._id]?.remarks || ''}
                      onChange={(e) => handleRemarksChange(employee._id, e.target.value)}
                      placeholder="Add remarks..."
                      className="px-2 py-1 text-sm border border-gray-300 rounded w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <Button
            onClick={handleSaveAttendance}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AttendanceMarking;
