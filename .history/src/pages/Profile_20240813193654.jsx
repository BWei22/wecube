import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Profile = () => {
  const { username, updateUsername } = useAuth();
  const [newUsername, setNewUsername] = useState(username);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangeUsername = async () => {
    if (!newUsername) {
      setError('Username cannot be empty');
      return;
    }

    try {
      setLoading(true);
      
      // Check if the new username already exists
      const usernameQuery = query(collection(db, 'users'), where('username', '==', newUsername));
      const querySnapshot = await getDocs(usernameQuery);

      if (!querySnapshot.empty) {
        setError('Username already exists. Please choose another one.');
        setLoading(false);
        return;
      }

      // If no duplicate found, proceed to update the username
      await updateUsername(newUsername);  // Call the function to update username
      setError('');  // Clear any previous errors
    } catch (error) {
      setError('Failed to update username');
      console.error('Username update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Profile</h2>
      <h6>You can update your username here!</h6>
      <TextField
        label="Username"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        disabled={loading}
      />
      {error && <p className="error">{error}</p>}
      <Button onClick={handleChangeUsername} variant="contained" color="primary" disabled={loading}>
        {loading ? 'Updating...' : 'Update Username'}
      </Button>
    </div>
  );
};

export default Profile;
