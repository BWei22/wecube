import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      setLoading(true);
      console.log("Starting signup process...");

      // Proceed with Firebase authentication
      const user = await auth.signupWithEmailAndPassword(email, password);
      console.log("User created in Firebase:", user.uid);

      // Generate a unique username (you can customize this logic)
      const generatedUsername = `user${Date.now()}`;

      // Set the user in Firestore with the generated username
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { username: generatedUsername, profileComplete: true }, { merge: true });
      console.log("User document created in Firestore with username:", generatedUsername);

      // Set the user in the context
      auth.setUser(user);
      auth.setUsername(generatedUsername);

      navigate('/profile');  // Redirect to your desired page after successful signup
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
