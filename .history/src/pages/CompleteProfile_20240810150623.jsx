// src/pages/CompleteProfile.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './AuthComponent.css';

const CompleteProfile = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password } = location.state || {};

  const [username, setUsernameInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to sign-up page if email or password is missing
  useEffect(() => {
    if (!email || !password) {
      console.error("Email or password missing, redirecting to signup page.");
      navigate('/signup');
    }
  }, [email, password, navigate]);

  const handleSetUsername = async () => {
    if (!username) {
      setError('Username is required');
      return;
    }

    setLoading(true);

    try {
      // Check if the username already exists
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose another one.');
        setLoading(false);
        return;
      }

      // Sign up the user with email and password
      await auth.signupWithEmailAndPassword(email, password);

      // Ensure user is authenticated and has a UID
      if (!auth.user || !auth.user.uid) {
        throw new Error("User is not authenticated or UID is missing.");
      }

      // Update the user's profile in Firestore
      const userDocRef = doc(db, 'users', auth.user.uid);
      await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });

      console.log('User document updated with username and profileComplete flag.');

      // Update context with the new username and profile completion status
      auth.setUsername(username);
      auth.setProfileComplete(true);

      // Redirect to the competitions page
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
