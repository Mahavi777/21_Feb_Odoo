# Financial Analyst Module - API & Code Examples

## 🔌 Backend API Examples

### Authentication
All finance endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 API Endpoint Examples

### 1. GET /api/finance/dashboard
Get complete financial dashboard summary with all KPIs.

**Request:**
```bash
curl -X GET http://localhost:5000/api/finance/dashboard \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 125000.50,
    "totalFuelCost": 32000.75,
    "totalMaintenanceCost": 18500.25,
    "totalOperationalCost": 50501.00,
    "netProfit": 74499.50,
    "fleetROI": 32.85,
    "utilizationRate": 68.50
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "message": "Access denied. Required roles: finance, manager",
  "statusCode": 403
}
```

---

### 2. GET /api/finance/report
Get monthly financial report for specific month and year.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/finance/report?month=2&year=2026" \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "month": "February 2026",
    "revenue": 18500.00,
    "fuelCost": 5200.50,
    "maintenanceCost": 2100.00,
    "netProfit": 11199.50
  }
}
```

**Error Response (Bad Request):**
```json
{
  "success": false,
  "message": "Month and year are required"
}
```

---

### 3. GET /api/finance/top-costly
Get top costliest vehicles by operational cost.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/finance/top-costly?limit=5" \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "vehicleId": "507f1f77bcf86cd799439011",
      "vehicleName": "Heavy Hauler #1",
      "licensePlate": "ABC-1234",
      "totalFuelCost": 8500.00,
      "totalMaintenanceCost": 4200.50,
      "totalOperationalCost": 12700.50
    },
    {
      "vehicleId": "507f1f77bcf86cd799439012",
      "vehicleName": "City Truck #2",
      "licensePlate": "XYZ-5678",
      "totalFuelCost": 6800.00,
      "totalMaintenanceCost": 3100.25,
      "totalOperationalCost": 9900.25
    }
    // ... more vehicles
  ]
}
```

---

### 4. GET /api/finance/vehicle/:vehicleId
Get detailed financial breakdown for specific vehicle.

**Request:**
```bash
curl -X GET "http://localhost:5000/api/finance/vehicle/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer {token}"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vehicleId": "507f1f77bcf86cd799439011",
    "vehicleName": "Alpha Hauler",
    "licensePlate": "AB-1234",
    "acquisitionCost": 150000.00,
    "totalRevenue": 48500.00,
    "totalFuelCost": 12000.75,
    "totalMaintenanceCost": 5200.50,
    "totalDistance": 12500,
    "costPerKm": 1.38,
    "roi": 22.87
  }
}
```

---

### 5. GET /api/finance/export
Export financial data as CSV or PDF.

**CSV Export Request:**
```bash
curl -X GET "http://localhost:5000/api/finance/export?format=csv" \
  -H "Authorization: Bearer {token}" \
  --output financial-report.csv
```

**CSV Output Sample:**
```csv
FLEET FINANCIAL REPORT
=========================

VEHICLE FINANCIAL BREAKDOWN
vehicleName,licensePlate,vehicleType,acquisitionCost,totalRevenue,totalFuelCost,totalMaintenanceCost,totalOperationalCost,netProfit,roi
Alpha Hauler,AB-1234,truck,150000,48500,12000.75,5200.50,17201.25,31298.75,20.87
City Runner,CD-5678,van,45000,22100,8500.50,3100.25,11600.75,10499.25,23.33
Quick Dash,EF-9012,bike,8000,5200,1200.00,500.00,1700.00,3500.00,43.75

MONTHLY SUMMARY
month,revenue,fuelCost,maintenanceCost,netProfit
January 2026,15200.00,4100.50,1800.25,9299.25
February 2026,18500.00,5200.50,2100.00,11199.50
March 2026,17800.00,4900.75,2050.50,10848.75
```

**PDF Export Request:**
```bash
curl -X GET "http://localhost:5000/api/finance/export?format=pdf" \
  -H "Authorization: Bearer {token}" \
  --output financial-report.pdf
```

---

## 🎨 Frontend Component Examples

### Using Finance Dashboard in React

**Basic Import:**
```typescript
import FinanceDashboard from '@/pages/FinanceDashboard';

// In App.tsx routes:
<Route
  path="/finance"
  element={
    <ProtectedRoute requiredRole="finance">
      <FinanceDashboard />
    </ProtectedRoute>
  }
/>
```

### Fetching Finance Data

**Example: Fetch Dashboard Summary**
```typescript
const fetchDashboard = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/finance/dashboard', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Dashboard data:', data.data);
      // Update component state
      setDashboardData(data.data);
    } else {
      console.error('Failed to fetch:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Call on component mount
useEffect(() => {
  if (token) {
    fetchDashboard();
  }
}, [token]);
```

**Example: Fetch Top Costly Vehicles**
```typescript
const fetchTopCostly = async () => {
  try {
    const response = await fetch(
      'http://localhost:5000/api/finance/top-costly?limit=5',
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setTopCostly(data.data);
  } catch (error) {
    console.error('Error fetching top costly:', error);
  }
};
```

**Example: Export to CSV**
```typescript
const handleExportCSV = async () => {
  try {
    const response = await fetch(
      'http://localhost:5000/api/finance/export?format=csv',
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial-report.csv';
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting:', error);
  }
};
```

---

## 🏗️ Service Layer Examples

### Finance Service Methods

**Get Dashboard Summary:**
```javascript
// server/src/modules/finance/finance.service.js

exports.getDashboardSummary = async () => {
  // 1. Get all completed trips
  const trips = await Trip.find({ status: 'completed' });
  const totalRevenue = trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

  // 2. Sum all fuel costs
  const fuelRecords = await Fuel.find();
  const totalFuelCost = fuelRecords.reduce((sum, fuel) => sum + (fuel.cost || 0), 0);

  // 3. Sum all maintenance costs
  const maintenanceRecords = await Maintenance.find();
  const totalMaintenanceCost = maintenanceRecords.reduce(
    (sum, maint) => sum + (maint.cost || 0),
    0
  );

  // 4. Calculate operational cost
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

  // 5. Calculate net profit
  const netProfit = totalRevenue - totalOperationalCost;

  // 6. Get vehicles and calculate ROI
  const vehicles = await Vehicle.find();
  const totalAcquisitionCost = vehicles.reduce(
    (sum, vehicle) => sum + (vehicle.acquisitionCost || 0),
    0
  );
  const fleetROI = totalAcquisitionCost > 0
    ? ((netProfit / totalAcquisitionCost) * 100).toFixed(2)
    : 0;

  // 7. Calculate utilization rate
  const utilizationRate = vehicles.length > 0
    ? ((trips.length / vehicles.length) * 100).toFixed(2)
    : 0;

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
    totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
    totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
    netProfit: parseFloat(netProfit.toFixed(2)),
    fleetROI: parseFloat(fleetROI),
    utilizationRate: parseFloat(utilizationRate),
  };
};
```

**Get Vehicle Breakdown:**
```javascript
exports.getVehicleFinancialBreakdown = async (vehicleId) => {
  // 1. Find vehicle
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new Error('Vehicle not found');

  // 2. Get all completed trips for this vehicle
  const trips = await Trip.find({ vehicleId, status: 'completed' });
  const totalRevenue = trips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

  // 3. Calculate distance traveled
  let totalDistance = 0;
  trips.forEach(trip => {
    if (trip.startOdometer && trip.endOdometer) {
      totalDistance += trip.endOdometer - trip.startOdometer;
    }
  });

  // 4. Get fuel and maintenance costs
  const fuelRecords = await Fuel.find({ vehicleId });
  const totalFuelCost = fuelRecords.reduce((sum, fuel) => sum + (fuel.cost || 0), 0);

  const maintenanceRecords = await Maintenance.find({ vehicleId });
  const totalMaintenanceCost = maintenanceRecords.reduce(
    (sum, maint) => sum + (maint.cost || 0),
    0
  );

  // 5. Calculate cost per km
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
  const costPerKm = totalDistance > 0
    ? ((totalOperationalCost / totalDistance).toFixed(2))
    : 0;

  // 6. Calculate ROI
  const roi = vehicle.acquisitionCost > 0
    ? (((totalRevenue - totalOperationalCost) / vehicle.acquisitionCost) * 100).toFixed(2)
    : 0;

  return {
    vehicleId,
    vehicleName: vehicle.name,
    licensePlate: vehicle.licensePlate,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
    totalMaintenanceCost: parseFloat(totalMaintenanceCost.toFixed(2)),
    totalDistance,
    costPerKm: parseFloat(costPerKm),
    roi: parseFloat(roi),
    acquisitionCost: vehicle.acquisitionCost,
  };
};
```

---

## 🔑 Key Features Implementation

### Feature: Role-Based Access Control

**In Routes:**
```javascript
// server/src/modules/finance/finance.routes.js
router.get(
  '/dashboard',
  verifyToken,                                    // Step 1: Verify user is authenticated
  roleMiddleware(['finance', 'manager']),         // Step 2: Check role
  financeController.getDashboardSummary          // Step 3: Execute controller
);
```

**In Frontend:**
```typescript
// client/src/routes/ProtectedRoute.tsx
export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (requiredRole && user) {
    const allowedAccess = ROLE_PERMISSIONS[user.role]?.includes(requiredRole);
    if (!allowedAccess) {
      return <Navigate to="/dashboard" />;  // Redirect if no access
    }
  }

  return <>{children}</>;
}
```

### Feature: Data Export as PDF

**PDF Generation:**
```javascript
// server/src/modules/finance/finance.controller.js
const PDFDocument = require('pdfkit');

exports.exportPDF = async (req, res) => {
  const summary = await financeService.getDashboardSummary();
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

  // Create PDF content
  doc.fontSize(24).font('Helvetica-Bold').text('FleetFlow Financial Report', { align: 'center' });
  doc.moveDown();

  // Add KPI data
  doc.fontSize(10).font('Helvetica');
  doc.text(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
  doc.text(`Net Profit: $${summary.netProfit.toFixed(2)}`);
  doc.text(`Fleet ROI: ${summary.fleetROI.toFixed(2)}%`);

  // Pipe to response
  doc.pipe(res);
  doc.end();
};
```

---

## 📈 Chart Data Examples

### Revenue vs Expense Chart

**Expected Data Format:**
```javascript
const chartData = [
  {
    month: "Jan",
    revenue: 15000,
    expense: 4500,
    profit: 10500
  },
  {
    month: "Feb",
    revenue: 18500,
    expense: 5200,
    profit: 13300
  },
  {
    month: "Mar",
    revenue: 17800,
    expense: 4900,
    profit: 12900
  }
];
```

**Recharts Implementation:**
```typescript
<BarChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
  <Legend />
  <Bar dataKey="revenue" fill="#3b82f6" />
  <Bar dataKey="expense" fill="#ef4444" />
</BarChart>
```

---

## 🔍 Debugging Tips

### Enable Backend Logging

**Add to finance.service.js:**
```javascript
console.log('[Finance Service] Fetching dashboard summary...');
const trips = await Trip.find({ status: 'completed' });
console.log(`[Finance Service] Found ${trips.length} completed trips`);
console.log(`[Finance Service] Total Revenue: ${totalRevenue}`);
```

### Enable Frontend Logging

**Add to FinanceDashboard.tsx:**
```typescript
useEffect(() => {
  console.log('[FinanceDashboard] Component mounted');
  console.log('[FinanceDashboard] Token:', token ? 'Present' : 'Missing');
  console.log('[FinanceDashboard] Fetching dashboard data...');
  fetchDashboard();
}, [token]);
```

### Monitor Network Requests

**In Browser:**
1. Press F12 to open DevTools
2. Go to "Network" tab
3. Perform action (e.g., click Export)
4. Check request/response:
   - Status: Should be 200
   - Response: Should contain data
   - Headers: Should have Authorization token

---

## ✨ Complete Workflow Example

### User Perspective: From Login to Export

```
1. User opens browser → http://localhost:5173
2. Redirected to /login
3. User enters finance@fleetflow.com / password
4. Login API call to /api/auth/login
5. Receive token and user data
6. Token stored in localStorage
7. Redirect to /dashboard
8. Dashboard renders with menu items
9. User clicks "Finance" in sidebar
10. Navigate to /finance
11. ProtectedRoute checks role → Grants access
12. FinanceDashboard component renders
13. useEffect triggers fetchDashboard()
14. API call: GET /api/finance/dashboard
15. Include token in Authorization header
16. Backend verifies token and role
17. financeService.getDashboardSummary() executes
18. Aggregates data from database
19. Returns calculated metrics
20. Frontend receives response
21. KPI cards update with data
22. Charts render with monthly data
23. Tables populate with top vehicles
24. User clicks "Export CSV"
25. API call: GET /api/finance/export?format=csv
26. Backend generates CSV file
27. File downloaded to user's computer
28. User opens CSV in Excel/Google Sheets
```

---

## 🎯 Summary

This implementation provides:
- ✅ Complete financial analytics backend
- ✅ Role-based access control
- ✅ Real-time data aggregation
- ✅ Interactive frontend dashboard
- ✅ Multiple export formats
- ✅ Production-ready code

All APIs are secured, authenticated, and properly documented. The module integrates seamlessly with the existing FleetFlow architecture.
