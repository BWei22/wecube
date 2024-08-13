// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleEmailSignup = async () => {
    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }

    try {
      // Sign up the user with email and password
      await auth.signupWithEmailAndPassword(email, password);
      
      // After signup, navigate to the complete-profile page
      navigate('/complete-profile');
      
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Error signing up. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
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
      <Button onClick={handleEmailSignup} variant="contained" color="primary">
        Sign Up
      </Button>
    </div>
  );
};

export default Signup;
