# 🚀 QUICK START GUIDE

## Get Up and Running in 5 Minutes!

### Prerequisites Check
- [ ] Node.js installed (v14+)
- [ ] npm installed
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command Prompt access

---

## 🎬 Step 1: Start the Backend

```bash
# Navigate to backend folder
cd "D:\KJ SOMAIYA\SEM 6\MP\CalorixReccomendation\backend"

# Install dependencies (first time only)
npm install

# Start the server
npm run server
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════╗
║   Calorix Recommendation Server Started Successfully   ║
╚═══════════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:4000
📊 Database: MongoDB Connected
🔐 Auth: JWT Authentication Enabled
...
```

✅ **Backend is Ready!** Leave this terminal window open.

---

## 🎨 Step 2: Start the Frontend

Open a **NEW** terminal window:

```bash
# Navigate to frontend folder
cd "D:\KJ SOMAIYA\SEM 6\MP\CalorixReccomendation\frontend"

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ **Frontend is Ready!** 

---

## 🧪 Step 3: Quick Test

### Option A: Test in Browser
1. Open: http://localhost:5173
2. The existing frontend should load
3. Note: Some features may not work yet - that's expected!

### Option B: Test Backend APIs
Open a **THIRD** terminal window:

```bash
# Test the server is responding
curl http://localhost:4000

# You should see the API info response
```

For detailed API testing, see: **TESTING_GUIDE.md**

---

## 🔧 Important Configuration

### Backend Server Port: 4000
The backend runs on `http://localhost:4000`

### Frontend Dev Server Port: 5173  
The frontend runs on `http://localhost:5173`

### Update Frontend API Calls
In your frontend code, update the meal plan API endpoint:

**OLD (won't work):**
```javascript
const response = await fetch('http://localhost:5000/profile', ...)
```

**NEW (correct):**
```javascript
const response = await fetch('http://localhost:4000/api/meal-plans/generate', ...)
```

---

## 🎯 What's Working Right Now

### ✅ Backend (Fully Functional)
- User registration & login
- Meal plan generation with real calculations
- Water intake tracking
- Exercise logging with calorie burn
- Food logging
- Comprehensive dashboard API
- All CRUD operations

### ⚠️ Frontend (Needs Updates)
The existing frontend has:
- ✅ User profile form
- ✅ Meal plan display
- ✅ Basic navigation
- ❌ Login/register pages (needs creation)
- ❌ Dashboard page (needs creation)
- ❌ Water tracking page (needs creation)
- ❌ Exercise logging page (needs creation)
- ❌ Authentication context (needs implementation)

---

## 📋 Next Steps for Complete Integration

### Priority 1: Fix Existing Meal Plan
Update `frontend/src/pages/UserProfileForm.jsx`:

Find this line (around line 377):
```javascript
const response = await fetch('http://localhost:5000/profile', {
```

Change to:
```javascript
const response = await fetch('http://localhost:4000/api/meal-plans/generate', {
```

### Priority 2: Add Authentication
1. Create authentication context
2. Store JWT token
3. Add token to API requests

### Priority 3: Create New Pages
1. Login/Register page
2. Dashboard page  
3. Water tracking page
4. Exercise logging page

Refer to **IMPLEMENTATION_GUIDE.md** for detailed instructions!

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is in use
netstat -ano | findstr :4000

# Kill the process if needed, then restart
```

### Frontend won't start
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Or start on different port
npm run dev -- --port 3000
```

### Database connection failed
1. Check internet connection (using MongoDB Atlas)
2. Verify MongoDB URI in `backend/config/db.js`
3. Check MongoDB Atlas IP whitelist

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation Files

- **IMPLEMENTATION_GUIDE.md** - Complete API documentation
- **CHANGES_SUMMARY.md** - What was built and changed
- **TESTING_GUIDE.md** - How to test the APIs
- **This file** - Quick start instructions

---

## 🎉 Success Checklist

- [ ] Backend starts on port 4000
- [ ] Frontend starts on port 5173
- [ ] Can access http://localhost:4000 (shows API info)
- [ ] Can access http://localhost:5173 (shows app)
- [ ] Can test APIs with curl/Postman
- [ ] No errors in backend console
- [ ] No errors in frontend console

Once all checked, you're ready to start integrating the new features!

---

## 💡 Pro Tips

1. **Keep 2 terminals open** - one for backend, one for frontend
2. **Use Postman** for API testing - easier than curl
3. **Check server console** for error messages
4. **Use browser DevTools** to debug frontend issues
5. **Read error messages carefully** - they usually tell you exactly what's wrong

---

## 🆘 Need Help?

1. Check the error message in the console
2. Review the documentation files
3. Check code comments - they explain what each part does
4. Test the backend separately from frontend
5. Verify environment variables are set correctly

---

## 📊 Project Structure Overview

```
CalorixReccomendation/
├── backend/                  # Backend server (Node.js + Express)
│   ├── server.js            # Main server file ⭐
│   ├── models/              # Database schemas
│   ├── controllers/         # Business logic
│   ├── routes/              # API endpoints
│   ├── middleware/          # Authentication, etc.
│   └── config/              # Database connection
│
├── frontend/                # Frontend app (React + Vite)
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   └── context/         # React context (for auth, etc.)
│   └── package.json
│
└── Documentation/           # Project documentation
    ├── IMPLEMENTATION_GUIDE.md
    ├── CHANGES_SUMMARY.md
    ├── TESTING_GUIDE.md
    └── QUICK_START.md (this file)
```

---

**You're all set! Happy coding! 🚀**

If both servers start successfully, you have a working backend with all features implemented!
