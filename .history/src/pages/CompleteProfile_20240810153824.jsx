import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebaseConfig';
import './AuthComponent.css';

const CompleteProfile = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsernameInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetUsernameAndSignup = async () => {
    if (!email || !password || !username) {
      setError('Email, Password, and Username are required');
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

      // Create the user with email and password
      const result = await createUserWithEmailAndPassword(authInstance, email, password);

      // Ensure user is authenticated and has a UID
      if (!result.user || !result.user.uid) {
        throw new Error("User authentication failed.");
      }

      console.log("Authenticated User UID:", result.user.uid);

      // Now that the user is authenticated, update their profile in Firestore
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });

      console.log('User document updated with username and profileComplete flag.');

      // Update context with the new username and profile completion status

      auth.setUsername(username);
      auth.setProfileComplete(true);

      // Navigate to the competitions page
      navigate('/competitions');
    } catch (error) {
      console.error('Error setting username or signing up:', error);
      setError('An error occurred while setting your username or signing up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Complete Profile</h2>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
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
        onClick={handleSetUsernameAndSignup}
        variant="contained"
        color="primary"
        disabled={loading}
      >
        {loading ? 'Setting Username and Signing Up...' : 'Set Username and Sign Up'}
      </Button>
    </div>
  );
};

export default CompleteProfile;
