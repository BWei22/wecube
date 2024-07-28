import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from "../firebaseConfig";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import './CreateListing.css';

const CreateListing = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [usage, setUsage] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const { competitionId } = useParams();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = '';
      if (image) {
        const storage = getStorage();
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
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

      navigate(`/listings/${competitionId}`);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleGoBack = () => {
    navigate(`/listings/${competitionId}`);
  };

  return (
    <div className="create-listing">
      <Button onClick={handleGoBack}>Back</Button>
      <h2>Create Listing</h2>
      <form onSubmit={handleSubmit}>
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
          margin="normal"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <input type="file" onChange={handleImageChange} />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default CreateListing;
