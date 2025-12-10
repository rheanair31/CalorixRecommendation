import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { token }
      });
      if (response.data.success) {
        setUser(response.data.user);
        // Check if user has completed their profile
        const profileComplete = !!(
          response.data.user.age &&
          response.data.user.sex &&
          response.data.user.weight_kg &&
          response.data.user.height_cm &&
          response.data.user.activity_level &&
          response.data.user.goal
        );
        setHasProfile(profileComplete);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        
        // Fetch full profile to check completion
        await fetchUserProfile();
        
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${url}/api/user/register`, {
        name,
        email,
        password
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
        setHasProfile(false); // New users don't have profile yet
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(
        `${url}/api/user/profile`,
        profileData,
        { headers: { token } }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        setHasProfile(true);
        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setHasProfile(false);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    hasProfile,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!token,
    fetchUserProfile,
    apiUrl: url
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
