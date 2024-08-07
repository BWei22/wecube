import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const auth = useAuth();

  return auth.user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
