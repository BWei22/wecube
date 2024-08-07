// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, auth, provider } from '../firebaseConfig';
import { doc, setDoc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './SignUp.css';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { signinWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const result = await signinWithGoogle();
      const user = result.user;

      // Check if the username already exists
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose a different one.');
        return;
      }

      // Check if the user already has an account
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setError('An account with this email already exists. Please log in.');
        return;
      }

      // Create a new user document with the username
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
      });

      navigate('/');
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Error signing up. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <Button variant="contained" color="primary" onClick={handleSignUp}>
        Sign Up with Google
      </Button>
    </div>
  );
};

export default SignUp;
