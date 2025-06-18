import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    console.log('AuthContext: Checking user...');
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('AuthContext: Token found in localStorage.');
        const response = await authAPI.getProfile();
        console.log('AuthContext: Profile response:', response.data);
        setUser(response.data.user);
        console.log('AuthContext: User set:', response.data.user);
      } else {
        console.log('AuthContext: No token found in localStorage.');
      }
    } catch (error) {
      console.error('AuthContext: Auth check failed:', error);
      localStorage.removeItem('token');
      toast.error('Session expired or invalid. Please log in again.');
    } finally {
      setLoading(false);
      console.log('AuthContext: Loading set to false.');
    }
  };

  const login = async (email, password) => {
    console.log('AuthContext: Attempting login...');
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      console.log('AuthContext: Stored token:', token);
      setUser(user);
      console.log('AuthContext: Login successful. User set:', user);
      toast.success('Login successful!');
      return user;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    console.log('AuthContext: Attempting registration...');
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      console.log('AuthContext: Stored token after registration:', token);
      setUser(user);
      console.log('AuthContext: Registration successful. User set:', user);
      toast.success('Registration successful!');
      return user;
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user.');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError,
    isAuthenticated: !!user
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