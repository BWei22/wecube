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
    console.log("Set Username button clicked"); // Log to check if function is triggered

    if (!username) {
      setError('Username is required');
      console.log("Username is empty"); // Log if the username is empty
      return;
    }

    try {
      console.log("Checking if username exists in Firestore...");
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose another one.');
        console.log("Username already exists in Firestore"); // Log if username exists
        return;
      }

      console.log("Username is unique, proceeding to complete profile...");

      // Call the completeProfile function from useAuth context
      await auth.completeProfile(username);

      console.log("Profile completed successfully!"); // Log on success
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
