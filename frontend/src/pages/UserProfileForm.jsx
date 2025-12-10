import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import axios from 'axios';
import './UserProfileForm.css';

const UserProfileForm = () => {
  const navigate = useNavigate();
  const { url, token } = useContext(StoreContext);
  
  const [formData, setFormData] = useState({
    age: '',
    sex: 'male',
    weight_kg: '',
    height_cm: '',
    activity_level: 'moderate',
    goal: 'maintain',
    diet_type: 'Regular',
    allergies: []
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch existing profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${url}/api/user/profile`, {
          headers: { token }
        });

        if (response.data.success && response.data.user) {
          const user = response.data.user;
          
          // Check if profile has data (edit mode)
          if (user.age) {
            setIsEditMode(true);
            setFormData({
              age: user.age || '',
              sex: user.sex || 'male',
              weight_kg: user.weight_kg || '',
              height_cm: user.height_cm || '',
              activity_level: user.activity_level || 'moderate',
              goal: user.goal || 'maintain',
              diet_type: user.diet_type || 'Regular',
              allergies: user.allergies || []
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [token, url]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (allergy) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.age || !formData.weight_kg || !formData.height_cm) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${url}/api/user/profile`,
        formData,
        { headers: { token } }
      );
      
      if (response.data.success) {
        // Mark profile as complete in localStorage
        localStorage.setItem('profileComplete', 'true');
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Failed to save profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-form">
      <div className="section-header">
        <div className="title-wrapper">
          <div className="title-icon">👤</div>
          <h1>{isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}</h1>
        </div>
        <p className="section-subtitle">
          {isEditMode 
            ? 'Update your information to keep recommendations accurate'
            : 'Tell us about yourself to get personalized recommendations'
          }
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-user"></i> Basic Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Age *</label>
                  <input
                    type="number"
                    name="age"
                    className="form-control"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25"
                    min="10"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Sex *</label>
                  <select
                    name="sex"
                    className="form-control"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Weight (kg) *</label>
                  <input
                    type="number"
                    name="weight_kg"
                    className="form-control"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    placeholder="70"
                    min="30"
                    max="200"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Height (cm) *</label>
                  <input
                    type="number"
                    name="height_cm"
                    className="form-control"
                    value={formData.height_cm}
                    onChange={handleChange}
                    placeholder="175"
                    min="100"
                    max="250"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Activity & Goals */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-running"></i> Activity & Goals
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Activity Level *</label>
                  <select
                    name="activity_level"
                    className="form-control"
                    value={formData.activity_level}
                    onChange={handleChange}
                    required
                  >
                    <option value="sedentary">Sedentary (little exercise)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="very_active">Very Active (intense daily)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Goal *</label>
                  <select
                    name="goal"
                    className="form-control"
                    value={formData.goal}
                    onChange={handleChange}
                    required
                  >
                    <option value="lose_weight">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain_weight">Gain Weight</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Diet Preferences */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-leaf"></i> Diet Preferences
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Diet Type *</label>
                <select
                  name="diet_type"
                  className="form-control"
                  value={formData.diet_type}
                  onChange={handleChange}
                  required
                >
                  <option value="Regular">Regular</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Allergies (Optional)</label>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Add any food allergies or restrictions
                </p>
                <div className="allergies-input">
                  {formData.allergies.map((allergy, index) => (
                    <span key={index} className="allergy-tag">
                      {allergy}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                        style={{ 
                          marginLeft: '0.5rem', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          color: '#e74c3c'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy(e)}
                    placeholder="Type and press Enter"
                    style={{ 
                      flex: 1, 
                      border: 'none', 
                      outline: 'none', 
                      minWidth: '120px',
                      padding: '0.5rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{
                  minWidth: '250px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  borderRadius: '50px'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" style={{ marginRight: '0.5rem' }}></span>
                    {isEditMode ? 'Updating Profile...' : 'Saving Profile...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>
                    {isEditMode ? 'Update Profile' : 'Complete Setup & Go to Dashboard'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
