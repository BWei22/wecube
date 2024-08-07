// src/pages/CompleteProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './AuthComponent.css';

const CompleteProfile = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userUid = location.state?.uid; // Get the user UID passed in state
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userUid) {
      navigate('/login');
    }
  }, [userUid, navigate]);

  const handleSetUsername = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    // Check if username already exists
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setError('Username already exists. Please choose another one.');
      return;
    }

    const userDocRef = doc(db, 'users', userUid);

    try {
      await setDoc(userDocRef, { username });
      auth.setUsername(username);
      auth.setUser({ uid: userUid }); // Now set the user as authenticated
      navigate('/competitions');
    } catch (error) {
      console.error('Error setting username:', error);
      setError('Error setting username');
    }
  };

  if (!userUid) {
    return null; // Render nothing if userUid is not available
  }

  return (
    <div className="auth-container">
      <h2>Complete Profile</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <Button onClick={handleSetUsername} variant="contained" color="primary">
        Set Username
      </Button>
    </div>
  );
};

export default CompleteProfile;
