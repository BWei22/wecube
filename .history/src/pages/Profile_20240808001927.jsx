// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './Profile.css';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          console.log('Fetching profile for user ID:', userId);
          const docRef = doc(db, 'users', userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log('Profile document data:', docSnap.data());
            setUsername(docSnap.data().username || '');
          } else {
            console.log('No profile document found.');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to fetch profile. Please try again.');
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        console.log('Saving profile for user ID:', userId, 'with username:', username);
        await setDoc(doc(db, 'users', userId), { username }, { merge: true });
        alert('Profile updated successfully!');
      } else {
        setError('User not authenticated.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {error && <p className="error">{error}</p>}
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button onClick={handleSave} variant="contained" color="primary" className="save-button">
        Save
      </Button>
    </div>
  );
};

export default Profile;
