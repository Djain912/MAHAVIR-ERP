/**
 * Attendance Controller
 * Handles attendance marking and reports
 */

import Attendance from '../models/Attendance.js';
import Driver from '../models/Driver.js';

/**
 * Mark daily attendance
 * POST /api/attendance/mark
 */
export const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, remarks } = req.body;
    const markedBy = req.user.id;
    
    // Validate employee exists
    const employee = await Driver.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const attendance = await Attendance.markAttendance(
      employeeId,
      date,
      status,
      markedBy,
      remarks
    );
    
    res.json(attendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Bulk mark attendance for multiple employees
 * POST /api/attendance/bulk-mark
 */
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { date, attendanceRecords } = req.body;
    // attendanceRecords = [{ employeeId, status, remarks }, ...]
    
    const markedBy = req.user.id;
    const results = [];
    
    for (const record of attendanceRecords) {
      try {
        const attendance = await Attendance.markAttendance(
          record.employeeId,
          date,
          record.status,
          markedBy,
          record.remarks || ''
        );
        results.push({ success: true, attendance });
      } catch (error) {
        results.push({ 
          success: false, 
          employeeId: record.employeeId, 
          error: error.message 
        });
      }
    }
    
    res.json({ results });
  } catch (error) {
    console.error('Error in bulk attendance marking:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get attendance for a specific date
 * GET /api/attendance/daily?date=2025-10-25
 */
export const getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('employeeId', 'name phone role salary')
      .populate('markedBy', 'name')
      .sort({ 'employeeId.name': 1 });
    
    // Get all active employees
    const allEmployees = await Driver.find({ active: true }).select('name phone role salary');
    
    // Find employees without attendance marked
    const markedEmployeeIds = attendance.map(a => a.employeeId._id.toString());
    const unmarkedEmployees = allEmployees.filter(
      emp => !markedEmployeeIds.includes(emp._id.toString())
    );
    
    res.json({
      date: startOfDay,
      marked: attendance,
      unmarked: unmarkedEmployees,
      summary: {
        total: allEmployees.length,
        marked: attendance.length,
        unmarked: unmarkedEmployees.length,
        present: attendance.filter(a => a.status === 'Present').length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        halfDay: attendance.filter(a => a.status === 'Half-Day').length,
        leave: attendance.filter(a => a.status === 'Leave').length,
        holiday: attendance.filter(a => a.status === 'Holiday').length
      }
    });
  } catch (error) {
    console.error('Error fetching daily attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get employee attendance summary
 * GET /api/attendance/employee/:employeeId?startDate=2025-10-01&endDate=2025-10-31
 */
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    
    const employee = await Driver.findById(employeeId).select('name phone role salary');
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const { attendance, summary } = await Attendance.getEmployeeSummary(
      employeeId,
      startDate,
      endDate
    );
    
    res.json({
      employee,
      attendance,
      summary,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get monthly attendance report
 * GET /api/attendance/monthly?month=10&year=2025
 */
export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const report = await Attendance.getMonthlyReport(
      parseInt(year),
      parseInt(month)
    );
    
    res.json({
      month: parseInt(month),
      year: parseInt(year),
      report
    });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update attendance
 * PUT /api/attendance/:id
 */
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { status, remarks },
      { new: true }
    ).populate('employeeId', 'name phone role');
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete attendance record
 * DELETE /api/attendance/:id
 */
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findByIdAndDelete(id);
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  markAttendance,
  bulkMarkAttendance,
  getDailyAttendance,
  getEmployeeAttendance,
  getMonthlyReport,
  updateAttendance,
  deleteAttendance
};
