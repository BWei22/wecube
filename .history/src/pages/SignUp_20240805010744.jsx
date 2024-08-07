// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './SignUp.css';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the email is already registered
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // User is already registered, redirect to login
        alert('Email is already registered. Please log in.');
        navigate('/login');
      } else {
        // Register new user with a username
        if (username.trim() === '') {
          setError('Username is required');
          return;
        }

        // Check if username is already taken
        const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
        const usernameQuerySnapshot = await getDocs(usernameQuery);

        if (!usernameQuerySnapshot.empty) {
          setError('Username is already taken. Please choose another one.');
          return;
        }

        // Save new user data
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          username: username,
        });

        // Redirect to home page after successful registration
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing up with Google:', error);
      setError('Error signing up with Google. Please try again.');
    }
  };

  return (
    <div className="sign-up-container">
      <h2>Sign Up</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <Button variant="contained" color="primary" onClick={handleGoogleSignUp}>
        Sign Up with Google
      </Button>
    </div>
  );
};

export default SignUp;
