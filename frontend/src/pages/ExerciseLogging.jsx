import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './ExerciseLogging.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';
import { StoreContext } from '../context/StoreContext';

const ExerciseLogging = () => {
  const { triggerDashboardRefresh } = useDashboardRefresh();
  const { token } = useContext(StoreContext);
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  const [exercises, setExercises] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    duration: '',
    intensity: 'moderate',
    caloriesBurned: '',
    notes: ''
  });

  const exerciseTypes = [
    { label: 'Running', value: 'running' },
    { label: 'Walking', value: 'walking' },
    { label: 'Cycling', value: 'cycling' },
    { label: 'Swimming', value: 'swimming' },
    { label: 'Weight Training', value: 'weightlifting' },
    { label: 'Yoga', value: 'yoga' },
    { label: 'HIIT', value: 'hiit' },
    { label: 'Sports', value: 'sports' },
    { label: 'Dancing', value: 'dancing' },
    { label: 'Gym Workout', value: 'gym_workout' },
    { label: 'Cardio', value: 'cardio' },
    { label: 'Other', value: 'other' }
  ];

  useEffect(() => {
    if (token) {
      fetchTodayExercises();
    }
  }, [token]);

  const fetchTodayExercises = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${url}/api/exercise/daily`, {
        headers: { token }
      });

      if (response.data.success) {
        const exerciseLogs = response.data.entries.map(ex => ({
          id: ex._id,
          type: ex.exercise_type,
          duration: ex.duration_minutes,
          intensity: ex.intensity || 'medium',
          caloriesBurned: ex.calories_burned,
          notes: ex.notes || '',
          date: new Date(ex.date).toLocaleDateString(),
          time: new Date(ex.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }));
        setExercises(exerciseLogs);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Please login to log exercises');
      return;
    }

    if (!formData.type || !formData.duration) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const calories = formData.caloriesBurned 
        ? Number(formData.caloriesBurned) 
        : calculateCalories(formData.type, formData.duration, formData.intensity);

      const exerciseData = {
        exercise_type: formData.type,
        duration_minutes: Number(formData.duration),
        intensity: formData.intensity,
        notes: formData.notes,
        date: new Date().toISOString()
      };

      if (isEditing) {
        const response = await axios.put(
          `${url}/api/exercise/${editingId}`,
          exerciseData,
          { headers: { token } }
        );

        if (response.data.success) {
          await fetchTodayExercises();
          triggerDashboardRefresh();
          setIsEditing(false);
          setEditingId(null);
        }
      } else {
        // Optimistic UI update - add immediately
        const newExercise = {
          id: `temp-${Date.now()}`,
          type: formData.type,
          duration: Number(formData.duration),
          intensity: formData.intensity,
          caloriesBurned: calories,
          notes: formData.notes,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        
        setExercises(prev => [newExercise, ...prev]);
        
        const response = await axios.post(
          `${url}/api/exercise`,
          exerciseData,
          { headers: { token } }
        );

        if (response.data.success) {
          await fetchTodayExercises();
          triggerDashboardRefresh();
        } else {
          // Revert on failure
          setExercises(prev => prev.filter(ex => ex.id !== newExercise.id));
          alert('Failed to save exercise. Please try again.');
        }
      }

      resetForm();
    } catch (error) {
      console.error('Error saving exercise:', error);
      await fetchTodayExercises();
      alert('Failed to save exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateCalories = (type, duration, intensity) => {
    const baseCalories = {
      'running': 10,
      'walking': 4,
      'cycling': 8,
      'swimming': 9,
      'weightlifting': 6,
      'yoga': 3,
      'hiit': 12,
      'sports': 8,
      'dancing': 6,
      'gym_workout': 6,
      'cardio': 7,
      'other': 5
    };

    const intensityMultiplier = {
      'light': 0.7,
      'moderate': 1,
      'intense': 1.3
    };

    const base = baseCalories[type] || 5;
    return Math.round(base * duration * intensityMultiplier[intensity]);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      duration: '',
      intensity: 'moderate',
      caloriesBurned: '',
      notes: ''
    });
  };

  const handleEdit = (exercise) => {
    setFormData({
      type: exercise.type,
      duration: exercise.duration.toString(),
      intensity: exercise.intensity,
      caloriesBurned: exercise.caloriesBurned.toString(),
      notes: exercise.notes || ''
    });
    setIsEditing(true);
    setEditingId(exercise.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    if (!token) return;

    try {
      const response = await axios.delete(`${url}/api/exercise/${id}`, {
        headers: { token }
      });

      if (response.data.success) {
        await fetchTodayExercises();
        triggerDashboardRefresh();
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise. Please try again.');
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
    setEditingId(null);
  };

  const getExerciseIcon = (type) => {
    const icons = {
      'running': 'fa-running',
      'walking': 'fa-walking',
      'cycling': 'fa-bicycle',
      'swimming': 'fa-swimming-pool',
      'weightlifting': 'fa-dumbbell',
      'yoga': 'fa-spa',
      'hiit': 'fa-heartbeat',
      'sports': 'fa-basketball-ball',
      'dancing': 'fa-music',
      'gym_workout': 'fa-dumbbell',
      'cardio': 'fa-heartbeat',
      'other': 'fa-running'
    };
    return icons[type] || 'fa-running';
  };

  const getExerciseLabel = (type) => {
    const labels = {
      'running': 'Running',
      'walking': 'Walking',
      'cycling': 'Cycling',
      'swimming': 'Swimming',
      'weightlifting': 'Weight Training',
      'yoga': 'Yoga',
      'hiit': 'HIIT',
      'sports': 'Sports',
      'dancing': 'Dancing',
      'gym_workout': 'Gym Workout',
      'cardio': 'Cardio',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const filteredExercises = exercises.filter(exercise => {
    if (filter === 'all') return true;
    return exercise.intensity === filter;
  });

  if (!token) {
    return (
      <div className="exercise-logging-page">
        <div className="page-header">
          <div className="header-icon">
            <i className="fas fa-running"></i>
          </div>
          <h1>Exercise Logging</h1>
          <p className="page-subtitle">Please login to track your exercises</p>
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
            You need to be logged in to track your exercises and save data to the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="exercise-logging-page">
      <div className="page-header">
        <div className="header-icon">
          <i className="fas fa-running"></i>
        </div>
        <h1>Exercise Logging</h1>
        <p className="page-subtitle">Track your workouts and stay active</p>
      </div>

      <div className="exercise-form-card">
        <h2>{isEditing ? 'Edit Exercise' : 'Log New Exercise'}</h2>
        <form onSubmit={handleSubmit} className="exercise-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Exercise Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select exercise type</option>
                {exerciseTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                max="300"
                required
                className="form-input"
                placeholder="30"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="intensity">Intensity</label>
              <select
                id="intensity"
                name="intensity"
                value={formData.intensity}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="caloriesBurned">Calories Burned (optional)</label>
              <input
                type="number"
                id="caloriesBurned"
                name="caloriesBurned"
                value={formData.caloriesBurned}
                onChange={handleInputChange}
                min="0"
                className="form-input"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-input"
              rows="3"
              placeholder="How did you feel? Any observations?"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {isEditing ? 'Updating...' : 'Logging...'}
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  {isEditing ? 'Update Exercise' : 'Log Exercise'}
                </>
              )}
            </button>
            {isEditing && (
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                <i className="fas fa-times"></i>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="exercise-list-card">
        <div className="list-header">
          <h2>
            <i className="fas fa-history"></i>
            Today's Exercises
          </h2>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'light' ? 'active' : ''}`}
              onClick={() => setFilter('light')}
            >
              Light
            </button>
            <button
              className={`filter-btn ${filter === 'moderate' ? 'active' : ''}`}
              onClick={() => setFilter('moderate')}
            >
              Moderate
            </button>
            <button
              className={`filter-btn ${filter === 'intense' ? 'active' : ''}`}
              onClick={() => setFilter('intense')}
            >
              Intense
            </button>
          </div>
        </div>

        {filteredExercises.length > 0 ? (
          <div className="exercise-list">
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="exercise-item">
                <div className="exercise-info">
                  <div className="exercise-icon-container">
                    <i className={`fas ${getExerciseIcon(exercise.type)}`}></i>
                  </div>
                  <div className="exercise-details">
                    <h4 className="exercise-name">{getExerciseLabel(exercise.type)}</h4>
                    <div className="exercise-meta">
                      <span>
                        <i className="fas fa-clock"></i>
                        {exercise.duration} min
                      </span>
                      <span>
                        <i className="fas fa-fire"></i>
                        {exercise.caloriesBurned} cal
                      </span>
                      <span>
                        <i className="fas fa-calendar"></i>
                        {exercise.date} at {exercise.time}
                      </span>
                      <span className={`intensity-badge ${exercise.intensity}`}>
                        {exercise.intensity}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="exercise-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(exercise)}
                    aria-label="Edit exercise"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(exercise.id)}
                    aria-label="Delete exercise"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-running"></i>
            </div>
            <p className="empty-text">
              {filter === 'all' 
                ? 'No exercises logged yet' 
                : `No ${filter} intensity exercises found`}
            </p>
            <p className="empty-subtext">
              Start tracking your workouts to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLogging;
