// src/components/CompleteProfile.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './AuthComponent.css';

const CompleteProfile = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state;

  const handleSetUsername = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    try {
      setLoading(true);

      // Check if the username is already taken
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose another one.');
        setLoading(false);
        return;
      }

      // Update user document in Firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });

      navigate('/dashboard');  // Redirect to your desired page after profile completion
    } catch (error) {
      setError('Failed to set username');
      console.error('Username setting error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Complete Profile</h2>
      <p>Welcome, {email}! Please choose a username to complete your profile.</p>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
