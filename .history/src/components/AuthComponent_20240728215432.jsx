import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '@mui/material/Button';
import './AuthComponent.css';

const AuthComponent = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await auth.signinWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <Button onClick={handleGoogleLogin} variant="contained" color="primary">
        Login with Google
      </Button>
    </div>
  );
};

export default AuthComponent;
