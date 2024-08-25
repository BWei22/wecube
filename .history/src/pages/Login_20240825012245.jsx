import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import './AuthComponent.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }

    try {
      setLoading(true);
      await auth.signinWithEmailAndPassword(email, password);  
      navigate('/competitions');
    } catch (error) {
      setError('Failed to sign in');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
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
        onClick={handleLogin}
        variant="contained"
        color="primary"
        disabled={loading}
      >
        Login
      </Button>
      <Button
        onClick={() => navigate('/password-recovery')}
        variant="text"
        color="secondary"
        disabled={loading}
      >
        Forgot Password?
      </Button>
      <p>Don't have an account? <Link to="/signup">Sign-up</Link</p>
    </div>
  );
};

export default Login;
