// CompleteProfile.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const CompleteProfile = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSetUsername = async () => {
    if (!auth.user) return;

    try {
      const usernamesRef = collection(db, 'users');
      const q = query(usernamesRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose a different one.');
        return;
      }

      await setDoc(doc(db, 'users', auth.user.uid), { username, uid: auth.user.uid });
      navigate('/competitions');
    } catch (error) {
      setError('Error setting username: ' + error.message);
    }
  };

  return (
    <div className="complete-profile-container">
      <h2>Complete Your Profile</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Button onClick={handleSetUsername} variant="contained" color="primary">
        Set Username
      </Button>
    </div>
  );
};

export default CompleteProfile;
