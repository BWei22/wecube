// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for the auth state to load before rendering the route
  if (loading) {
    return <div>Loading...</div>;
  }

  // If a user is authenticated, render the children components; otherwise, redirect to login
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
