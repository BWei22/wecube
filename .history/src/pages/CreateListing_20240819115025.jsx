import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, auth } from "../firebaseConfig";
import { TextField, Button, CircularProgress, MenuItem } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import './CreateListing.css';

const usageOptions = ["New", "Like New", "Used"];

const CreateListing = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [usage, setUsage] = useState(usageOptions[0]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { competitionId } = useParams();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      console.error("User is not authenticated");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';
      if (image) {
        const storage = getStorage();
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            reject,
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      await addDoc(collection(db, "listings"), {
        name,
        price,
        usage,
        description,
        imageUrl,
        competitionId,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setLoading(false);
      navigate(`/listings/${competitionId}`);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error creating listing. Please check your permissions and try again.");
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/listings/${competitionId}`);
  };

  return (
    <div className="create-listing-container">
      <Button onClick={handleGoBack}>Back</Button>
      <h2 className="create-listing-title">Create Listing</h2>
      <form onSubmit={handleSubmit} className="create-listing-form">
        <TextField
          label="Puzzle Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Asking Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Usage"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          required
          fullWidth
          select
          margin="normal"
        >
          {usageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <label htmlFor="image-upload">Image:</label>
        <input
          id="image-upload"
          type="file"
          onChange={handleImageChange}
          disabled={loading}
          accept="image/*"
        />
        {loading && <CircularProgress />}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          className="create-listing-submit"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
};

export default CreateListing;
