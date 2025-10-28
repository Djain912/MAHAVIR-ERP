/**
 * Attendance Routes
 */

import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Mark attendance
router.post('/mark', attendanceController.markAttendance);

// Bulk mark attendance
router.post('/bulk-mark', attendanceController.bulkMarkAttendance);

// Get daily attendance
router.get('/daily', attendanceController.getDailyAttendance);

// Get employee attendance
router.get('/employee/:employeeId', attendanceController.getEmployeeAttendance);

// Get monthly report
router.get('/monthly', attendanceController.getMonthlyReport);

// Update attendance
router.put('/:id', attendanceController.updateAttendance);

// Delete attendance
router.delete('/:id', attendanceController.deleteAttendance);

export default router;
