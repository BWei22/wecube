import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from "../firebaseConfig";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import "./EditListing.css";

const puzzleTypes = [
  "3x3", "2x2", "4x4", "5x5", "6x6", "7x7", 
  "Megaminx", "Pyraminx", "Skewb", "Square-1", 
  "Clock", "Non-WCA", "Miscellaneous"
];

const EditListing = () => {
  const { listingId } = useParams();
  const [name, setName] = useState('');
  const [puzzleType, setPuzzleType] = useState('');
  const [price, setPrice] = useState('$');
  const [usage, setUsage] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, "listings", listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const listingData = docSnap.data();
          setName(listingData.name);
          setPuzzleType(listingData.puzzleType);
          setPrice(listingData.price || '$');
          setUsage(listingData.usage);
          setDescription(listingData.description);
          setImageUrl(listingData.imageUrl || '');
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handlePriceChange = (e) => {
    const input = e.target.value.replace('$', '');
    let sanitizedInput = input.replace(/[^0-9.]/g, '');

    const parts = sanitizedInput.split('.');
    if (parts.length > 2) {
        sanitizedInput = `${parts[0]}.${parts[1]}`;
    } else if (parts.length === 2) {
        sanitizedInput = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    setPrice(`$${sanitizedInput}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      console.error("User is not authenticated");
      return;
    }

    setLoading(true);

    try {
      let newImageUrl = imageUrl;
      if (image) {
        const storage = getStorage();
        const storageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(storageRef, image);
        newImageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "listings", listingId), {
        name,
        puzzleType,
        price,
        usage,
        description,
        imageUrl: newImageUrl,
      });

      navigate(`/listing/${listingId}`);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Error updating listing. Please check your permissions and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="edit-listing-container">
      <Button onClick={handleGoBack}>Back</Button>
      <h2>Edit Listing</h2>
      <form className="edit-listing-form" onSubmit={handleSubmit}>
        <TextField
          label="Puzzle Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Puzzle Type"
          select
          value={puzzleType}
          onChange={(e) => setPuzzleType(e.target.value)}
          required
          fullWidth
          margin="normal"
        >
          {puzzleTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Asking Price"
          value={price}
          onChange={handlePriceChange}
          required
          fullWidth
          margin="normal"
          InputProps={{
            startAdornment: <span>$</span>,
          }}
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
        {imageUrl && <img src={imageUrl} alt="Current Listing" width="100" />}
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? 'Updating...' : 'Update Listing'}
        </Button>
      </form>
    </div>
  );
};

export default EditListing;
