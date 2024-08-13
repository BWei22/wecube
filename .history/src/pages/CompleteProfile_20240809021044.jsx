// src/pages/CompleteProfile.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CompleteProfile = () => {
  const auth = useAuth();
  const [username, setUsernameInput] = useState('');
  const [error, setError] = useState('');

  const handleSetUsername = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setError('Username already exists. Please choose another one.');
      return;
    }

    try {
      await auth.completeProfile(username); // Use the completeProfile function from auth context
    } catch (error) {
      console.error('Error setting username:', error);
      setError('Error setting username');
    }
  };

  return (
    <div className="auth-container">
      <h2>Complete Profile</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsernameInput(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <Button onClick={handleSetUsername} variant="contained" color="primary">
        Set Username
      </Button>
    </div>
  );
};

export default CompleteProfile;
