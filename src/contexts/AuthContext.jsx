import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState(null);
  const [error, setError] = useState(null);

  // Mutations for user creation only
  const createUser = useMutation(api.users.createUser);
  
  // Query for user authentication - this is the correct pattern
  const userData = useQuery(
    api.users.authenticateUser,
    email ? { email } : "skip"
  );

  // Check for stored email on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
    setLoading(false);
  }, []);

  // Update user state when userData changes
  useEffect(() => {
    if (userData !== undefined) {
      if (userData) {
        setUser(userData.user);
        setUserId(userData.userId);
        setError(null);
      } else {
        setUser(null);
        setUserId(null);
        setError('User not found or authentication failed');
      }
    }
  }, [userData]);

  // Update loading state based on query state
  useEffect(() => {
    if (email && userData === undefined) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [email, userData]);

  const signIn = async (userEmail) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set email to trigger the query
      localStorage.setItem('userEmail', userEmail);
      setEmail(userEmail);
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = await createUser(userData);
      if (userId) {
        localStorage.setItem('userEmail', userData.email);
        setEmail(userData.email);
        return { success: true, userId };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('userEmail');
    setEmail(null);
    setUser(null);
    setUserId(null);
    setError(null);
  };

  const value = {
    user,
    userId,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};