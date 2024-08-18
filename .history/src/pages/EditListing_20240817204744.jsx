import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { TextField, Button, CircularProgress, MenuItem } from '@mui/material';
import './EditListing.css';

const usageOptions = ["New", "Like New", "Used"];

const EditListing = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [usage, setUsage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, 'listings', listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setListing(data);
          setName(data.name);
          setDescription(data.description);
          setPrice(data.price);
          setUsage(data.usage);
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleImageUpload = async () => {
    if (!imageFile) return imageUrl;

    setLoading(true);
    const storageRef = ref(storage, `listingImages/${listingId}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error('Upload failed:', error);
          setLoading(false);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadURL);
          setLoading(false);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const updatedImageUrl = await handleImageUpload();
      const docRef = doc(db, 'listings', listingId);
      await updateDoc(docRef, {
        name,
        description,
        price,
        usage,
        imageUrl: updatedImageUrl,
      });
      setLoading(false);
      alert('Listing updated successfully!');
      navigate(`/listing/${listingId}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      setLoading(false);
    }
  };

  if (!listing) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-listing-container">
      <h2 className="edit-listing-title">Edit Listing</h2>
      <form className="edit-listing-form">
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Price"
          variant="outlined"
          fullWidth
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Usage"
          variant="outlined"
          fullWidth
          select
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          margin="normal"
        >
          {usageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <label htmlFor="image-upload">Image:</label>
        <input
          id="image-upload"
          type="file"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        {loading && <CircularProgress />}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Listing"
            className="edit-listing-image-preview"
          />
        )}
        <div className="edit-listing-actions">
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Save Changes
          </Button>
          <Button
            onClick={() => navigate(`/listing/${listingId}`)}
            variant="outlined"
            color="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
