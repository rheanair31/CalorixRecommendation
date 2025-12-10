# How to Verify Data Persistence & Access Historical Data

## Quick Verification Tests

### Test 1: Verify Data Persists After Midnight

**Steps:**
1. Log some data today (water, food, exercise)
2. Note the amounts/values
3. Wait until after midnight (or change system date)
4. Check dashboard - it will show 0 for today (new day!)
5. **Verify old data exists** by querying yesterday's date

**How to Query Yesterday's Data (Browser Console):**
```javascript
// Open browser console (F12) on your website
const token = localStorage.getItem('token');
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dateStr = yesterday.toISOString().split('T')[0];

// Check water data
fetch(`http://localhost:4000/api/water-intake/daily?date=${dateStr}`, {
  headers: { token }
})
  .then(r => r.json())
  .then(data => console.log('Yesterday Water:', data));

// Check exercise data
fetch(`http://localhost:4000/api/exercise/daily?date=${dateStr}`, {
  headers: { token }
})
  .then(r => r.json())
  .then(data => console.log('Yesterday Exercise:', data));

// Check food data
fetch(`http://localhost:4000/api/food-log/daily?date=${dateStr}`, {
  headers: { token }
})
  .then(r => r.json())
  .then(data => console.log('Yesterday Food:', data));
```

**Expected Result:** All your logged data from yesterday will be returned ✅

---

### Test 2: Verify Exercise Refreshes on Dashboard

**Steps:**
1. Open Dashboard
2. Note current exercise minutes (e.g., 0 min)
3. Navigate to Exercise Logging
4. Log a new exercise (e.g., Running, 30 minutes)
5. Navigate back to Dashboard
6. **Verify** exercise card now shows updated value (e.g., 30 min)

**Troubleshooting if it doesn't update:**
- Check browser console for errors
- Verify you're logged in (token exists)
- Wait 20 seconds for auto-refresh
- Manually refresh browser (F5)

---

### Test 3: Check MongoDB Database Directly

**Using MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to your database (e.g., "Calorix-recommendation")
4. View collections:
   - `waterintakes` - All water logs
   - `exerciselogs` - All exercise logs
   - `foodlogs` - All food logs

**Check Data:**
```javascript
// In MongoDB Compass, run this query:
// Collection: exerciselogs
{
  userId: "YOUR_USER_ID_HERE"
}

// You'll see ALL exercise entries with dates
// Example result:
[
  {
    _id: ObjectId("..."),
    userId: "67...",
    date: ISODate("2024-12-05T08:30:00Z"),
    exercise_type: "running",
    duration_minutes: 30,
    calories_burned: 294
  },
  {
    _id: ObjectId("..."),
    userId: "67...",
    date: ISODate("2024-12-06T10:00:00Z"),
    exercise_type: "cycling",
    duration_minutes: 45,
    calories_burned: 360
  }
  // ... all your historical data
]
```

---

## How to Access Historical Data in Your App

### Option 1: Create a History Page

Add a new page to view past dates:

```javascript
// HistoryViewer.jsx
import React, { useState } from 'react';
import axios from 'axios';

const HistoryViewer = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState(null);
  const url = 'http://localhost:4000';
  const token = localStorage.getItem('token');

  const fetchDateData = async () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    try {
      const [water, exercise, food] = await Promise.all([
        axios.get(`${url}/api/water-intake/daily?date=${dateStr}`, { headers: { token } }),
        axios.get(`${url}/api/exercise/daily?date=${dateStr}`, { headers: { token } }),
        axios.get(`${url}/api/food-log/daily?date=${dateStr}`, { headers: { token } })
      ]);

      setData({
        water: water.data.data.total_ml || 0,
        exercise: exercise.data.total_duration_minutes || 0,
        calories: food.data.totals.calories || 0
      });
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  return (
    <div>
      <h1>View Historical Data</h1>
      
      <input 
        type="date" 
        value={selectedDate.toISOString().split('T')[0]}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
      />
      
      <button onClick={fetchDateData}>Load Data</button>

      {data && (
        <div>
          <p>Water: {data.water} ml</p>
          <p>Exercise: {data.exercise} minutes</p>
          <p>Calories: {data.calories} kcal</p>
        </div>
      )}
    </div>
  );
};

export default HistoryViewer;
```

### Option 2: Add Date Picker to Existing Pages

Modify any existing page to include date selection:

```javascript
// In Dashboard.jsx or any component
const [selectedDate, setSelectedDate] = useState(new Date());

// Modify API calls to use selected date
const fetchData = async () => {
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const response = await axios.get(
    `${url}/api/dashboard/quick-stats?date=${dateStr}`,
    { headers: { token } }
  );
  // ... handle response
};

// Add date picker in JSX
<input 
  type="date"
  value={selectedDate.toISOString().split('T')[0]}
  onChange={(e) => setSelectedDate(new Date(e.target.value))}
  max={new Date().toISOString().split('T')[0]} // Can't select future dates
/>
```

### Option 3: View Last 7/30 Days Summary

The dashboard already supports this via the `days` parameter:

```javascript
// In browser console or component
const token = localStorage.getItem('token');

// Get last 30 days of data
fetch('http://localhost:4000/api/dashboard?days=30', {
  headers: { token }
})
  .then(r => r.json())
  .then(data => {
    console.log('30-day summary:', data);
    console.log('Daily breakdown:', data.dashboard.daily_data);
    // Shows each day's calories, water, exercise, etc.
  });
```

---

## API Endpoints That Support Date Queries

### Water Intake
```javascript
// Today (default)
GET /api/water-intake/daily

// Specific date
GET /api/water-intake/daily?date=2024-12-05

// History (last N days)
GET /api/water-intake/history?days=7
```

### Exercise Logs
```javascript
// Today (default)
GET /api/exercise/daily

// Specific date
GET /api/exercise/daily?date=2024-12-05

// History (last N days)
GET /api/exercise/history?days=7

// Stats (last N days)
GET /api/exercise/stats?days=30
```

### Food Logs
```javascript
// Today (default)
GET /api/food-log/daily

// Specific date
GET /api/food-log/daily?date=2024-12-05

// History (last N days)
GET /api/food-log/history?days=7
```

### Dashboard
```javascript
// Today's quick stats
GET /api/dashboard/quick-stats

// Comprehensive data (last N days)
GET /api/dashboard?days=7
GET /api/dashboard?days=30
```

---

## Common Scenarios & Solutions

### Scenario 1: "I logged exercise but don't see it on dashboard"

**Check:**
1. Is exercise logged for TODAY? (Not a past date)
2. Refresh the page (F5)
3. Check browser console for errors
4. Verify token is valid (not expired)

**Debug:**
```javascript
// In browser console
const token = localStorage.getItem('token');
fetch('http://localhost:4000/api/exercise/daily', {
  headers: { token }
})
  .then(r => r.json())
  .then(data => console.log('Today exercise:', data));
```

---

### Scenario 2: "Yesterday's data disappeared"

**Solution:**
Yesterday's data is still there! Query it specifically:

```javascript
const token = localStorage.getItem('token');
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dateStr = yesterday.toISOString().split('T')[0];

// Get yesterday's full dashboard
fetch(`http://localhost:4000/api/dashboard?days=7`, {
  headers: { token }
})
  .then(r => r.json())
  .then(data => {
    const yesterdayData = data.dashboard.daily_data.find(
      day => day.date === dateStr
    );
    console.log('Yesterday data:', yesterdayData);
  });
```

---

### Scenario 3: "Want to see all my data from last month"

**Solution:**
Query the last 30 days:

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:4000/api/dashboard?days=30', {
  headers: { token }
})
  .then(r => r.json())
  .then(data => {
    console.log('30-day summary:', data.dashboard.summary);
    console.log('Daily breakdown:', data.dashboard.daily_data);
    
    // Each day includes:
    // - date
    // - calories_consumed
    // - calories_burned
    // - water_ml
    // - exercise_duration
    // - workouts count
  });
```

---

## Verification Checklist

Use this checklist to confirm everything works:

### ✅ Data Persistence
- [ ] Log water today → Check database → Entry exists
- [ ] Log exercise today → Check database → Entry exists
- [ ] Log food today → Check database → Entry exists
- [ ] Wait 1 day → Query yesterday → Data still exists

### ✅ Dashboard Display
- [ ] Dashboard shows today's water intake
- [ ] Dashboard shows today's exercise minutes
- [ ] Dashboard shows today's calories
- [ ] Auto-refresh works (wait 20 seconds)

### ✅ Manual Refresh
- [ ] Log exercise → Dashboard updates immediately
- [ ] Log water → Dashboard updates immediately
- [ ] Log food → Dashboard updates immediately

### ✅ Historical Access
- [ ] Can query yesterday's data via API
- [ ] Can query last 7 days via API
- [ ] Can query last 30 days via API
- [ ] MongoDB shows all historical entries

---

## Database Cleanup (Only if needed)

If you ever WANT to delete old data (not automatic!):

```javascript
// Delete entries older than 90 days
// Run in backend Node.js environment or MongoDB shell

const deleteOldEntries = async () => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  await WaterIntake.deleteMany({
    date: { $lt: ninetyDaysAgo }
  });

  await ExerciseLog.deleteMany({
    date: { $lt: ninetyDaysAgo }
  });

  await FoodLog.deleteMany({
    date: { $lt: ninetyDaysAgo }
  });
};

// Note: This is MANUAL - never runs automatically
```

---

## Final Notes

### What Happens Automatically
- ✅ Data saved with timestamps
- ✅ Queries filter by date
- ✅ Dashboard auto-refreshes every 20 seconds
- ✅ Manual refresh trigger on data changes

### What NEVER Happens Automatically
- ❌ Data deletion
- ❌ Entry removal
- ❌ Database cleanup
- ❌ Old data expiration

### Your Data is Safe! 🔒
- All entries stored permanently
- Accessible via date queries
- Backed by MongoDB persistence
- No automatic deletion

---

## Support

If you see unexpected behavior:

1. **Check browser console** - Look for JavaScript errors
2. **Check Network tab** - Verify API calls succeed
3. **Check MongoDB** - Confirm data exists
4. **Check token** - Ensure valid authentication

**Debug Script** (paste in browser console):
```javascript
const debugSystem = async () => {
  const token = localStorage.getItem('token');
  
  console.log('🔐 Token:', token ? 'EXISTS' : 'MISSING');
  
  try {
    const today = await fetch('http://localhost:4000/api/dashboard/quick-stats', {
      headers: { token }
    }).then(r => r.json());
    
    console.log('📊 Today Stats:', today);
    
    const week = await fetch('http://localhost:4000/api/dashboard?days=7', {
      headers: { token }
    }).then(r => r.json());
    
    console.log('📅 Week Data:', week.dashboard.daily_data);
    
    return 'All systems operational! ✅';
  } catch (error) {
    console.error('❌ Error:', error);
    return 'System error detected';
  }
};

debugSystem();
```

Your system is working correctly - data persists forever and is only filtered for display! 🎉
