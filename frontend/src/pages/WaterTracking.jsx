import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './WaterTracking.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';
import { StoreContext } from '../context/StoreContext';

const WaterTracking = () => {
  const { triggerDashboardRefresh } = useDashboardRefresh();
  const { token } = useContext(StoreContext);
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  const [waterGoal, setWaterGoal] = useState(8);
  const [waterIntake, setWaterIntake] = useState(0);
  const [tempGoal, setTempGoal] = useState(8);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      fetchTodayWater();
    }
  }, [token]);

  // Auto-refresh water data every 30 seconds
  useEffect(() => {
    if (!token) return;

    const intervalId = setInterval(() => {
      fetchTodayWater();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [token]);

  const fetchUserProfile = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { token }
      });

      if (response.data.success && response.data.user) {
        const userGoalGlasses = Math.round((response.data.user.daily_water_goal_ml || 2000) / 250);
        setWaterGoal(userGoalGlasses);
        setTempGoal(userGoalGlasses);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTodayWater = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${url}/api/water-intake/daily`, {
        headers: { token }
      });

      if (response.data.success) {
        const data = response.data.data;
        const totalGlasses = Math.round(data.total_ml / 250);
        setWaterIntake(totalGlasses);
        
        const historyItems = data.intakes.map(intake => ({
          id: intake._id,
          amount: Math.round(intake.amount_ml / 250),
          time: new Date(intake.date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          timestamp: intake.date
        }));
        setHistory(historyItems);
      }
    } catch (error) {
      console.error('Error fetching water data:', error);
    }
  };

  const addWater = async (amount = 1) => {
    if (!token) {
      alert('Please login to track water intake');
      return;
    }

    try {
      setLoading(true);
      
      // Optimistic UI update - update immediately
      const newEntry = {
        id: `temp-${Date.now()}`,
        amount: amount,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: new Date().toISOString()
      };
      
      setWaterIntake(prev => prev + amount);
      setHistory(prev => [newEntry, ...prev]);
      
      // Make API call
      const response = await axios.post(
        `${url}/api/water-intake`,
        {
          amount_ml: amount * 250,
          date: new Date().toISOString()
        },
        { headers: { token } }
      );

      if (response.data.success) {
        // Fetch fresh data to sync with database
        await fetchTodayWater();
        // Trigger dashboard refresh
        triggerDashboardRefresh();
      } else {
        // Revert optimistic update on failure
        setWaterIntake(prev => prev - amount);
        setHistory(prev => prev.filter(item => item.id !== newEntry.id));
        alert('Failed to log water. Please try again.');
      }
    } catch (error) {
      console.error('Error adding water:', error);
      // Revert optimistic update on error
      await fetchTodayWater();
      alert('Failed to log water. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeWater = async (amount = 1) => {
    if (!token) return;

    if (history.length > 0) {
      await removeHistoryItem(history[0].id);
    }
  };

  const updateGoal = async () => {
    if (tempGoal > 0 && tempGoal <= 20) {
      setWaterGoal(tempGoal);
      
      // Save to user profile
      if (token) {
        try {
          const goalInMl = tempGoal * 250;
          await axios.put(
            `${url}/api/user/profile`,
            { daily_water_goal_ml: goalInMl },
            { headers: { token } }
          );
          triggerDashboardRefresh();
        } catch (error) {
          console.error('Error updating water goal:', error);
        }
      }
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your water history?')) {
      return;
    }

    if (!token) return;

    try {
      for (const item of history) {
        await axios.delete(`${url}/api/water-intake/${item.id}`, {
          headers: { token }
        });
      }
      await fetchTodayWater();
      triggerDashboardRefresh();
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history. Please try again.');
    }
  };

  const removeHistoryItem = async (id) => {
    if (!token) return;

    try {
      const response = await axios.delete(`${url}/api/water-intake/${id}`, {
        headers: { token }
      });

      if (response.data.success) {
        await fetchTodayWater();
        triggerDashboardRefresh();
      }
    } catch (error) {
      console.error('Error removing water entry:', error);
      alert('Failed to remove entry. Please try again.');
    }
  };

  const calculatePercentage = () => {
    return Math.min((waterIntake / waterGoal) * 100, 100);
  };

  if (!token) {
    return (
      <div className="water-tracking-page">
        <div className="page-header">
          <div className="header-icon">
            <i className="fas fa-tint"></i>
          </div>
          <h1>Water Tracking</h1>
          <p className="page-subtitle">Please login to track your water intake</p>
        </div>
        <div style={{
          background: '#fff3cd',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          margin: '2rem auto',
          maxWidth: '500px'
        }}>
          <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#856404', marginBottom: '1rem' }}></i>
          <p style={{ color: '#856404', fontSize: '1.1rem' }}>
            You need to be logged in to track your water intake and save data to the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="water-tracking-page">
      <div className="page-header">
        <div className="header-icon">
          <i className="fas fa-tint"></i>
        </div>
        <h1>Water Tracking</h1>
        <p className="page-subtitle">Stay hydrated and reach your daily water goal</p>
      </div>

      <div className="water-card">
        <div className="water-goal-section">
          <h3>Daily Water Goal</h3>
          <div className="goal-input-group">
            <label htmlFor="water-goal">Goal:</label>
            <input
              id="water-goal"
              type="number"
              className="goal-input"
              min="1"
              max="20"
              value={tempGoal}
              onChange={(e) => setTempGoal(Number(e.target.value))}
            />
            <span className="goal-unit">glasses</span>
            <button className="update-goal-btn" onClick={updateGoal}>
              <i className="fas fa-check"></i>
              Update Goal
            </button>
          </div>
        </div>

        <div className="progress-display">
          <div className="water-glass-visual">
            <div 
              className="water-level" 
              style={{ height: `${calculatePercentage()}%` }}
            >
              {waterIntake > 0 && `${Math.round(calculatePercentage())}%`}
            </div>
          </div>
          <div className="progress-text">
            {waterIntake} / {waterGoal} glasses
          </div>
          <div className="progress-subtext">
            {waterIntake >= waterGoal 
              ? "🎉 Goal achieved!" 
              : `${waterGoal - waterIntake} more to go`}
          </div>
        </div>

        <div className="water-controls">
          <button 
            className="water-btn remove" 
            onClick={() => removeWater()}
            disabled={waterIntake === 0 || loading}
            aria-label="Remove one glass"
          >
            <i className="fas fa-minus"></i>
          </button>
          <button 
            className="water-btn add" 
            onClick={() => addWater()}
            disabled={loading}
            aria-label="Add one glass"
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
          </button>
        </div>

        <div className="quick-add-section">
          <h3>Quick Add</h3>
          <div className="quick-add-buttons">
            <button 
              className="quick-add-btn" 
              onClick={() => addWater(2)}
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
              Add 2 Glasses
            </button>
            <button 
              className="quick-add-btn" 
              onClick={() => addWater(3)}
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
              Add 3 Glasses
            </button>
            <button 
              className="quick-add-btn" 
              onClick={() => addWater(waterGoal - waterIntake)}
              disabled={loading || waterIntake >= waterGoal}
            >
              <i className="fas fa-fill"></i>
              Fill to Goal
            </button>
          </div>
        </div>
      </div>

      <div className="water-history">
        <div className="history-header">
          <h2>
            <i className="fas fa-history"></i>
            Today's History
          </h2>
          {history.length > 0 && (
            <button className="clear-history-btn" onClick={clearHistory} disabled={loading}>
              <i className="fas fa-trash-alt"></i>
              Clear History
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-info">
                  <div className="history-icon">
                    <i className="fas fa-tint"></i>
                  </div>
                  <div className="history-details">
                    <span className="history-amount">
                      {item.amount} {item.amount === 1 ? 'glass' : 'glasses'}
                    </span>
                    <span className="history-time">{item.time}</span>
                  </div>
                </div>
                <button 
                  className="history-item-action"
                  onClick={() => removeHistoryItem(item.id)}
                  aria-label="Remove entry"
                  disabled={loading}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-history">
            <div className="empty-history-icon">
              <i className="fas fa-tint"></i>
            </div>
            <p className="empty-history-text">
              No water logged yet today. Start tracking your hydration!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterTracking;
