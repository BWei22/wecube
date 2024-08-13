import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import './AuthComponent.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const generateUniqueUsername = async () => {
    const timestamp = new Date().getTime();
    return `user${timestamp}`;
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }
  
    try {
      setLoading(true);
      console.log("Starting signup process...");
  
      // Generate a unique username automatically
      const generatedUsername = await generateUniqueUsername();
      console.log("Generated username:", generatedUsername);
  
      // Proceed with Firebase authentication
      const auth = getAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log("User created in Firebase:", user.uid);
  
      // Set the user in Firestore with the generated username
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { username: generatedUsername, profileComplete: true }, { merge: true });
      console.log("User document created in Firestore with username:", generatedUsername);
  
      // Set the user as authenticated
      auth.setUser({ uid: user.uid, email });
      auth.setUsername(generatedUsername);  // Set the generated username in the context
  
      navigate('/competitions');  // Redirect to your desired page after successful signup
    } catch (error) {
      setError('Failed to create an account');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
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
      {error && <p className="error">{error}</p>}
      <Button
        onClick={handleSignup}
        variant="contained"
        color="primary"
        disabled={loading}
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </Button>
    </div>
  );
};

export default SignUp;
