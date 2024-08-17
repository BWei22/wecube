// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField, CircularProgress } from '@mui/material';
import { getAuth, updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { doc, updateDoc, query, where, getDocs, collection, setDoc } from 'firebase/firestore';

const Profile = () => {
  const { user, username, updateUsername } = useAuth();
  const [newUsername, setNewUsername] = useState(username || '');
  const [profilePic, setProfilePic] = useState(user?.photoURL || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setNewUsername(username || '');
    setProfilePic(user?.photoURL || '');
  }, [username, user]);

  const handleUpdateProfile = async () => {
    if (!newUsername) {
      setError('Username cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check for duplicate usernames
      const q = query(collection(db, 'users'), where('username', '==', newUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && newUsername !== username) {
        setError('Username already exists. Please choose another one.');
        setLoading(false);
        return;
      }

      const auth = getAuth();

      // Update the profile picture and username in Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: newUsername,
        photoURL: profilePic,
      });

      // Use the updateUsername function from useAuth to update the username in the context
      await updateUsername(newUsername);

      // Update the user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        username: newUsername,
        photoURL: profilePic,
      });

      setLoading(false);
      alert('Profile updated successfully!');
    } catch (error) {
      setError('Failed to update profile');
      console.error('Profile update error:', error);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // You can add progress logic here if needed
      },
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setProfilePic(downloadURL);
        setUploading(false);
      }
    );
  };

  const handleDeleteAccount = () => {
    setOpen(true);
  };

  const handleConfirmDelete = async () => {
    setOpen(false);
    await deleteAccount();
  };

  const handleCancelDelete = () => {
    setOpen(false);
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      <TextField
        label="Username"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        disabled={loading}
        fullWidth
        margin="normal"
      />
      <div>
        <label htmlFor="profilePic">
          Profile Picture:
          <input
            id="profilePic"
            type="file"
            onChange={handleFileChange}
            disabled={uploading || loading}
            accept="image/*"
          />
        </label>
        {uploading && <CircularProgress />}
        {profilePic && <img src={profilePic} alt="Profile" width="100" />}
      </div>
      {error && <p className="error">{error}</p>}
      <Button
        onClick={handleUpdateProfile}
        variant="contained"
        color="primary"
        disabled={loading || uploading}
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </Button>
    </div>
  );
};

export default Profile;
