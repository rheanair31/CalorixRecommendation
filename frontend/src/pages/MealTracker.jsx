import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
import MealTracker from '../components/MealTracker';

const MealTrackerPage = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Your Daily Nutrition</h1>
            <Link to="/log-food">
              <Button variant="primary">
                <FaCamera className="me-2" />
                Log New Meal
              </Button>
            </Link>
          </div>
          <MealTracker />
        </Col>
      </Row>
    </Container>
  );
};

export default MealTrackerPage;