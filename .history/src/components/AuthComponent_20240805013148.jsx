// src/components/AuthComponent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Adjust the import path as necessary
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './AuthComponent.css';

const AuthComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const authContext = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await authContext.signinWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Google login failed. Please try again.');
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Email login failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <Button onClick={handleGoogleLogin} variant="contained" color="primary" className="social-login-button">
        Login with Google
      </Button>
      <div className="or-divider">or</div>
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
        variant="outlined"
        fullWidth
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <Button onClick={handleEmailLogin} variant="contained" color="secondary" className="login-button">
        Login with Email
      </Button>
    </div>
  );
};

export default AuthComponent;
