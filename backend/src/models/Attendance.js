/**
 * Attendance Model
 * Tracks daily attendance for drivers/employees
 */

import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  // Employee reference (Driver model includes Admin/Supervisor/Driver)
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  
  // Attendance date
  date: {
    type: Date,
    required: true
  },
  
  // Status: Present, Absent, Half-Day, Leave
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half-Day', 'Leave', 'Holiday'],
    required: true,
    default: 'Present'
  },
  
  // Check-in time (optional)
  checkInTime: {
    type: Date
  },
  
  // Check-out time (optional)
  checkOutTime: {
    type: Date
  },
  
  // Working hours calculated
  workingHours: {
    type: Number,
    default: 0
  },
  
  // Leave type if status is Leave
  leaveType: {
    type: String,
    enum: ['Sick', 'Casual', 'Paid', 'Unpaid'],
    required: function() {
      return this.status === 'Leave';
    }
  },
  
  // Remarks/Notes
  remarks: {
    type: String,
    trim: true
  },
  
  // Marked by (Admin/Supervisor)
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  
  // Auto-marked or manually marked
  isAutoMarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate entries for same employee on same date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Index for date range queries
attendanceSchema.index({ date: 1 });

// Static method to mark attendance
attendanceSchema.statics.markAttendance = async function(employeeId, date, status, markedBy, remarks = '') {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const attendance = await this.findOneAndUpdate(
    { employeeId, date: { $gte: startOfDay, $lte: endOfDay } },
    {
      status,
      markedBy,
      remarks,
      date: startOfDay
    },
    { upsert: true, new: true }
  ).populate('employeeId', 'name phone role');
  
  return attendance;
};

// Static method to get attendance summary for employee
attendanceSchema.statics.getEmployeeSummary = async function(employeeId, startDate, endDate) {
  const attendance = await this.find({
    employeeId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  }).sort({ date: 1 });
  
  const summary = {
    totalDays: attendance.length,
    present: 0,
    absent: 0,
    halfDay: 0,
    leave: 0,
    holiday: 0,
    workingDays: 0
  };
  
  attendance.forEach(record => {
    summary[record.status.toLowerCase().replace('-', '')]++;
    if (record.status === 'Present') {
      summary.workingDays++;
    } else if (record.status === 'Half-Day') {
      summary.workingDays += 0.5;
    }
  });
  
  return { attendance, summary };
};

// Static method to get monthly attendance report
attendanceSchema.statics.getMonthlyReport = async function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  const attendance = await this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$employeeId',
        present: {
          $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
        },
        halfDay: {
          $sum: { $cond: [{ $eq: ['$status', 'Half-Day'] }, 1, 0] }
        },
        leave: {
          $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] }
        },
        holiday: {
          $sum: { $cond: [{ $eq: ['$status', 'Holiday'] }, 1, 0] }
        },
        totalWorkingDays: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'Present'] }, 1,
              { $cond: [{ $eq: ['$status', 'Half-Day'] }, 0.5, 0] }
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    }
  ]);
  
  return attendance;
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
