// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }

    try {
      // Log in the user with email and password
      await auth.signinWithEmailAndPassword(email, password);

      // Check if the profile is complete
      if (auth.profileComplete) {
        // Navigate to the main page or dashboard after successful login
        navigate('/competitions');
      } else {
        // Navigate to the complete profile page if the profile is not complete
        navigate('/complete-profile');
      }
      
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <Button onClick={handleEmailLogin} variant="contained" color="primary">
        Login
      </Button>
    </div>
  );
};

export default Login;
