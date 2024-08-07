// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField, Link } from '@mui/material';
import './AuthComponent.css';

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const { user, isNewUser } = await auth.signinWithGoogle();
      if (isNewUser) {
        navigate('/complete-profile', { state: { uid: user.uid } });
      } else {
        navigate('/competitions');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await auth.signinWithEmailAndPassword(email, password);
      navigate('/competitions');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
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
        Log In
      </Button>
      <Button onClick={handleGoogleLogin} variant="contained" color="primary">
        Continue with Google
      </Button>
      <p>
        Don't have an account? <Link onClick={() => navigate('/signup')}>Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
