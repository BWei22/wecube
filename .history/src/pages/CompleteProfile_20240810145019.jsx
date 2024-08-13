// src/pages/CompleteProfile.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { postId, customMessage } = location.state || {};

  const handleSetUsername = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    if (!auth.user) {
      setError('No authenticated user found. Please sign in again.');
      console.error('Error: No authenticated user found.');
      return;
    }

    setLoading(true);

    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose another one.');
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', auth.user.uid);
      await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });

      console.log('User document updated with username and profileComplete flag.');

      auth.setUsername(username); // Update username in auth context
      auth.setProfileComplete(true); // Update profileComplete in auth context

      await auth.signupWithEmailAndPassword(email, password);
      

      navigate('/competitions');
    } catch (error) {
      console.error('Error setting username:', error);
      setError('An error occurred while setting your username. Please try again.');
    } finally {
      setLoading(false);
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
        onChange={(e) => {
          setError('');
          setUsernameInput(e.target.value);
        }}
        disabled={loading}
      />
      {error && <p className="error">{error}</p>}
      <Button
        onClick={handleSetUsername}
        variant="contained"
        color="primary"
        disabled={loading}
      >
        {loading ? 'Setting Username...' : 'Set Username'}
      </Button>
    </div>
  );
};

export default CompleteProfile;
