import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TextField, Button } from '@mui/material';

const CompleteProfile = () => {
  const { user, setUsername } = useAuth();
  const [username, setUsernameState] = useState('');

  const handleSave = async () => {
    if (username.trim() === '') {
      alert('Username cannot be empty');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { username }, { merge: true });
      setUsername(username);
      navigate('/competitions');
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={(e) => setUsernameState(e.target.value)}
      />
      <Button onClick={handleSave} variant="contained" color="primary">
        Save
      </Button>
    </div>
  );
};

export default CompleteProfile;
