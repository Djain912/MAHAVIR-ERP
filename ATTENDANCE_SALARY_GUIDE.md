# Attendance and Salary Management Module

## Overview
Complete attendance tracking and salary slip generation system with automatic salary calculations based on attendance, commission tracking, and detailed salary slips.

## Features

### 1. Daily Attendance Marking
- **Mark attendance** for all employees daily
- **Status options**: Present, Absent, Half-Day, Leave, Holiday
- **Bulk operations**: Mark all present/absent/holiday at once
- **Attendance summary**: Real-time statistics
- **Remarks**: Add notes for each employee's attendance
- **Historical tracking**: View and edit past attendance

### 2. Salary Slip Generation
- **Automatic calculation** based on attendance
- **Pro-rated salary**: Calculates based on working days
- **Commission tracking**: Add monthly commission per employee
- **Deduction handling**: Automatic absent deductions
- **Salary slip workflow**: Draft → Approved → Paid
- **Payment tracking**: Multiple payment modes supported

### 3. Key Calculations

#### Working Days Calculation
```
Working Days = Present Days + (Half Days × 0.5) + Paid Leave Days
```

#### Salary Calculation
```
Per Day Salary = Monthly Basic Salary ÷ Total Days in Month
Basic Amount = Per Day Salary × Working Days
Absent Deduction = Per Day Salary × Absent Days
```

#### Final Salary
```
Gross Salary = Basic Amount + Commission + Bonus + Allowances
Total Deductions = Absent Deduction + Advance + Loan + Other
Net Salary = Gross Salary - Total Deductions
```

## Database Models

### Attendance Model
```javascript
{
  employeeId: ObjectId (ref: Driver),
  date: Date,
  status: 'Present' | 'Absent' | 'Half-Day' | 'Leave' | 'Holiday',
  checkInTime: Date (optional),
  checkOutTime: Date (optional),
  workingHours: Number,
  leaveType: 'Sick' | 'Casual' | 'Paid' | 'Unpaid' (if Leave),
  remarks: String,
  markedBy: ObjectId (ref: Driver),
  isAutoMarked: Boolean
}
```

### Salary Slip Model
```javascript
{
  employeeId: ObjectId (ref: Driver),
  month: Number (1-12),
  year: Number,
  basicSalary: Number,
  
  attendance: {
    totalDays: Number,
    presentDays: Number,
    absentDays: Number,
    halfDays: Number,
    leaveDays: Number,
    paidLeaveDays: Number,
    workingDays: Number
  },
  
  earnings: {
    basicAmount: Number,
    commission: Number,
    bonus: Number,
    allowances: Number,
    overtime: Number
  },
  
  deductions: {
    absentDeduction: Number,
    advanceDeduction: Number,
    loanDeduction: Number,
    other: Number
  },
  
  grossSalary: Number,
  totalDeductions: Number,
  netSalary: Number,
  
  paymentStatus: 'Pending' | 'Paid' | 'Partially-Paid',
  paymentDate: Date,
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI',
  paymentReference: String,
  paidAmount: Number,
  
  status: 'Draft' | 'Approved' | 'Paid' | 'Cancelled',
  generatedBy: ObjectId (ref: Driver)
}
```

### Updated Driver Model
Added `salary` field:
```javascript
{
  name: String,
  phone: String,
  password: String,
  role: 'Admin' | 'Supervisor' | 'Driver',
  salary: Number (default: 12000),
  active: Boolean
}
```

## API Endpoints

### Attendance APIs

#### Mark Attendance
```http
POST /api/attendance/mark
Authorization: Bearer <token>

{
  "employeeId": "employee_id",
  "date": "2025-10-25",
  "status": "Present",
  "remarks": "Optional remarks"
}
```

#### Bulk Mark Attendance
```http
POST /api/attendance/bulk-mark
Authorization: Bearer <token>

{
  "date": "2025-10-25",
  "attendanceRecords": [
    { "employeeId": "emp1_id", "status": "Present", "remarks": "" },
    { "employeeId": "emp2_id", "status": "Absent", "remarks": "Sick" }
  ]
}
```

#### Get Daily Attendance
```http
GET /api/attendance/daily?date=2025-10-25
Authorization: Bearer <token>

Response:
{
  "date": "2025-10-25T00:00:00.000Z",
  "marked": [...attendance records...],
  "unmarked": [...employees without attendance...],
  "summary": {
    "total": 10,
    "marked": 8,
    "unmarked": 2,
    "present": 6,
    "absent": 1,
    "halfDay": 1,
    "leave": 0,
    "holiday": 0
  }
}
```

#### Get Employee Attendance
```http
GET /api/attendance/employee/:employeeId?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <token>

Response:
{
  "employee": {...employee details...},
  "attendance": [...attendance records...],
  "summary": {
    "totalDays": 20,
    "present": 18,
    "absent": 2,
    "halfDay": 0,
    "leave": 0,
    "workingDays": 18
  }
}
```

#### Get Monthly Report
```http
GET /api/attendance/monthly?month=10&year=2025
Authorization: Bearer <token>
```

### Salary Slip APIs

#### Generate Salary Slip
```http
POST /api/salary-slips/generate
Authorization: Bearer <token>

{
  "employeeId": "employee_id",
  "month": 10,
  "year": 2025,
  "commission": 5000
}
```

#### Bulk Generate Salary Slips
```http
POST /api/salary-slips/bulk-generate
Authorization: Bearer <token>

{
  "month": 10,
  "year": 2025,
  "commissions": {
    "emp1_id": 5000,
    "emp2_id": 3000
  }
}
```

#### Get All Salary Slips
```http
GET /api/salary-slips?month=10&year=2025&status=Draft&paymentStatus=Pending
Authorization: Bearer <token>

Response:
{
  "salarySlips": [...slips...],
  "summary": {
    "totalSlips": 10,
    "totalGross": 120000,
    "totalDeductions": 8000,
    "totalNet": 112000,
    "totalPaid": 50000,
    "totalPending": 62000
  }
}
```

#### Approve Salary Slip
```http
PUT /api/salary-slips/:id/approve
Authorization: Bearer <token>
```

#### Mark as Paid
```http
PUT /api/salary-slips/:id/pay
Authorization: Bearer <token>

{
  "paymentMode": "Cash",
  "paymentReference": "TXN123456",
  "paidAmount": 12000
}
```

## Usage Guide

### Step 1: Daily Attendance Marking

1. Navigate to **Attendance** page from sidebar
2. Select the date (defaults to today)
3. View summary of total employees and current status
4. **Options:**
   - Mark individually: Select status for each employee
   - Bulk operations: Use "Mark All Present/Absent/Holiday" buttons
   - Add remarks for specific employees
5. Click **Save Attendance** button

### Step 2: Generate Monthly Salary Slips

1. Navigate to **Salary Management** page
2. Select month and year using filters
3. **Generate Single Slip:**
   - Click "Generate Single"
   - Select employee
   - Enter commission amount (if any)
   - Click "Generate"
4. **Generate for All Employees:**
   - Click "Generate for All"
   - Confirm the action
   - All active employees get salary slips

### Step 3: Review and Approve

1. Generated slips are in **Draft** status
2. Click "View" to see detailed breakdown:
   - Attendance summary
   - Earnings breakdown
   - Deductions breakdown
   - Net salary
3. Click "Approve" to finalize the slip

### Step 4: Process Payment

1. Click "Pay" on approved slip
2. Enter payment details:
   - Payment mode (Cash/Bank Transfer/Cheque/UPI)
   - Payment reference (Transaction ID/Cheque number)
   - Amount (auto-fills net salary)
3. Click "Record Payment"
4. Status changes to "Paid"

## Example Scenario

**Employee:** John Doe  
**Monthly Salary:** ₹12,000  
**Month:** October 2025 (31 days)  
**Attendance:**
- Present: 24 days
- Absent: 6 days
- Half Day: 1 day
- Commission: ₹5,000

**Calculation:**
```
Per Day Salary = 12,000 ÷ 31 = ₹387.10

Working Days = 24 + (1 × 0.5) = 24.5 days
Basic Amount = 387.10 × 24.5 = ₹9,484

Absent Deduction = 387.10 × 6 = ₹2,323

Earnings:
- Basic Amount: ₹9,484
- Commission: ₹5,000
- Total Earnings: ₹14,484

Deductions:
- Absent Deduction: ₹2,323
- Total Deductions: ₹2,323

Net Salary = ₹14,484 - ₹2,323 = ₹12,161
```

**Salary Slip will show:**
- Gross Salary: ₹14,484
- Total Deductions: ₹2,323
- **Net Salary: ₹12,161**

## Frontend Pages

### 1. AttendanceMarking.jsx
- Daily attendance interface
- Employee list with status dropdowns
- Bulk marking buttons
- Real-time summary
- Remarks input
- Save functionality

### 2. SalaryManagement.jsx
- Salary slips listing table
- Month/year filters
- Generate single/bulk buttons
- Approve/Pay actions
- Detailed slip view modal
- Payment recording modal
- Summary statistics

## Security & Permissions

- All endpoints require authentication
- Only Admin and Supervisor can:
  - Mark attendance
  - Generate salary slips
  - Approve slips
  - Record payments
- Drivers can view their own attendance and salary slips (future enhancement)

## Database Indexes

### Attendance
```javascript
{ employeeId: 1, date: 1 } // Unique compound index
{ date: 1 } // Date range queries
```

### SalarySlip
```javascript
{ employeeId: 1, month: 1, year: 1 } // Unique compound index
{ status: 1, paymentStatus: 1 } // Status queries
```

## Future Enhancements

1. **Leave Management**
   - Leave application system
   - Leave approval workflow
   - Leave balance tracking

2. **Advanced Salary Components**
   - HRA, DA, TA allowances
   - PF, ESI deductions
   - Tax calculations (TDS)
   - Overtime calculations

3. **Payroll Reports**
   - Monthly payroll summary
   - Year-to-date earnings
   - Tax statements
   - Bank transfer files

4. **Employee Self-Service**
   - View own attendance
   - View salary slips
   - Request leave
   - Apply for advance

5. **Notifications**
   - Attendance reminders
   - Salary slip generation alerts
   - Payment confirmation messages

6. **Analytics**
   - Attendance trends
   - Salary expense analysis
   - Employee performance metrics

## Files Created

### Backend
- `backend/src/models/Attendance.js`
- `backend/src/models/SalarySlip.js`
- `backend/src/controllers/attendanceController.js`
- `backend/src/controllers/salarySlipController.js`
- `backend/src/routes/attendanceRoutes.js`
- `backend/src/routes/salarySlipRoutes.js`

### Frontend
- `admin-dashboard/src/pages/AttendanceMarking.jsx`
- `admin-dashboard/src/pages/SalaryManagement.jsx`
- `admin-dashboard/src/services/attendanceService.js`
- `admin-dashboard/src/services/salarySlipService.js`

### Updated Files
- `backend/src/models/Driver.js` (added salary field)
- `backend/src/index.js` (registered routes)
- `admin-dashboard/src/App.jsx` (added routes)
- `admin-dashboard/src/components/Layout.jsx` (added menu items)
- `admin-dashboard/src/pages/index.js` (exported new pages)

## Testing Checklist

- [ ] Mark attendance for today
- [ ] Mark attendance for past date
- [ ] Bulk mark all present
- [ ] Bulk mark all absent
- [ ] Generate single salary slip
- [ ] Bulk generate for all employees
- [ ] View salary slip details
- [ ] Approve salary slip
- [ ] Record cash payment
- [ ] Record bank transfer payment
- [ ] Filter by month/year
- [ ] Filter by status
- [ ] Filter by payment status
- [ ] Verify salary calculations
- [ ] Verify attendance summaries

## Support

For issues or questions, contact the development team or check the main project documentation.
