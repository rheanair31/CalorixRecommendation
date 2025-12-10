import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import FoodLogging from '../components/FoodLogging';
import { StoreContext } from '../context/StoreContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './FoodLoggingPage.css';

const FoodLoggingPage = () => {
  const { token } = useContext(StoreContext);
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  const [todayMeals, setTodayMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (token) {
      fetchTodayMeals();
    }
  }, [token, refreshTrigger]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!token) return;

    const intervalId = setInterval(() => {
      fetchTodayMeals();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [token]);

  const fetchTodayMeals = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/food-log/daily`, {
        headers: { token }
      });

      if (response.data.success) {
        const meals = response.data.entries.map(log => ({
          id: log._id,
          meal_type: log.meal_type,
          food_name: log.food_name,
          calories: log.calories,
          protein_g: log.protein_g,
          carbs_g: log.carbs_g,
          fat_g: log.fat_g,
          time: new Date(log.date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          timestamp: log.date
        }));
        setTodayMeals(meals);
      }
    } catch (error) {
      console.error('Error fetching today\'s meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      const response = await axios.delete(`${url}/api/food-log/${id}`, {
        headers: { token }
      });

      if (response.data.success) {
        await fetchTodayMeals();
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal. Please try again.');
    }
  };

  const getMealIcon = (mealType) => {
    const icons = {
      'breakfast': 'fa-coffee',
      'lunch': 'fa-hamburger',
      'dinner': 'fa-utensils',
      'snack': 'fa-cookie'
    };
    return icons[mealType] || 'fa-utensils';
  };

  const getMealColor = (mealType) => {
    const colors = {
      'breakfast': '#fbbf24',
      'lunch': '#10b981',
      'dinner': '#f59e0b',
      'snack': '#8b5cf6'
    };
    return colors[mealType] || '#6366f1';
  };

  const calculateTodayTotals = () => {
    return todayMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein_g || 0),
      carbs: acc.carbs + (meal.carbs_g || 0),
      fat: acc.fat + (meal.fat_g || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTodayTotals();

  return (
    <Container fluid className="food-logging-page" style={{ padding: '2rem 1rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="header-icon" style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          <i className="fas fa-utensils"></i>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Food Logging</h1>
        <p className="page-subtitle" style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Track your meals and monitor your nutrition
        </p>
      </div>

      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          {/* Food Logging Form */}
          <div style={{ marginBottom: '2rem' }}>
            <FoodLogging onMealLogged={() => setRefreshTrigger(prev => prev + 1)} />
          </div>

          {/* Today's Summary Card */}
          {token && todayMeals.length > 0 && (
            <Card style={{ 
              marginBottom: '2rem',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: '600' }}>
                  <i className="fas fa-chart-pie" style={{ marginRight: '0.5rem' }}></i>
                  Today's Nutrition Summary
                </h3>
                <Row>
                  <Col xs={6} md={3}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.25rem' }}>Calories</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Math.round(totals.calories)}</div>
                      <div style={{ fontSize: '0.75rem', opacity: '0.8' }}>kcal</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.25rem' }}>Protein</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Math.round(totals.protein)}</div>
                      <div style={{ fontSize: '0.75rem', opacity: '0.8' }}>grams</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.25rem' }}>Carbs</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Math.round(totals.carbs)}</div>
                      <div style={{ fontSize: '0.75rem', opacity: '0.8' }}>grams</div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', opacity: '0.9', marginBottom: '0.25rem' }}>Fat</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{Math.round(totals.fat)}</div>
                      <div style={{ fontSize: '0.75rem', opacity: '0.8' }}>grams</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Today's Meals List */}
          {token && (
            <Card style={{ 
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0 }}>
                    <i className="fas fa-history" style={{ marginRight: '0.5rem', color: '#667eea' }}></i>
                    Today's Meals
                  </h3>
                  {loading && (
                    <i className="fas fa-spinner fa-spin" style={{ color: '#667eea' }}></i>
                  )}
                </div>

                {todayMeals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {todayMeals.map((meal) => (
                      <div 
                        key={meal.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '1rem',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: getMealColor(meal.meal_type),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          flexShrink: 0
                        }}>
                          <i className={`fas ${getMealIcon(meal.meal_type)}`} style={{ color: 'white', fontSize: '1.25rem' }}></i>
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h4 style={{ 
                              margin: 0, 
                              fontSize: '1rem', 
                              fontWeight: '600',
                              color: '#1e293b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {meal.food_name}
                            </h4>
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '6px',
                              background: getMealColor(meal.meal_type),
                              color: 'white',
                              fontWeight: '500',
                              textTransform: 'capitalize',
                              flexShrink: 0
                            }}>
                              {meal.meal_type}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex', 
                            gap: '1rem',
                            fontSize: '0.875rem',
                            color: '#64748b',
                            flexWrap: 'wrap'
                          }}>
                            <span>
                              <i className="fas fa-fire" style={{ marginRight: '0.25rem', color: '#f59e0b' }}></i>
                              {meal.calories} cal
                            </span>
                            <span>
                              <i className="fas fa-drumstick-bite" style={{ marginRight: '0.25rem', color: '#ef4444' }}></i>
                              P: {meal.protein_g}g
                            </span>
                            <span>
                              <i className="fas fa-bread-slice" style={{ marginRight: '0.25rem', color: '#f59e0b' }}></i>
                              C: {meal.carbs_g}g
                            </span>
                            <span>
                              <i className="fas fa-cheese" style={{ marginRight: '0.25rem', color: '#eab308' }}></i>
                              F: {meal.fat_g}g
                            </span>
                            <span>
                              <i className="fas fa-clock" style={{ marginRight: '0.25rem', color: '#8b5cf6' }}></i>
                              {meal.time}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(meal.id)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#fee2e2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                            marginLeft: '0.5rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc2626';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          aria-label="Delete meal"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem 1rem',
                    color: '#94a3b8'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.5' }}>
                      <i className="fas fa-utensils"></i>
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                      No meals logged yet today
                    </p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      Start tracking your meals to see them here
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {!token && (
            <Alert variant="warning" style={{ 
              marginTop: '2rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <i className="fas fa-lock" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}></i>
              <p style={{ fontSize: '1.1rem', marginBottom: 0 }}>
                Please login to view your meal history and track your progress
              </p>
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FoodLoggingPage;
