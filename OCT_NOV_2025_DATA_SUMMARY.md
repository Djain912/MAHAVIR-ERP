# October-November 2025 Data Summary

## 📊 Database Seeded Successfully

The database has been populated with comprehensive test data for **October and November 2025** (2 complete months).

---

## 📅 Date Range

- **Start Date:** October 1, 2025
- **End Date:** November 30, 2025
- **Total Days:** 61 calendar days
- **Working Days:** ~52 days (Monday-Saturday, Sundays excluded for dispatches)

---

## 📈 Data Volumes

### Core Operations
| Module | Count | Details |
|--------|-------|---------|
| **Dispatches** | 52 | One per working day (Mon-Sat) across Oct-Nov |
| **Dispatch Items** | 357 | 5-8 items per dispatch (retail + wholesale) |
| **Sales** | 151 | 2-4 sales per dispatch, distributed throughout the day |
| **Cash Collections** | 22 | Only for completed dispatches (October days that have passed) |
| **Cheques** | 113 | Various statuses: Pending, Deposited, Cleared, Bounced |

### HR & Payroll
| Module | Count | Details |
|--------|-------|---------|
| **Attendance** | 305 | 61 days × 5 active drivers (90% attendance rate) |
| **Leave Applications** | 25 | Random dates within Oct-Nov, various statuses |
| **Salary Advances** | 20 | Spread across Oct-Nov, past=Recovering, future=Pending |
| **Salary Slips** | 10 | 5 drivers × 2 months (October + November) |
| **Expenses** | 80 | Random dates, various categories (TEA, COIN, TEMPO, etc.) |

### Inventory & Sales
| Module | Count | Details |
|--------|-------|---------|
| **Products** | 10 | Various beverage products with sizes |
| **Stock Entries** | 40 | Initial stock entries |
| **PickLists** | 10 | Extracted picklists spread across Oct-Nov |
| **Counter Sales** | 60 | Walk-in sales at counter, random dates in Oct-Nov |

### Master Data
| Module | Count | Details |
|--------|-------|---------|
| **Drivers** | 6 | 5 active, 1 inactive |
| **Retailers** | 10 | 9 active, 1 inactive |
| **Wholesalers** | 3 | All active |

---

## 🗓️ Data Distribution Logic

### Dispatches (52 working days)
- **October 2025:** 27 working days (Mon-Sat)
- **November 2025:** 25 working days (Mon-Sat)
- **Status Logic:**
  - Past dates (< today): Status = "Completed"
  - Future dates (>= today): Status = "Active"
- **Driver Assignment:** Rotates through 5 active drivers
- **Items:** 3-7 retail items + 1-3 wholesale items per dispatch

### Sales (~151 sales)
- **Distribution:** 2-4 sales per dispatch
- **Timing:** Spread throughout the day (2-hour intervals)
- **Payment Methods:** Mix of Cash, UPI, Cheque
- **Linked to:** Specific dispatches (retailer/wholesaler from dispatch)

### Cash Collections (22)
- **Logic:** Only for **completed** dispatches (October days that have passed)
- **Calculation:** Sums cash payments from sales of that dispatch
- **November:** No collections yet (all dispatches still Active)

### Attendance (305 records)
- **Coverage:** All 61 days (Oct 1 - Nov 30)
- **Employees:** 5 active drivers
- **Pattern:** 90% present, 10% absent
- **Hours:** 8-10 working hours for present days
- **Status:** "Present" if ≥8 hours, "Half-Day" if <8 hours

### Salary Slips (10)
- **October 2025:** 5 slips (1 per active driver)
  - Status: "Paid"
  - Payment Date: October 30, 2025
  - Attendance: Calculated from October attendance records
- **November 2025:** 5 slips (1 per active driver)
  - Status: "Draft" (current month)
  - Payment Date: Not yet set
  - Attendance: Calculated from November attendance records

### Leave Applications (25)
- **Date Range:** Random dates within Oct-Nov 2025
- **Duration:** 1-3 days per leave
- **Status Distribution:**
  - Pending: 33%
  - Approved: 33%
  - Rejected: 33%
- **Types:** Sick Leave, Casual Leave, Paid Leave, Unpaid Leave

### Salary Advances (20)
- **Date Range:** Random dates within Oct-Nov 2025
- **Status Logic:**
  - Past dates: "Recovering" (70%) or "Approved" (30%)
  - Future dates: "Pending"
- **Amount:** ₹2,000 - ₹7,000

### Expenses (80)
- **Date Range:** Random dates within Oct-Nov 2025
- **Categories:** TEA, COIN, Extra Labor, TEMPO, Miscellaneous, Office Supplies, Transport, Maintenance
- **Amounts:**
  - TEA/COIN: ₹100-500
  - Extra Labor: ₹500-1,500
  - TEMPO/Transport: ₹1,000-3,000

### Counter Sales (60)
- **Date Range:** Random dates within Oct-Nov 2025
- **Items:** 2-6 products per sale
- **Customers:** Mix of walk-ins and registered customers
- **Payment:** Cash, Card, UPI

### PickLists (10)
- **Date Range:** Random dates within Oct-Nov 2025
- **Items:** 6 items per picklist
- **Status:** All extracted
- **Routes:** Distributed across Route A-E

---

## 🔐 Login Credentials

### Admin Dashboard
- **Phone:** 9999999999
- **Password:** admin123

### Driver Mobile App
- **Phone:** 9876543210
- **Password:** 123456

---

## 🎯 Testing Recommendations

### 1. Dashboard Charts & Analytics
- View dashboard to see Oct-Nov trends
- Check monthly comparisons between October and November
- Verify charts show data for both months

### 2. Reports & Filters
- Filter by October 2025 → Should show ~27 working days
- Filter by November 2025 → Should show ~25 working days
- Check date range filters work correctly

### 3. Dispatch Management
- Should see 52 total dispatches
- Filter by "Completed" → October dispatches (past dates)
- Filter by "Active" → November dispatches + future October dates

### 4. Cash Reconciliation
- Should show ~22 cash collections
- All should be from October (completed dispatches only)
- November collections will appear as dates pass

### 5. Attendance Module
- View October → 61 days worth of records
- Check calendar view shows complete months
- Verify 90% attendance rate

### 6. Salary Management
- October slips → Status: "Paid"
- November slips → Status: "Draft"
- Check salary calculations include attendance, advances, deductions

### 7. Sales & Cheques
- View sales list → Should show 151 entries
- Check cheque management → 113 cheques with various statuses
- Verify linked sales show correct dispatch references

### 8. Expense Tracking
- Should show 80 expense entries
- Filter by category → Check distribution
- Verify date ranges within Oct-Nov 2025

### 9. Driver Mobile App
- Login with driver credentials
- Should see **current day's dispatch** (if today falls in Oct-Nov 2025)
- If today is outside Oct-Nov, may show "No active dispatch"
- View collection history → Should show past collections

---

## ⚠️ Important Notes

### Date Context
- All data is generated for **October-November 2025**
- If current date is **before** October 2025: All dispatches will be "Active"
- If current date is **during** Oct-Nov 2025: Past dispatches are "Completed", future are "Active"
- If current date is **after** November 2025: All dispatches will be "Completed"

### Data Integrity
- All sales are properly linked to dispatches
- Cash collections reference specific dispatches
- Attendance records are used in salary slip calculations
- Cheques are linked to sales and retailers/wholesalers

### Realistic Patterns
- **Sundays:** No dispatches (working days only)
- **Attendance:** 90% present rate (realistic for drivers)
- **Sales per Dispatch:** 2-4 sales (realistic for daily routes)
- **Payment Mix:** Cash, UPI, Cheque distributed across sales

---

## 🔄 Re-seeding

To regenerate data:

```bash
cd backend
node scripts/seed-database.js
```

**Note:** This will:
- ✅ Preserve all admin users
- ❌ Delete all other data (drivers, sales, attendance, etc.)
- ✅ Create fresh Oct-Nov 2025 data

---

## 📝 Data Quality

### Relationships
- ✅ Sales → Dispatches (properly linked)
- ✅ Cash Collections → Dispatches (only completed)
- ✅ Attendance → Salary Slips (calculations correct)
- ✅ Advances → Deductions in Salary Slips
- ✅ Cheques → Sales → Retailers/Wholesalers

### Validation
- ✅ All dates within Oct 1 - Nov 30, 2025
- ✅ Working days exclude Sundays for dispatches
- ✅ Past/future status logic correctly applied
- ✅ Attendance covers all 61 days
- ✅ 2 complete months of salary slips

---

## 🎉 Summary

You now have **2 complete months** of realistic ERP data for October and November 2025, covering:
- ✅ 52 working days of dispatches
- ✅ 151 sales transactions
- ✅ 305 attendance records
- ✅ 10 salary slips (both months)
- ✅ 113 cheque transactions
- ✅ 80 expense entries
- ✅ 60 counter sales
- ✅ Complete HR data (leaves, advances)

Perfect for testing monthly reports, analytics, and all ERP features! 🚀
