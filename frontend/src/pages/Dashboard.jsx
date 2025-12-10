import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { StoreContext } from '../context/StoreContext';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

const Dashboard = () => {
  const { token } = useContext(StoreContext);
  const { refreshTrigger } = useDashboardRefresh();
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    calories: { current: 0, target: 2000 },
    protein: { current: 0, target: 120 },
    water: { current: 0, target: 8 },
    exercise: { current: 0, target: 30 }
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [trends, setTrends] = useState({
    calories: { change: 0, isIncrease: false },
    water: { change: 0, isIncrease: false },
    exercise: { change: 0, isIncrease: false }
  });

  useEffect(() => {
    if (token) {
      console.log('🔄 Dashboard fetching data... (trigger:', refreshTrigger, ')');
      fetchDashboardData();
    }
  }, [token, refreshTrigger]);

  useEffect(() => {
    if (!token) return;

    const intervalId = setInterval(() => {
      console.log('⏰ Auto-refreshing dashboard (20s interval)');
      fetchDashboardData();
    }, 20000);

    return () => clearInterval(intervalId);
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Fetching dashboard data...');
      
      const dashboardResponse = await axios.get(`${url}/api/dashboard?days=7`, {
        headers: { token }
      });

      const quickStatsResponse = await axios.get(`${url}/api/dashboard/quick-stats`, {
        headers: { token }
      });

      const foodLogsResponse = await axios.get(`${url}/api/food-log/daily`, {
        headers: { token }
      });

      const exerciseLogsResponse = await axios.get(`${url}/api/exercise/daily`, {
        headers: { token }
      });

      console.log('📈 Dashboard responses:', {
        dashboard: dashboardResponse.data.success,
        quickStats: quickStatsResponse.data.success,
        foodLogs: foodLogsResponse.data.success,
        exerciseLogs: exerciseLogsResponse.data.success
      });

      if (dashboardResponse.data.success && quickStatsResponse.data.success) {
        const dashboard = dashboardResponse.data.dashboard;
        const todayStats = quickStatsResponse.data.today;
        
        setDashboardData(dashboard);

        const todayProtein = foodLogsResponse.data.success 
          ? foodLogsResponse.data.entries.reduce((sum, log) => sum + (log.protein_g || 0), 0)
          : 0;

        const todayExerciseDuration = exerciseLogsResponse.data.success
          ? exerciseLogsResponse.data.entries.reduce((sum, log) => sum + (log.duration_minutes || 0), 0)
          : 0;

        console.log('💪 Exercise data:', {
          exerciseLogs: exerciseLogsResponse.data.entries?.length || 0,
          totalDuration: todayExerciseDuration,
          logs: exerciseLogsResponse.data.entries
        });

        setStats({
          calories: {
            current: todayStats.calories_consumed || 0,
            target: todayStats.target_calories || 2000
          },
          protein: {
            current: Math.round(todayProtein),
            target: 120
          },
          water: {
            current: Math.round((todayStats.water_ml || 0) / 250),
            target: Math.round((todayStats.water_goal_ml || 2000) / 250)
          },
          exercise: {
            current: todayExerciseDuration,
            target: 30
          }
        });

        console.log('✅ Stats updated:', {
          calories: todayStats.calories_consumed,
          protein: Math.round(todayProtein),
          water: Math.round((todayStats.water_ml || 0) / 250),
          exercise: todayExerciseDuration
        });

        const dailyData = dashboard.daily_data;
        if (dailyData.length >= 6) {
          const recent3Days = dailyData.slice(-3);
          const previous3Days = dailyData.slice(-6, -3);

          const recentAvgCalories = recent3Days.reduce((sum, day) => sum + day.calories_consumed, 0) / 3;
          const previousAvgCalories = previous3Days.reduce((sum, day) => sum + day.calories_consumed, 0) / 3;
          const caloriesChange = Math.abs(Math.round(((recentAvgCalories - previousAvgCalories) / previousAvgCalories) * 100));

          const recentAvgWater = recent3Days.reduce((sum, day) => sum + day.water_ml, 0) / 3;
          const previousAvgWater = previous3Days.reduce((sum, day) => sum + day.water_ml, 0) / 3;
          const waterChange = Math.abs(Math.round(((recentAvgWater - previousAvgWater) / previousAvgWater) * 100));

          const recentAvgExercise = recent3Days.reduce((sum, day) => sum + day.exercise_duration, 0) / 3;
          const previousAvgExercise = previous3Days.reduce((sum, day) => sum + day.exercise_duration, 0) / 3;
          const exerciseChange = Math.abs(Math.round(((recentAvgExercise - previousAvgExercise) / previousAvgExercise) * 100));

          setTrends({
            calories: {
              change: isFinite(caloriesChange) ? caloriesChange : 0,
              isIncrease: recentAvgCalories > previousAvgCalories
            },
            water: {
              change: isFinite(waterChange) ? waterChange : 0,
              isIncrease: recentAvgWater > previousAvgWater
            },
            exercise: {
              change: isFinite(exerciseChange) ? exerciseChange : 0,
              isIncrease: recentAvgExercise > previousAvgExercise
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTrendText = (key) => {
    const trend = trends[key];
    if (trend.change === 0) return '';
    
    const texts = {
      calories: trend.isIncrease ? 'eating more' : 'eating less',
      water: trend.isIncrease ? 'drinking more' : 'drinking less',
      exercise: trend.isIncrease ? 'exercising more' : 'exercising less'
    };
    
    return `${trend.change}% ${texts[key]} than last 3 days`;
  };

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#3498db' }}></i>
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-icon">👋</div>
          <h1>Welcome{dashboardData?.user?.name ? `, ${dashboardData.user.name}` : ''}</h1>
        </div>
        <p className="dashboard-subtitle">
          Track your nutrition, stay hydrated, and reach your fitness goals
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card calories">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-fire"></i>
            </div>
            <div className="stat-value">
              <div className="stat-number">{stats.calories.current}</div>
              <div className="stat-label">Calories Today</div>
            </div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${calculatePercentage(stats.calories.current, stats.calories.target)}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>{stats.calories.current} kcal</span>
              <span>{stats.calories.target} kcal goal</span>
            </div>
            {trends.calories.change > 0 && (
              <div className="trend-text" style={{ 
                color: trends.calories.isIncrease ? '#e74c3c' : '#27ae60',
                fontSize: '0.85rem',
                marginTop: '0.5rem'
              }}>
                <i className={`fas fa-${trends.calories.isIncrease ? 'arrow-up' : 'arrow-down'}`}></i> {getTrendText('calories')}
              </div>
            )}
          </div>
        </div>

        <div className="stat-card protein">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-dumbbell"></i>
            </div>
            <div className="stat-value">
              <div className="stat-number">{stats.protein.current}g</div>
              <div className="stat-label">Protein Today</div>
            </div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${calculatePercentage(stats.protein.current, stats.protein.target)}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>{stats.protein.current}g</span>
              <span>{stats.protein.target}g goal</span>
            </div>
          </div>
        </div>

        <div className="stat-card water">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-tint"></i>
            </div>
            <div className="stat-value">
              <div className="stat-number">{stats.water.current}</div>
              <div className="stat-label">Water Glasses</div>
            </div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${calculatePercentage(stats.water.current, stats.water.target)}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>{stats.water.current} glasses</span>
              <span>{stats.water.target} glasses goal</span>
            </div>
            {trends.water.change > 0 && (
              <div className="trend-text" style={{ 
                color: trends.water.isIncrease ? '#27ae60' : '#e74c3c',
                fontSize: '0.85rem',
                marginTop: '0.5rem'
              }}>
                <i className={`fas fa-${trends.water.isIncrease ? 'arrow-up' : 'arrow-down'}`}></i> {getTrendText('water')}
              </div>
            )}
          </div>
        </div>

        <div className="stat-card exercise">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-running"></i>
            </div>
            <div className="stat-value">
              <div className="stat-number">{stats.exercise.current}</div>
              <div className="stat-label">Exercise (min)</div>
            </div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${calculatePercentage(stats.exercise.current, stats.exercise.target)}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>{stats.exercise.current} min</span>
              <span>{stats.exercise.target} min goal</span>
            </div>
            {trends.exercise.change > 0 && (
              <div className="trend-text" style={{ 
                color: trends.exercise.isIncrease ? '#27ae60' : '#e74c3c',
                fontSize: '0.85rem',
                marginTop: '0.5rem'
              }}>
                <i className={`fas fa-${trends.exercise.isIncrease ? 'arrow-up' : 'arrow-down'}`}></i> {getTrendText('exercise')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/log-food" className="action-card">
          <div className="action-icon">
            <i className="fas fa-utensils"></i>
          </div>
          <h3 className="action-title">Log Meal</h3>
          <p className="action-description">Track your food intake</p>
        </Link>

        <Link to="/water-tracking" className="action-card">
          <div className="action-icon">
            <i className="fas fa-glass-water"></i>
          </div>
          <h3 className="action-title">Log Water</h3>
          <p className="action-description">Stay hydrated</p>
        </Link>

        <Link to="/exercise-logging" className="action-card">
          <div className="action-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <h3 className="action-title">Log Exercise</h3>
          <p className="action-description">Record your activity</p>
        </Link>

        <Link to="/diet-planner" className="action-card">
          <div className="action-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <h3 className="action-title">Get Meal Plan</h3>
          <p className="action-description">Create personalized plan</p>
        </Link>
      </div>

      {/* View Analytics Button */}
      <div style={{ 
        marginTop: '2rem', 
        textAlign: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem' }}>View Detailed Analytics</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
          Track your progress with detailed graphs and insights
        </p>
        <Link 
          to="/analytics" 
          style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            background: 'white',
            color: '#667eea',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
          }}
        >
          <i className="fas fa-chart-bar" style={{ marginRight: '0.5rem' }}></i>
          View Analytics
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
