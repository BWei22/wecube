import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './AuthComponent.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await auth.signinWithGoogle();
      navigate('/competitions');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await auth.signinWithEmailAndPassword(email, password);
      navigate('/competitions');
    } catch (error) {
      console.error('Login failed:', error);
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
      <Button onClick={handleEmailLogin} variant="contained" color="primary" fullWidth>
        Login with Email
      </Button>
      <Button onClick={handleGoogleLogin} variant="contained" color="secondary" fullWidth>
        Login with Google
      </Button>
    </div>
  );
};

export default Login;
