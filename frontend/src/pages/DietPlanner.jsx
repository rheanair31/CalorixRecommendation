import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';
import './DietPlanner.css';

const DietPlanner = () => {
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);
  
  const [cuisines, setCuisines] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });

  const [surpriseMe, setSurpriseMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese',
    'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek',
    'Spanish', 'French', 'Lebanese', 'Turkish', 'Fruit'
  ];

  const toggleCuisine = (meal, cuisine) => {
    if (surpriseMe) return; // Don't allow selection if surprise me is on
    
    setCuisines(prev => {
      const current = prev[meal] || [];
      const updated = current.includes(cuisine)
        ? current.filter(c => c !== cuisine)
        : [...current, cuisine];
      
      return { ...prev, [meal]: updated };
    });
  };

  const selectAllForMeal = (meal) => {
    if (surpriseMe) return;
    setCuisines(prev => ({
      ...prev,
      [meal]: [...cuisineOptions]
    }));
  };

  const clearAllForMeal = (meal) => {
    if (surpriseMe) return;
    setCuisines(prev => ({
      ...prev,
      [meal]: []
    }));
  };

  const handleSurpriseMeToggle = () => {
    setSurpriseMe(!surpriseMe);
    if (!surpriseMe) {
      // Select random cuisines for each meal
      setCuisines({
        breakfast: getRandomCuisines(3),
        lunch: getRandomCuisines(4),
        dinner: getRandomCuisines(4),
        snack: getRandomCuisines(2)
      });
    }
  };

  const getRandomCuisines = (count) => {
    const shuffled = [...cuisineOptions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleGeneratePlan = async () => {
    if (!token) {
      setError('Please login to generate a meal plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get user profile from database
      const profileResponse = await axios.get(`${url}/api/user/profile`, {
        headers: { token }
      });

      if (!profileResponse.data.success || !profileResponse.data.user) {
        setError('Unable to fetch profile. Please try again.');
        setLoading(false);
        return;
      }

      const userProfile = profileResponse.data.user;

      // Check for CRITICAL fields only
      const criticalFields = ['age', 'sex', 'weight_kg', 'height_cm', 'activity_level', 'goal'];
      const missingFields = criticalFields.filter(field => !userProfile[field]);

      if (missingFields.length > 0) {
        setError(`Please complete your profile first. Missing: ${missingFields.join(', ')}`);
        setLoading(false);
        // Only redirect if critical fields are missing
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
        return;
      }

      // Build plan data with user profile + selected cuisines
      const planData = {
        age: userProfile.age,
        sex: userProfile.sex,
        weight_kg: userProfile.weight_kg,
        height_cm: userProfile.height_cm,
        activity_level: userProfile.activity_level,
        goal: userProfile.goal,
        diet_type: userProfile.diet_type || 'Regular',
        allergies: userProfile.allergies || [],
        cuisines: surpriseMe ? {
          breakfast: cuisineOptions,
          lunch: cuisineOptions,
          dinner: cuisineOptions,
          snack: cuisineOptions
        } : cuisines
      };

      console.log('Generating meal plan with data:', planData);

      // Generate meal plan
      const response = await axios.post(
        `${url}/api/meal-plans/generate`,
        planData,
        { headers: { token } }
      );

      console.log('Meal plan response:', response.data);
      console.log('User profile in response:', response.data.userProfile);
      console.log('Meal plan in response:', response.data.mealPlan);

      if (response.data.success) {
        // Navigate to meal plan results with full response data
        navigate('/meal-plan', { 
          state: { 
            mealPlan: response.data  // Pass entire response which contains userProfile and mealPlan
          } 
        });
      } else {
        setError(response.data.message || 'Failed to generate meal plan');
      }
    } catch (err) {
      console.error('Generate plan error:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mealIcons = {
    breakfast: '🍳',
    lunch: '🍱',
    dinner: '🍽️',
    snack: '🍪'
  };

  return (
    <div className="diet-planner-page">
      <div className="section-header">
        <div className="title-wrapper">
          <div className="title-icon">🍽️</div>
          <h1>Generate Your Diet Plan</h1>
        </div>
        <p className="section-subtitle">
          Select your preferred cuisines for each meal or let us surprise you!
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* Surprise Me Option */}
          <div className="surprise-me-section">
            <label className="surprise-me-label">
              <input
                type="checkbox"
                checked={surpriseMe}
                onChange={handleSurpriseMeToggle}
                className="surprise-me-checkbox"
              />
              <span className="surprise-me-text">
                <i className="fas fa-magic"></i> Surprise me with a balanced diet!
              </span>
            </label>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem', marginLeft: '2rem' }}>
              We'll randomly select the best cuisines for you
            </p>
          </div>

          {/* Meal Selections */}
          {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
            <div key={meal} className="meal-section">
              <div className="meal-header">
                <h3 className="meal-title">
                  <span className="meal-icon">{mealIcons[meal]}</span>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  <span className="selection-count">
                    {cuisines[meal].length} selected
                  </span>
                </h3>
                
                {!surpriseMe && (
                  <div className="meal-actions">
                    <button
                      type="button"
                      className="action-btn select-all"
                      onClick={() => selectAllForMeal(meal)}
                    >
                      <i className="fas fa-check-double"></i> Select All
                    </button>
                    <button
                      type="button"
                      className="action-btn clear-all"
                      onClick={() => clearAllForMeal(meal)}
                    >
                      <i className="fas fa-times"></i> Clear All
                    </button>
                  </div>
                )}
              </div>

              <div className="cuisine-grid">
                {cuisineOptions.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    className={`cuisine-pill ${cuisines[meal].includes(cuisine) ? 'selected' : ''} ${surpriseMe ? 'disabled' : ''}`}
                    onClick={() => toggleCuisine(meal, cuisine)}
                    disabled={surpriseMe}
                  >
                    {cuisine}
                    {cuisines[meal].includes(cuisine) && (
                      <i className="fas fa-check-circle" style={{ marginLeft: '0.5rem' }}></i>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Generate Button */}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            {loading && (
              <div style={{ 
                marginBottom: '1.5rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>Generating Your Personalized Meal Plan...</h3>
                <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Analyzing your profile and preferences</p>
                <div style={{ 
                  width: '100%',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2px',
                  marginTop: '1rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '60%',
                    height: '100%',
                    background: 'white',
                    borderRadius: '2px',
                    animation: 'loading 1.5s ease-in-out infinite'
                  }}></div>
                </div>
              </div>
            )}
            <button
              onClick={handleGeneratePlan}
              className="btn btn-primary btn-lg generate-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.75rem' }}></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-magic" style={{ marginRight: '0.75rem' }}></i>
                  Generate My Diet Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlanner;
