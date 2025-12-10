import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUpload, FaTimes, FaUtensils } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FoodLogging.css';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

const FoodLogging = ({ onMealLogged }) => {
  const { triggerDashboardRefresh } = useDashboardRefresh();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [mealtime, setMealtime] = useState('');
  
  const navigate = useNavigate();

  // API base URL - Updated to use port 5001 for the food ML service
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' // Empty for production since they'll be served from the same origin
    : 'http://localhost:5001'; // Updated to port 5001 for the food ML service

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Call the predict endpoint on the new port
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Process the response from the backend
      const foodData = response.data;
      
      // Extract protein, carbs, and fats from the response if available,
      // otherwise use placeholders
      const displayName = foodName || foodData.food.replace(/_/g, ' ');
      
      // Format the result
      setResult({
        foodName: displayName,
        calories: foodData.is_piecewise ? foodData.calories_per_piece : foodData.total_calories,
        protein: foodData.protein || "15g", // Use API value if available
        carbs: foodData.carbs || "30g",     // Use API value if available
        fats: foodData.fats || "10g",       // Use API value if available
        detectedFood: foodData.food.replace(/_/g, ' '),
        isPiecewise: foodData.is_piecewise,
        mealtime: mealtime,
        imageUrl: previewUrl
      });
    } catch (err) {
      setError('Failed to analyze food image. Please try again.');
      console.error('Error details:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFoodName('');
    setMealtime('');
    setResult(null);
    setError(null);
  };

  const handleLogMeal = async () => {
    try {
      // Get token from context or localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to log meals');
        return;
      }

      const mealData = {
        meal_type: result.mealtime || 'snack',
        food_name: result.foodName,
        calories: parseInt(result.calories),
        protein_g: parseFloat(result.protein) || 0,
        carbs_g: parseFloat(result.carbs) || 0,
        fat_g: parseFloat(result.fats) || 0,
        date: new Date().toISOString()
      };

      // Save to database
      const response = await axios.post(
        'http://localhost:4000/api/food-log',
        mealData,
        { headers: { token } }
      );

      if (response.data.success) {
        // Trigger dashboard refresh
        triggerDashboardRefresh();
        
        // Call the parent callback to refresh today's meals
        if (onMealLogged) {
          onMealLogged();
        }
        
        // Reset the form
        handleReset();
        
        // Show success message
        alert('Meal logged successfully!');
      } else {
        setError('Failed to log meal. Please try again.');
      }
    } catch (err) {
      console.error('Error logging meal:', err);
      setError('Failed to log meal. Please try again.');
    }
  };

  return (
    <Card className="food-logging-card">
      <Card.Body>
        <Card.Title className="d-flex align-items-center gap-2">
          <FaUtensils />
          Log Your Food
        </Card.Title>
        
        {!result ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Upload Food Image</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="me-2"
                />
                {previewUrl && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <FaTimes />
                  </Button>
                )}
              </div>
            </Form.Group>

            {previewUrl && (
              <div className="mb-3">
                <div className="image-preview">
                  <img
                    src={previewUrl}
                    alt="Food preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Food Name (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter food name if you want to override detection"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mealtime</Form.Label>
              <Form.Select
                value={mealtime}
                onChange={(e) => setMealtime(e.target.value)}
              >
                <option value="">Select mealtime</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </Form.Select>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !selectedFile}
              className="w-100"
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaUpload className="me-2" />
                  Analyze Food
                </>
              )}
            </Button>
          </Form>
        ) : (
          <div className="analysis-results">
            <h5>Analysis Results</h5>
            <div className="macro-list">
              <li>
                <strong>Food Name:</strong> {result.foodName}
              </li>
              {result.foodName !== result.detectedFood && (
                <li>
                  <strong>Detected Food:</strong> {result.detectedFood}
                </li>
              )}
              <li>
                <strong>Calories:</strong> {result.calories} kcal
                {result.isPiecewise && <span className="text-muted"> (per piece)</span>}
              </li>
              <li>
                <strong>Protein:</strong> {result.protein}
              </li>
              <li>
                <strong>Carbohydrates:</strong> {result.carbs}
              </li>
              <li>
                <strong>Fats:</strong> {result.fats}
              </li>
              {result.mealtime && (
                <li>
                  <strong>Meal:</strong> {result.mealtime.charAt(0).toUpperCase() + result.mealtime.slice(1)}
                </li>
              )}
            </div>
            <div className="d-flex gap-2 mt-4">
              <Button 
                variant="success" 
                className="flex-grow-1"
                onClick={handleLogMeal}
              >
                Log This Meal
              </Button>
              <Button variant="outline-secondary" onClick={handleReset}>
                Try Another
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FoodLogging;
