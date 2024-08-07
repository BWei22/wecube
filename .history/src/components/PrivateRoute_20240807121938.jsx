import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const auth = useAuth();

  if (!auth.user) {
    return <Navigate to="/login" />;
  }

  if (!auth.profileComplete) {
    return <Navigate to="/complete-profile" />;
  }

  return children;
};

export default PrivateRoute;
