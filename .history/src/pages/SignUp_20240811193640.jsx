import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import './AuthComponent.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }

    try {
      setLoading(true);
      await auth.signupWithEmailAndPassword(email, password);  // Ensure function name matches
      navigate('/complete-profile', { state: { email } });
    } catch (error) {
      setError('Failed to create an account');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      {error && <p className="error">{error}</p>}
      <Button
        onClick={handleSignup}
        variant="contained"
        color="primary"
        disabled={loading}
      >
        Sign Up
      </Button>
    </div>
  );
};

export default SignUp;
