import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './AuthComponent.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const auth = useAuth();

  const handleSignUp = async () => {
    try {
      await auth.signupWithEmailAndPassword(email, password, username);
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
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
      <Button onClick={handleSignUp} variant="contained" color="primary" fullWidth>
        Sign Up with Email
      </Button>
    </div>
  );
};

export default SignUp;
