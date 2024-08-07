// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, provider } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './SignUp.css'; // Import the CSS file for styling

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user document already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Prompt user to set a username
        let username = prompt('Please choose a username');

        while (username) {
          const usernameQuery = await getDoc(doc(db, 'usernames', username));
          if (usernameQuery.exists()) {
            username = prompt('Username already taken. Please choose another username');
          } else {
            break;
          }
        }

        if (username) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            username: username
          });
          await setDoc(doc(db, 'usernames', username), {
            uid: user.uid
          });
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error signing up with Google:', error);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the username is taken
      const usernameQuery = await getDoc(doc(db, 'usernames', username));
      if (usernameQuery.exists()) {
        alert('Username already taken. Please choose another username');
        return;
      }

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: `${firstName} ${lastName}`,
        username: username
      });

      await setDoc(doc(db, 'usernames', username), {
        uid: user.uid
      });

      navigate('/');
    } catch (error) {
      console.error('Error signing up with email and password:', error);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Your Account</h2>
      <Button variant="contained" color="primary" onClick={handleGoogleSignUp} className="social-signup-button">
        Continue with Google
      </Button>
      <div className="or-divider">or, continue with email</div>
      <TextField
        label="First Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <TextField
        label="Last Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
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
        helperText="Must be at least 6 characters and must contain a number or symbol."
      />
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        helperText="Choose something you like, this cannot be changed."
      />
      <Button variant="contained" color="primary" onClick={handleEmailSignUp} className="signup-button">
        Sign Up
      </Button>
    </div>
  );
};

export default SignUp;
