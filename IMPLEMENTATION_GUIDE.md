# Calorix Recommendation - Diet & Health Tracking System

A comprehensive diet recommendation and health tracking system with meal planning, calorie tracking, water intake monitoring, and exercise logging.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Secure registration and login with JWT
- ✅ **Diet Plan Generation** - AI-powered meal plans based on user profile
- ✅ **Food Recognition & Logging** - Track daily calorie intake
- ✅ **Water Intake Tracking** - Monitor daily hydration goals
- ✅ **Exercise Logging** - Track workouts and calories burned
- ✅ **Comprehensive Dashboard** - View all health metrics in one place

### Dashboard Insights
- Calorie adherence tracking (days on/over/under target)
- Exercise frequency and consistency
- Water intake goal achievement
- Macro nutrient breakdown
- Streak tracking for goal adherence
- 7, 14, or 30-day historical views

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **MongoDB** (Mongoose) - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** + **Vite** - UI framework
- **React Router** - Navigation
- **React Bootstrap** - UI components
- **Axios** - API requests

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create/update `.env` file:
```env
JWT_SECRET="your_secret_key_here"
PORT=4000
```

4. Update database connection in `config/db.js` with your MongoDB URI (if needed)

5. Start the server:
```bash
npm run server
```

The server will start on `http://localhost:4000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 25,
  "weight_kg": 70,
  "height_cm": 175,
  "activity_level": "moderate",
  "goal": "lose_weight",
  "daily_water_goal_ml": 3000
}
```

### Meal Plan Endpoints

#### Generate Meal Plan
```http
POST /api/meal-plans/generate
Content-Type: application/json

{
  "age": 25,
  "sex": "male",
  "weight_kg": 70,
  "height_cm": 175,
  "activity_level": "moderate",
  "goal": "lose_weight",
  "diet_type": "Regular",
  "allergies": ["peanuts"],
  "cuisines": {
    "breakfast": ["American", "French"],
    "lunch": ["Italian", "Indian"],
    "dinner": ["Chinese", "Mexican"],
    "snack": ["Greek", "Japanese"]
  }
}
```

#### Save Meal Plan
```http
POST /api/meal-plans/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "userProfile": {...},
  "mealPlan": {...}
}
```

#### Get Saved Meal Plans
```http
GET /api/meal-plans/saved
Authorization: Bearer <token>
```

### Water Intake Endpoints

#### Log Water Intake
```http
POST /api/water-intake
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount_ml": 500,
  "date": "2025-01-15"
}
```

#### Get Daily Water Intake
```http
GET /api/water-intake/daily?date=2025-01-15
Authorization: Bearer <token>
```

#### Get Water Intake History
```http
GET /api/water-intake/history?days=7
Authorization: Bearer <token>
```

### Exercise Endpoints

#### Log Exercise
```http
POST /api/exercise
Authorization: Bearer <token>
Content-Type: application/json

{
  "exercise_type": "running",
  "duration_minutes": 30,
  "intensity": "moderate",
  "date": "2025-01-15",
  "notes": "Morning run"
}
```

**Available exercise types:**
- running, walking, cycling, swimming
- gym_workout, yoga, pilates, dancing
- sports, hiit, weightlifting, cardio, other

**Intensity levels:**
- light, moderate, intense

#### Get Daily Exercise
```http
GET /api/exercise/daily?date=2025-01-15
Authorization: Bearer <token>
```

#### Get Exercise History
```http
GET /api/exercise/history?days=7
Authorization: Bearer <token>
```

#### Get Exercise Statistics
```http
GET /api/exercise/stats?days=30
Authorization: Bearer <token>
```

### Food Log Endpoints

#### Log Food
```http
POST /api/food-log
Authorization: Bearer <token>
Content-Type: application/json

{
  "meal_type": "breakfast",
  "food_name": "Oatmeal with berries",
  "calories": 350,
  "protein_g": 12,
  "carbs_g": 55,
  "fat_g": 10,
  "fiber_g": 8,
  "serving_size": "1 bowl",
  "date": "2025-01-15"
}
```

#### Get Daily Food Log
```http
GET /api/food-log/daily?date=2025-01-15
Authorization: Bearer <token>
```

#### Get Food Log History
```http
GET /api/food-log/history?days=7
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Comprehensive Dashboard
```http
GET /api/dashboard?days=7
Authorization: Bearer <token>
```

**Response includes:**
- Daily calorie adherence (on/over/under target)
- Exercise statistics and frequency
- Water intake tracking
- Current and maximum streaks
- Averages for all metrics

#### Get Quick Stats (Today's Summary)
```http
GET /api/dashboard/quick-stats
Authorization: Bearer <token>
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

The token is returned upon successful login or registration.

## 💡 Usage Flow

### For New Users

1. **Register** - Create an account
2. **Login** - Get authentication token
3. **Complete Profile** - Add age, weight, height, goals, etc.
4. **Generate Meal Plan** - Get personalized diet recommendations
5. **Track Daily**:
   - Log meals and calories
   - Log water intake
   - Log workouts
6. **View Dashboard** - Monitor progress and adherence

### Daily Tracking Workflow

1. **Morning**:
   - Log breakfast
   - Add water intake
   - Check quick stats

2. **Throughout Day**:
   - Log lunch, snacks, dinner
   - Log water after each drink
   - Log any exercise/workouts

3. **Evening**:
   - View dashboard for daily summary
   - Check calorie adherence
   - Review progress and streaks

## 📊 Data Models

### User Profile
- Personal info (name, email, password)
- Physical stats (age, sex, weight, height)
- Goals and preferences (activity level, diet goal, diet type)
- Targets (daily calories, water goal)

### Meal Plan
- User profile data
- Daily calorie and macro targets
- Meal options (breakfast, lunch, dinner, snacks)
- Seasonal recommendations

### Food Log
- Date and meal type
- Food name and serving size
- Calories and macros (protein, carbs, fat, fiber)

### Exercise Log
- Date and exercise type
- Duration and intensity
- Calculated calories burned

### Water Intake
- Date and time
- Amount (in ml)

## 🧮 Calculations

### BMR (Basal Metabolic Rate)
Using Mifflin-St Jeor Equation:
- **Male**: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- **Female**: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

### TDEE (Total Daily Energy Expenditure)
BMR × Activity Multiplier:
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Active: 1.725
- Very Active: 1.9

### Goal Adjustments
- Lose Weight: TDEE - 500 calories
- Maintain Weight: TDEE
- Gain Weight: TDEE + 300 calories

### Exercise Calories
Calories = MET × weight(kg) × duration(hours)

MET values vary by exercise type and intensity.

## 🎯 Roadmap

### Completed
- [x] User authentication system
- [x] Diet plan generation with calorie/macro calculation
- [x] Water intake tracking
- [x] Exercise logging with calorie burn estimation
- [x] Food logging
- [x] Comprehensive dashboard

### Optional Enhancements
- [ ] Weight tracking over time
- [ ] Sleep tracking
- [ ] Mood/energy check-ins
- [ ] Weekly summary reports
- [ ] Goal progress notifications
- [ ] Social features (share progress)
- [ ] Barcode scanning for food
- [ ] Integration with fitness wearables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is for educational purposes.

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
- Change the port in backend `.env` file or frontend `vite.config.js`

**Database connection failed**
- Check MongoDB URI in `config/db.js`
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify database credentials

**JWT errors**
- Ensure JWT_SECRET is set in `.env`
- Check token is being sent in headers
- Verify token hasn't expired

**CORS errors**
- Backend and frontend must be running on different ports
- CORS is already configured in server.js

## 📧 Support

For issues and questions:
- Check the documentation above
- Review the code comments
- Check console logs for error messages

---

**Built with ❤️ for healthy living**
