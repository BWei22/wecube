import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './Profile.css';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      setLoading(false);
    };

    if (auth.currentUser) {
      fetchProfile();
    }
  }, []);

  const handleSave = async () => {
    try {
      const userId = auth.currentUser.uid;
      console.log('Saving profile for user ID:', userId, 'with username:', username);
      await setDoc(doc(db, 'users', userId), { username }, { merge: true });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

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
