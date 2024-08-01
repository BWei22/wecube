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
      const userId = auth.currentUser.uid;
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUsername(docSnap.data().username || '');
      }
      setLoading(false);
    };

    if (auth.currentUser) {
      fetchProfile();
    }
  }, []);

  const handleSave = async () => {
    const userId = auth.currentUser.uid;
    await setDoc(doc(db, 'users', userId), { username }, { merge: true });
    alert('Profile updated successfully!');
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
