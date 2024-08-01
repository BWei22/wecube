import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const CreateListing = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setError('You must be logged in to create a listing.');
      return;
    }

    try {
      await addDoc(collection(db, 'listings'), {
        title,
        description,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });
      setTitle('');
      setDescription('');
      setError(null);
      alert('Listing created successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
      setError('Error creating listing. Please try again.');
    }
  };

  return (
    <div>
      <h2>Create Listing</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Create Listing
        </Button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateListing;
