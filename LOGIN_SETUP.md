# ✅ Login Setup - Quick Start

## 🚀 Running the Application

### Terminal 1: Start Backend Server
```bash
cd server
npm run dev
```

Expected output:
```
MongoDB Connected: cluster0...
Server is running on port 5000
```

### Terminal 2: Seed Demo Users (Run Once)
```bash
cd server
npm run seed
```

Expected output:
```
✅ Created user: manager@fleetflow.io
✅ Created user: dispatch@fleetflow.io
✅ Created user: safety@fleetflow.io
✅ Created user: finance@fleetflow.io
✅ Demo users seeding completed!
```

### Terminal 3: Start Frontend
```bash
cd client
npm run dev
```

Expected output:
```
VITE v5... ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## 🔐 Test Login

1. Open browser: `http://localhost:5173`
2. You'll be redirected to `/login`
3. Click any demo account button OR enter manually:

### Demo Credentials:
- **Manager**: manager@fleetflow.io / password
- **Dispatcher**: dispatch@fleetflow.io / password
- **Safety**: safety@fleetflow.io / password
- **Finance**: finance@fleetflow.io / password

4. Click "Sign in"
5. You should be logged in and redirected to dashboard

---

## 🔗 How It Works

### Client → Server Connection:
1. Frontend sends login request to `http://localhost:5000/api/auth/login`
2. Backend validates credentials against MongoDB
3. Backend returns JWT token + user data
4. Frontend stores token in localStorage
5. Future requests include Authorization header with token

### File Changes Made:
- ✅ Backend: Added CORS support in `server/src/app.js`
- ✅ Frontend: Updated AuthContext to call real API in `client/src/contexts/AuthContext.tsx`
- ✅ Frontend: Updated Login page with demo buttons in `client/src/pages/Login.tsx`
- ✅ Backend: Created seed script to add demo users in `server/seed.js`
- ✅ Config: Added .env.local for API URL in `client/.env.local`

---

## ❌ Troubleshooting

### Issue: "Login failed" Error
**Check:**
1. Is backend running on port 5000?
2. Are demo users seeded? (`npm run seed`)
3. Check MongoDB connection in server logs

### Issue: CORS Error
**Check:**
- Backend should show CORS enabled for http://localhost:5173
- Look at network tab in browser DevTools

### Issue: Token Not Saving
**Check:**
- Open DevTools → Application → localStorage
- You should see `fleetflow_token` and `fleetflow_user` after login

### Issue: Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux  
lsof -i :5000
kill -9 <PID>
```

---

## 📋 Test API Manually

### Get Login Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@fleetflow.io",
    "password": "password"
  }'
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "Alex Morgan",
    "email": "manager@fleetflow.io",
    "role": "manager",
    "status": "onDuty"
  }
}
```

### Check Server Health
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## ✨ What's Working Now

✅ Login with real credentials
✅ JWT token storage
✅ User role persistence
✅ Auto-redirect to dashboard after login
✅ Logout functionality
✅ Demo account buttons on login page
✅ Full client-server integration

---

## 🎯 Next Steps (Optional)

After confirming login works, you can add:
- Signup functionality
- Protected route middleware
- API interceptor for token injection
- Refresh token logic
- More features per user role

---

**Ready to login? Visit `http://localhost:5173`** 🚀
