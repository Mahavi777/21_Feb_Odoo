# Vehicle Management System - Backend API

## Overview
Complete backend API for a vehicle management system with authentication, role-based access control, and comprehensive features for managing vehicles, trips, fuel, and maintenance.

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js                 # Database connection config
│   │   └── env.js                # Environment variables
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js    # Login/Register logic
│   │   │   └── auth.routes.js        # Auth endpoints
│   │   │
│   │   ├── users/
│   │   │   ├── user.model.js         # User schema
│   │   │   ├── user.controller.js    # User CRUD logic
│   │   │   └── user.routes.js        # User endpoints
│   │   │
│   │   ├── vehicles/
│   │   │   ├── vehicle.model.js      # Vehicle schema
│   │   │   ├── vehicle.controller.js # Vehicle CRUD logic
│   │   │   └── vehicle.routes.js     # Vehicle endpoints
│   │   │
│   │   ├── trips/
│   │   │   ├── trip.model.js         # Trip schema with validation
│   │   │   ├── trip.controller.js    # Trip CRUD logic
│   │   │   └── trip.routes.js        # Trip endpoints
│   │   │
│   │   ├── fuel/
│   │   │   ├── fuel.model.js         # Fuel schema
│   │   │   ├── fuel.controller.js    # Fuel CRUD logic
│   │   │   └── fuel.routes.js        # Fuel endpoints
│   │   │
│   │   ├── maintenance/
│   │   │   ├── maintenance.model.js      # Maintenance schema
│   │   │   ├── maintenance.controller.js # Maintenance logic
│   │   │   └── maintenance.routes.js     # Maintenance endpoints
│   │   │
│   │   └── analytics/
│   │       ├── analytics.controller.js   # Analytics logic
│   │       └── analytics.routes.js       # Analytics endpoints
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT & license verification
│   │   ├── role.middleware.js       # Role-based access control
│   │   └── error.middleware.js      # Error handling
│   │
│   ├── utils/
│   │   ├── apiResponse.js           # Response formatting
│   │   └── validators.js            # Input validation
│   │
│   ├── app.js                       # Express app setup
│   └── server.js                    # Server entry point
│
├── package.json
├── .env                             # Environment variables
└── README.md

```

## Installation

### Prerequisites
- Node.js >= 14
- MongoDB

### Steps

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables**
   Create `.env` file with:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/vehicle_management
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   ```

3. **Start the server**
   ```bash
   # Development with nodemon
   npm run dev
   
   # Production
   npm start
   ```

## Models

### 👤 User Model
```javascript
{
  name: string (required),
  email: string (unique, required),
  password: string (hashed with bcrypt, required),
  role: ["manager", "dispatcher", "safety", "finance"],
  status: ["onDuty", "offDuty", "suspended"],
  licenseNumber: string (unique, required),
  licenseExpiry: date (required),
  safetyScore: number (0-100, default: 100),
  createdAt: date,
  updatedAt: date
}
```

### 🚚 Vehicle Model
```javascript
{
  name: string (required),
  model: string (required),
  licensePlate: string (unique, required),
  maxCapacity: number (required),
  odometer: number (default: 0),
  status: ["available", "onTrip", "inShop", "retired"],
  acquisitionCost: number (required),
  vehicleType: string (required),
  region: string (required),
  createdAt: date,
  updatedAt: date
}
```

### 📦 Trip Model
```javascript
{
  vehicleId: ObjectId (ref: Vehicle, required),
  driverId: ObjectId (ref: User, required),
  cargoWeight: number (required, validated against vehicle capacity),
  status: ["draft", "dispatched", "completed", "cancelled"],
  startOdometer: number,
  endOdometer: number,
  revenue: number (default: 0),
  createdAt: date,
  updatedAt: date
}
```

**Validation**: Cargo weight cannot exceed vehicle max capacity

### 🛠 Maintenance Model
```javascript
{
  vehicleId: ObjectId (ref: Vehicle, required),
  description: string (required),
  cost: number (required),
  date: date,
  createdAt: date
}
```

**Auto Logic**: When maintenance is added → vehicle.status = "inShop"

### ⛽ Fuel Model
```javascript
{
  vehicleId: ObjectId (ref: Vehicle, required),
  liters: number (required),
  cost: number (required),
  date: date,
  tripId: ObjectId (ref: Trip, optional),
  createdAt: date
}
```

## Authentication & Security

### Password Hashing
- Uses bcryptjs with salt rounds = 10
- Passwords are never returned in API responses

### JWT Token
- Issued on successful login/registration
- Expires in 7 days
- Required in Authorization header: `Bearer <token>`

### Middleware Chain
1. **verifyToken** - Validates JWT and loads user
2. **roleGuard** - Checks if user has required role
3. **checkLicenseExpiry** - Validates driver license expiry
4. **blockDriverIfNotEligible** - Blocks suspended drivers or expired licenses

## API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
GET    /api/auth/me                # Get current user (protected)
```

### Users
```
GET    /api/users                  # Get all users (manager, finance)
GET    /api/users/:id              # Get user by ID (manager, finance)
PUT    /api/users/:id              # Update user (manager)
DELETE /api/users/:id              # Delete user (manager)
GET    /api/users/drivers/list     # Get all drivers
PATCH  /api/users/drivers/:id/status # Update driver status (manager)
```

### Vehicles
```
GET    /api/vehicles               # Get all vehicles
GET    /api/vehicles/:id           # Get vehicle by ID
POST   /api/vehicles               # Create vehicle (manager)
PUT    /api/vehicles/:id           # Update vehicle (manager)
DELETE /api/vehicles/:id           # Delete vehicle (manager)
GET    /api/vehicles/status/available # Get available vehicles
PATCH  /api/vehicles/:id/odometer  # Update odometer (dispatcher)
```

### Trips
```
POST   /api/trips                  # Create trip (dispatcher, with driver eligibility check)
GET    /api/trips                  # Get all trips
GET    /api/trips/:id              # Get trip by ID
PATCH  /api/trips/:id/dispatch     # Dispatch trip (dispatcher)
PATCH  /api/trips/:id/complete     # Complete trip (dispatcher)
PATCH  /api/trips/:id/cancel       # Cancel trip (dispatcher)
GET    /api/trips/driver/:driverId # Get trips by driver
GET    /api/trips/vehicle/:vehicleId # Get trips by vehicle
```

### Fuel
```
POST   /api/fuel                   # Create fuel record (dispatcher)
GET    /api/fuel                   # Get all fuel records
GET    /api/fuel/:id               # Get fuel by ID
GET    /api/fuel/vehicle/:vehicleId # Get fuel by vehicle
GET    /api/fuel/trip/:tripId      # Get fuel by trip
DELETE /api/fuel/:id               # Delete fuel record (manager)
GET    /api/fuel/analytics/consumption # Get fuel analytics (manager, finance)
```

### Maintenance
```
POST   /api/maintenance            # Create maintenance (manager, safety)
GET    /api/maintenance            # Get all maintenance records
GET    /api/maintenance/:id        # Get maintenance by ID
GET    /api/maintenance/vehicle/:vehicleId # Get maintenance by vehicle
DELETE /api/maintenance/:id        # Delete maintenance (manager)
PATCH  /api/maintenance/:id/complete # Complete maintenance (manager, safety)
```

### Analytics
```
GET    /api/analytics/dashboard/overview      # Dashboard stats (manager, finance)
GET    /api/analytics/revenue                 # Revenue analytics (manager, finance)
GET    /api/analytics/vehicles/utilization    # Vehicle utilization (manager, finance)
GET    /api/analytics/drivers/performance     # Driver performance (manager, safety)
GET    /api/analytics/maintenance/costs       # Maintenance costs (manager, finance)
GET    /api/analytics/fuel/trends             # Fuel consumption trends (manager, finance)
```

## Role-Based Access Control

| Feature | Manager | Dispatcher | Safety | Finance |
|---------|---------|-----------|--------|---------|
| Create/Edit User | ✅ | ❌ | ❌ | ❌ |
| Create Vehicle | ✅ | ❌ | ❌ | ❌ |
| Create Trip | ✅ | ✅ | ❌ | ❌ |
| Dispatch Trip | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ❌ | ❌ | ✅ |
| View Driver Performance | ✅ | ❌ | ✅ | ❌ |
| Create Maintenance | ✅ | ❌ | ✅ | ❌ |

## Driver Eligibility Checks

When creating/assigning a trip, the system verifies:
- ✅ Driver status is "onDuty" (not "suspended")
- ✅ License is not expired
- ✅ Cargo weight ≤ Vehicle max capacity

If any check fails, the trip creation is blocked with appropriate error message.

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": {} // Only in development
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Example Usage

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "dispatcher",
    "licenseNumber": "DL123456",
    "licenseExpiry": "2025-12-31"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Vehicle (Manager)
```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Truck A",
    "model": "Hino 500",
    "licensePlate": "ABC123",
    "maxCapacity": 5000,
    "acquisitionCost": 50000,
    "vehicleType": "truck",
    "region": "North"
  }'
```

### Create Trip (Dispatcher)
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "vehicle_id",
    "driverId": "driver_id",
    "cargoWeight": 3000,
    "startOdometer": 50000,
    "revenue": 5000
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection | localhost:27017 |
| JWT_SECRET | JWT signing key | your_jwt_secret_key |
| JWT_EXPIRE | Token expiry | 7d |

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **cors** - CORS handling

## Development

```bash
# Install dev dependencies
npm install --save-dev

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## Testing with Postman

Import the following collection:
1. Set environment variable `token` after login
2. Use `{{token}}` in Authorization header
3. Test endpoints with provided examples

## Support & Documentation

For detailed API documentation, check individual controller files.
Each endpoint is documented with request/response examples.

---

**Last Updated**: February 21, 2026
