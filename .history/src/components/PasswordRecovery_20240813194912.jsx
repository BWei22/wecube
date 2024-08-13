// src/components/PasswordRecovery.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Button, TextField } from '@mui/material';
import './[agesAuthComponent.css';

const PasswordRecovery = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const auth = getAuth();

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
      setError('');
    } catch (error) {
      setError('Failed to send password reset email. Please try again.');
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Password Recovery</h2>
      <p>Enter your email address to receive a password reset link.</p>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(''); // Clear error message on change
          setMessage(''); // Clear success message on change
        }}
        disabled={loading}
        error={Boolean(error)}
      />
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <Button
        onClick={handlePasswordReset}
        variant="contained"
        color="primary"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Password Reset Email'}
      </Button>
      <Button
        onClick={() => navigate('/login')}
        variant="text"
        color="secondary"
        disabled={loading}
      >
        Back to Login
      </Button>
    </div>
  );
};

export default PasswordRecovery;
