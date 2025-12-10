import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import AboutPage from "./pages/AboutPage";
import UserProfileForm from "./pages/UserProfileForm";
import DietPlanner from "./pages/DietPlanner";
import MealPlanResults from "./pages/MealPlanResults";
import SavedMealPlans from "./pages/SavedMealPlans";
import FoodLoggingPage from "./pages/FoodLoggingPage";
import MealTrackerPage from "./pages/MealTracker";
import Dashboard from "./pages/Dashboard";
import WaterTracking from "./pages/WaterTracking";
import ExerciseLogging from "./pages/ExerciseLogging";
import Analytics from "./pages/Analytics";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import { Container } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Container className="py-4">
          <Routes>
            <Route path="/" element={<Home setShowLogin={setShowLogin} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route 
              path="/profile" 
              element={<UserProfileForm />} 
            />
            <Route 
              path="/diet-planner" 
              element={<DietPlanner />} 
            />
            <Route 
              path="/meal-plan" 
              element={<MealPlanResults />} 
            />
            <Route path="/saved-plans" element={<SavedMealPlans />} />
            <Route path="/log-food" element={<FoodLoggingPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/water-tracking" element={<WaterTracking />} />
            <Route path="/exercise-logging" element={<ExerciseLogging />} />
          </Routes>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default App;
