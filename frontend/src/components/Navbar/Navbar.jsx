import React, { useContext, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { token, setToken } = useContext(StoreContext);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("profileComplete");
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <div id="sticky">
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-brand">
              <span style={{ fontSize: '2rem' }}>Calorix Diet Planner</span>
            </Link>
            
            <div className="navbar-links">
              {!token && (
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  Home
                </Link>
              )}
              
              {token && (
                <>
                  <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                  <Link to="/diet-planner" className={`nav-link ${isActive('/diet-planner') ? 'active' : ''}`}>
                    Diet Planner
                  </Link>
                  <Link to="/water-tracking" className={`nav-link ${isActive('/water-tracking') ? 'active' : ''}`}>
                    Water
                  </Link>
                  <Link to="/exercise-logging" className={`nav-link ${isActive('/exercise-logging') ? 'active' : ''}`}>
                    Exercise
                  </Link>
                  <Link to="/log-food" className={`nav-link ${isActive('/log-food') ? 'active' : ''}`}>
                    Log Food
                  </Link>
                  <Link to="/analytics" className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}>
                    Summary
                  </Link>
                </>
              )}
              
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                About
              </Link>
            </div>

            <div className="navbar-actions">
              {!token ? (
                <button className="nav-button primary" onClick={() => setShowLogin(true)}>
                  Login
                </button>
              ) : (
                <div className="navbar-profile">
                  <FaUserCircle 
                    className="profile-icon"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  />
                  {showProfileDropdown && (
                    <ul className="nav-profile-dropdown">                      
                      <li onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}>
                        <i className="fas fa-user-edit"></i>
                        <span>Edit Profile</span>
                      </li>
                      <li onClick={() => { navigate('/saved-plans'); setShowProfileDropdown(false); }}>
                        <i className="fas fa-bookmark"></i>
                        <span>Saved Plans</span>
                      </li>
                      <hr />
                      <li onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button className="mobile-menu-button" onClick={toggleMobileMenu}>
              {showMobileMenu ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </nav>
      </div>

      <div className={`mobile-menu ${showMobileMenu ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="navbar-brand">
            <span>Calorix</span> Diet Planner
          </Link>
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            <FaTimes />
          </button>
        </div>

        <div className="mobile-menu-links">
          {!token && (
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={toggleMobileMenu}>
              Home
            </Link>
          )}
          
          {token && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={toggleMobileMenu}>
                Dashboard
              </Link>
              <Link to="/diet-planner" className={`nav-link ${isActive('/diet-planner') ? 'active' : ''}`} onClick={toggleMobileMenu}>
                Diet Planner
              </Link>
              <Link to="/water-tracking" className={`nav-link ${isActive('/water-tracking') ? 'active' : ''}`} onClick={toggleMobileMenu}>
                Water
              </Link>
              <Link to="/exercise-logging" className={`nav-link ${isActive('/exercise-logging') ? 'active' : ''}`} onClick={toggleMobileMenu}>
                Exercise
              </Link>
              <Link to="/log-food" className={`nav-link ${isActive('/log-food') ? 'active' : ''}`} onClick={toggleMobileMenu}>
                Log Food
              </Link>
              <Link to="/meal-tracker" className={`nav-link ${isActive('/meal-tracker') ? 'active' : ''}`} onClick={toggleMobileMenu}>
                Summary
              </Link>
            </>
          )}
          
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={toggleMobileMenu}>
            About
          </Link>
        </div>

        <div className="mobile-menu-actions">
          {!token ? (
            <button className="nav-button primary" onClick={() => { setShowLogin(true); toggleMobileMenu(); }}>
              Login
            </button>
          ) : (
            <>
              <button className="nav-button secondary" style={{ marginBottom: '0.5rem' }} onClick={() => { navigate('/profile'); toggleMobileMenu(); }}>
                Edit Profile
              </button>
              <button className="nav-button secondary" onClick={() => { handleLogout(); toggleMobileMenu(); }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
