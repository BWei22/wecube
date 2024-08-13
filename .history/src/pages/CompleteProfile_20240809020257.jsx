// src/pages/CompleteProfile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './AuthComponent.css';

const CompleteProfile = () => {
  const auth = useAuth();
  const navigate = useNavigate();
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

    const userDocRef = doc(db, 'users', auth.user.uid);

    try {
      await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });
      console.log('User document updated with username and profileComplete flag.');
      auth.setUsername(username); // Correctly use setUsername from auth context
      auth.setProfileComplete(true); // Correctly use setProfileComplete from auth context
      navigate('/competitions');
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
