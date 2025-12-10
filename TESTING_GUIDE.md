# QUICK TESTING GUIDE

## 🧪 Test the Backend APIs with curl or Postman

### Step 1: Start the Server
```bash
cd backend
npm run server
```

You should see the welcome message with all endpoints listed.

---

## Test Sequence

### 1. Register a New User
```bash
curl -X POST http://localhost:4000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

**Save the token** - you'll need it for authenticated requests!

---

### 2. Login (if you already have an account)
```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

### 3. Update User Profile
Replace `YOUR_TOKEN` with the token from step 1:

```bash
curl -X PUT http://localhost:4000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "age": 25,
    "sex": "male",
    "weight_kg": 70,
    "height_cm": 175,
    "activity_level": "moderate",
    "goal": "lose_weight",
    "diet_type": "Regular",
    "daily_water_goal_ml": 3000
  }'
```

---

### 4. Generate a Meal Plan
```bash
curl -X POST http://localhost:4000/api/meal-plans/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "age": 25,
    "sex": "male",
    "weight_kg": 70,
    "height_cm": 175,
    "activity_level": "moderate",
    "goal": "lose_weight",
    "diet_type": "Regular",
    "allergies": [],
    "cuisines": {
      "breakfast": ["American", "French"],
      "lunch": ["Italian", "Indian"],
      "dinner": ["Chinese", "Mexican"],
      "snack": ["Greek"]
    }
  }'
```

**You should see:**
- Calculated daily calorie target
- Macro breakdown (protein, carbs, fat)
- Meal options for breakfast, lunch, dinner, snack

---

### 5. Log Water Intake
```bash
curl -X POST http://localhost:4000/api/water-intake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount_ml": 500,
    "date": "2025-01-15"
  }'
```

---

### 6. Log Exercise
```bash
curl -X POST http://localhost:4000/api/exercise \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "exercise_type": "running",
    "duration_minutes": 30,
    "intensity": "moderate",
    "date": "2025-01-15",
    "notes": "Morning run"
  }'
```

**You should see:**
- The exercise logged
- **Automatically calculated calories burned**

---

### 7. Log Food
```bash
curl -X POST http://localhost:4000/api/food-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "meal_type": "breakfast",
    "food_name": "Oatmeal with berries",
    "calories": 350,
    "protein_g": 12,
    "carbs_g": 55,
    "fat_g": 10,
    "fiber_g": 8,
    "date": "2025-01-15"
  }'
```

---

### 8. Get Today's Quick Stats
```bash
curl -X GET http://localhost:4000/api/dashboard/quick-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**You should see:**
- Today's total calories consumed
- Calories burned from exercise
- Net calories
- Remaining calories for the day
- Water intake progress
- Number of workouts

---

### 9. Get Comprehensive Dashboard
```bash
curl -X GET "http://localhost:4000/api/dashboard?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**You should see:**
- 7-day summary
- Calorie adherence statistics
- Exercise frequency
- Water intake goals
- Daily breakdown for each day

---

## 🔥 Quick Test with Multiple Entries

Add more data to see the dashboard in action:

```bash
# Add more water
curl -X POST http://localhost:4000/api/water-intake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount_ml": 250}'

curl -X POST http://localhost:4000/api/water-intake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount_ml": 500}'

# Add lunch
curl -X POST http://localhost:4000/api/food-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "meal_type": "lunch",
    "food_name": "Grilled chicken salad",
    "calories": 450,
    "protein_g": 35,
    "carbs_g": 20,
    "fat_g": 25
  }'

# Add dinner
curl -X POST http://localhost:4000/api/food-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "meal_type": "dinner",
    "food_name": "Salmon with vegetables",
    "calories": 550,
    "protein_g": 40,
    "carbs_g": 35,
    "fat_g": 25
  }'

# Add evening exercise
curl -X POST http://localhost:4000/api/exercise \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "exercise_type": "gym_workout",
    "duration_minutes": 45,
    "intensity": "intense"
  }'
```

Now check the dashboard again - you'll see all your data aggregated!

---

## 📊 Testing with Postman (Recommended)

1. **Import into Postman:**
   - Create a new collection called "Calorix Recommendation"
   - Add all the endpoints above
   - Use environment variables for token and baseURL

2. **Set up Environment Variables:**
   - `baseURL`: `http://localhost:4000`
   - `token`: (set after login)

3. **Test Flow:**
   - Register → Save token
   - Update profile
   - Generate meal plan
   - Log food, water, exercise throughout "day"
   - Check dashboard

---

## 🐛 Common Issues & Solutions

### Issue: "Not authorized" error
**Solution:** Make sure you're including the token:
```
Authorization: Bearer YOUR_ACTUAL_TOKEN_HERE
```

### Issue: "User not found" error
**Solution:** Register first, then use that account's token

### Issue: Port already in use
**Solution:** Change port in backend/.env or kill the process using that port

### Issue: Database connection failed
**Solution:** Check MongoDB URI in config/db.js

### Issue: "Route not found"
**Solution:** Make sure server is running and you're using the correct endpoint

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ You can register and login successfully
2. ✅ Meal plan shows calculated calories (not just mock data)
3. ✅ Exercise log shows **auto-calculated calories burned**
4. ✅ Dashboard shows your tracked data
5. ✅ Quick stats shows today's summary
6. ✅ No errors in server console
7. ✅ All API calls return `"success": true`

---

## 🎯 Expected Calculations

### For a 25-year-old male, 70kg, 175cm, moderate activity, weight loss goal:

**BMR:** ~1,660 calories
**TDEE:** ~2,573 calories  
**Adjusted for weight loss:** ~2,073 calories/day

**Macros:**
- Protein: ~180g (35% of calories)
- Carbs: ~155g (30% of calories)
- Fat: ~80g (35% of calories)

**Exercise calories burned (30min moderate running, 70kg):**
~294 calories

If you see numbers like these, the calculations are working correctly!

---

## 📝 Testing Checklist

- [ ] Server starts without errors
- [ ] Can register new user
- [ ] Can login and receive token
- [ ] Can update profile
- [ ] Meal plan generates with real calculations
- [ ] Can log water intake
- [ ] Can log exercise (with auto-calculated calories)
- [ ] Can log food
- [ ] Dashboard shows aggregated data
- [ ] Quick stats show today's data
- [ ] Can view history for water, exercise, food
- [ ] All protected routes work with token
- [ ] All protected routes reject without token

---

## 🚀 Ready for Frontend Integration

Once all backend tests pass, you can start integrating with the frontend!

The frontend needs to:
1. Store the JWT token (localStorage)
2. Include token in all authenticated requests
3. Update the meal plan endpoint to use port 4000
4. Create new pages for dashboard, water tracking, exercise logging

Refer to **IMPLEMENTATION_GUIDE.md** for detailed API documentation!
