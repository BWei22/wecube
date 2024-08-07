import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './SignUp.css'; // Add the CSS for styling

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the username already exists
      const usernameDoc = await getDoc(doc(db, 'usernames', username));
      if (usernameDoc.exists()) {
        setError('Username already exists. Please choose another one.');
        await user.delete(); // Delete the user if the username already exists
        return;
      }

      // Add user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
      });

      // Save username to a separate collection to ensure uniqueness
      await setDoc(doc(db, 'usernames', username), {
        uid: user.uid,
      });

      navigate('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please use a different email or login.');
      } else {
        console.error('Error signing up with email and password:', error);
        setError('Failed to sign up. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Your Account</h2>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p className="error-message">{error}</p>}
      <Button onClick={handleEmailSignUp} variant="contained" color="primary" className="signup-button">
        Sign Up
      </Button>
      <p>
        Already have an account? <Link to="/auth">Sign in</Link>
      </p>
      <p>OR</p>
      <Button onClick={handleGoogleSignUp} variant="contained" color="default" className="google-button">
        Continue with Google
      </Button>
    </div>
  );
};

export default SignUp;
