import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { StoreContext } from '../context/StoreContext';
import './Analytics.css';

const Analytics = () => {
  const { token } = useContext(StoreContext);
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7); // 7, 14, or 30 days
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (token) {
      fetchAnalyticsData();
    }
  }, [token, timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${url}/api/dashboard?days=${timeframe}`, {
        headers: { token }
      });

      if (response.data.success) {
        const dashboardData = response.data.dashboard;
        
        // Format data for charts
        const chartData = dashboardData.daily_data.map(day => ({
          date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          calories: Math.round(day.calories_consumed),
          caloriesBurned: Math.round(day.calories_burned),
          netCalories: Math.round(day.net_calories),
          water: Math.round(day.water_ml / 250), // Convert to glasses
          waterGoal: Math.round(day.water_goal_ml / 250),
          exercise: Math.round(day.exercise_duration),
          protein: Math.round(day.protein_g),
          carbs: Math.round(day.carbs_g),
          fat: Math.round(day.fat_g),
          workouts: day.workouts
        }));

        setData(chartData);
        setSummary(dashboardData.summary);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="analytics-empty">
        <i className="fas fa-lock"></i>
        <h2>Please Login</h2>
        <p>You need to be logged in to view analytics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading your analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <div className="header-title">
            <i className="fas fa-chart-line"></i>
            <h1>Your Analytics</h1>
          </div>
          <p>Track your health and fitness progress over time</p>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="timeframe-selector">
        {[7, 14, 30].map(days => (
          <button
            key={days}
            onClick={() => setTimeframe(days)}
            className={`timeframe-btn ${timeframe === days ? 'active' : ''}`}
          >
            {days} Days
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="summary-card card-1">
            <div className="card-icon">🔥</div>
            <h3>Calorie Adherence</h3>
            <div className="card-value">{summary.adherence_percentage}%</div>
            <p>{summary.days_on_target} of {timeframe} days on target</p>
          </div>

          <div className="summary-card card-2">
            <div className="card-icon">💧</div>
            <h3>Hydration Goal</h3>
            <div className="card-value">{summary.water_goal_percentage}%</div>
            <p>{summary.days_water_goal_met} days met water goal</p>
          </div>

          <div className="summary-card card-3">
            <div className="card-icon">💪</div>
            <h3>Workout Frequency</h3>
            <div className="card-value">{summary.workout_frequency_percentage}%</div>
            <p>{summary.total_workout_days} workout days</p>
          </div>

          <div className="summary-card card-4">
            <div className="card-icon">🔥</div>
            <h3>Current Streak</h3>
            <div className="card-value">{summary.current_streak} days</div>
            <p>Best: {summary.max_streak} days</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="charts-container">
        
        {/* Calorie Intake Chart */}
        <div className="chart-card">
          <h2>
            <i className="fas fa-fire"></i>
            Calorie Intake & Burn
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="calories" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorCalories)" 
                name="Calories Consumed"
              />
              <Area 
                type="monotone" 
                dataKey="caloriesBurned" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorBurned)" 
                name="Calories Burned"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Water Intake Chart */}
        <div className="chart-card">
          <h2>
            <i className="fas fa-tint"></i>
            Water Intake (Glasses)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="water" fill="#3b82f6" name="Water Consumed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="waterGoal" fill="#e2e8f0" name="Goal" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exercise Duration Chart */}
        <div className="chart-card">
          <h2>
            <i className="fas fa-running"></i>
            Exercise Duration (Minutes)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="exercise" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 6 }}
                name="Exercise Minutes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Macronutrients Chart */}
        <div className="chart-card">
          <h2>
            <i className="fas fa-chart-pie"></i>
            Macronutrients (Grams)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="protein" 
                stackId="1"
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                name="Protein"
              />
              <Area 
                type="monotone" 
                dataKey="carbs" 
                stackId="1"
                stroke="#f59e0b" 
                fill="#f59e0b" 
                name="Carbs"
              />
              <Area 
                type="monotone" 
                dataKey="fat" 
                stackId="1"
                stroke="#ef4444" 
                fill="#ef4444" 
                name="Fat"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Workout Frequency Chart */}
        <div className="chart-card">
          <h2>
            <i className="fas fa-heartbeat"></i>
            Workout Frequency
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="workouts" 
                fill="#ec4899" 
                name="Number of Workouts" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
