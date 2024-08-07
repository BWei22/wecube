import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField, Link } from '@mui/material';
import './AuthComponent.css';

const SignUp = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignUp = async () => {
    try {
      await auth.signinWithGoogle();
    } catch (error) {
      console.error('Sign-up failed:', error);
      setError(error.message);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await auth.signupWithEmailAndPassword(email, password, username);
    } catch (error) {
      console.error('Sign-up failed:', error);
      setError(error.message);
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
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <Button onClick={handleEmailSignUp} variant="contained" color="primary">
        Sign Up
      </Button>
      <Button onClick={handleGoogleSignUp} variant="contained" color="primary">
        Continue with Google
      </Button>
      <p>
        Already have an account? <Link onClick={() => navigate('/login')}>Log in</Link>
      </p>
    </div>
  );
};

export default SignUp;
