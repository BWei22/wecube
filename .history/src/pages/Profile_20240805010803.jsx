// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './Profile.css';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUsername(docSnap.data().username || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        disabled
      />
      <Button variant="contained" color="primary" disabled>
        Save
      </Button>
    </div>
  );
};

export default Profile;
