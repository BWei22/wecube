import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Typography, Box } from '@mui/material';
import { getAuth, updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { doc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import './Profile.css';  

const Profile = () => {
  const { user, username, updateUsername, deleteAccount } = useAuth();
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
      const q = query(collection(db, 'users'), where('username', '==', newUsername));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && newUsername !== username) {
        setError('Username already exists. Please choose another one.');
        setLoading(false);
        return;
      }

      const auth = getAuth();

      await updateProfile(auth.currentUser, {
        displayName: newUsername,
        photoURL: profilePic,
      });

      await updateUsername(newUsername);

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
      (snapshot) => {},
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
    <div className="page-container">
      <div className="page-content">
        <Box className="profile-container">
          <Typography variant="h4" component="h2" className="profile-header">
            Edit Profile
          </Typography>
          <TextField
            label="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            disabled={loading}
            fullWidth
            margin="normal"
            variant="outlined"
            className="profile-input"
          />
          <Box className="profile-picture-section">
            <Typography variant="subtitle1" gutterBottom>
              Profile Picture
            </Typography>
            <Box className="profile-picture-upload">
              <Button
                variant="contained"
                component="label"
                disabled={uploading || loading}
                className="profile-picture-button"
              >
                Upload
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {uploading && <CircularProgress size={24} className="profile-upload-progress" />}
              {profilePic && <img src={profilePic} alt="Profile" className="profile-picture-image" />}
            </Box>
          </Box>
          {error && <Typography color="error" variant="body2" className="profile-error">{error}</Typography>}
          <Button
            onClick={handleUpdateProfile}
            variant="contained"
            color="primary"
            disabled={loading || uploading}
            className="profile-button"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Profile;