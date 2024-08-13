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
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // To handle loading state

  const handleSetUsername = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    setLoading(true); // Start loading

    try {
      // Check if the username already exists in the Firestore database
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose another one.');
        setLoading(false); // Stop loading on error
        return;
      }

      // Update user document with the selected username and mark profile as complete
      const userDocRef = doc(db, 'users', auth.user.uid);
      await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });

      console.log('User document updated with username and profileComplete flag.');

      // Update the context state to reflect the changes
      auth.setUsername(username);
      auth.setProfileComplete(true);

      // Navigate to the competitions page after successful profile completion
      navigate('/competitions');
    } catch (error) {
      console.error('Error setting username:', error);
      setError('An error occurred while setting your username. Please try again.');
    } finally {
      setLoading(false); // Stop loading after the process completes
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
          setError(''); // Clear error when user starts typing
          setUsername(e.target.value);
        }}
        disabled={loading} // Disable input while loading
      />
      {error && <p className="error">{error}</p>}
      <Button
        onClick={handleSetUsername}
        variant="contained"
        color="primary"
        disabled={loading} // Disable button while loading
      >
        {loading ? 'Setting Username...' : 'Set Username'}
      </Button>
    </div>
  );
};

export default CompleteProfile;

