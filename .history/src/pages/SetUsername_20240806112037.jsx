import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './SetUsername.css';

const SetUsername = () => {
  const [username, setUsernameInput] = useState('');
  const { user, setUsername, newUser } = useAuth();
  const navigate = useNavigate();

  if (!newUser || !user) {
    navigate('/competitions');
    return null;
  }

  const handleSetUsername = async () => {
    if (username.trim() === '') {
      alert('Username cannot be empty');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const usernameQuery = await getDoc(userDocRef);

    if (usernameQuery.exists()) {
      alert('Username already exists');
      return;
    }

    await setDoc(userDocRef, { email: user.email, username });
    setUsername(username);
    navigate('/competitions');
  };

  return (
    <div className="set-username-container">
      <h2>Set Your Username</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={(e) => setUsernameInput(e.target.value)}
      />
      <Button onClick={handleSetUsername} variant="contained" color="primary" className="save-button">
        Save
      </Button>
    </div>
  );
};

export default SetUsername;
