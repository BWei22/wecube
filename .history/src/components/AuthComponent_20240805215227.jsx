import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './AuthComponent.css'; // Add the CSS for styling

const AuthComponent = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await auth.signinWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await auth.signinWithEmail(email, password);
      navigate('/');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
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
      <Button onClick={handleEmailLogin} variant="contained" color="primary" className="auth-button">
        Sign In
      </Button>
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
      <p>OR</p>
      <Button onClick={handleGoogleLogin} variant="contained" color="default" className="google-button">
        Continue with Google
      </Button>
    </div>
  );
};

export default AuthComponent;
