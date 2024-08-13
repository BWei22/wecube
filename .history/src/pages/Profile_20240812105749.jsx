// src/pages/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField } from '@mui/material';

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
