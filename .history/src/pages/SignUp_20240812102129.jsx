import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './AuthComponent.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password || !username) {
      setError('Email, Password, and Username are required');
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

      // If username is valid and not taken, proceed with Firebase authentication
      const auth = getAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Set the user in Firestore with the username
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });

      // Set the user as authenticated
      auth.setUser({ uid: user.uid, email });
      auth.setUsername(username);  // Set the username in the context

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
