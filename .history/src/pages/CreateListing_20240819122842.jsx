import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, auth } from "../firebaseConfig";
import { TextField, Button, CircularProgress, MenuItem } from "@mui/material";
import './CreateListing.css';

const puzzleTypes = [
  "3x3", "2x2", "4x4", "5x5", "6x6", "7x7", 
  "Megaminx", "Pyraminx", "Skewb", "Square-1", 
  "Clock", "Non-WCA", "Miscellaneous"
];

const usageOptions = ["New", "Like New", "Used"];

const CreateListing = () => {
  const [name, setName] = useState('');
  const [puzzleType, setPuzzleType] = useState('');
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


  To ensure that the price is capped at two decimal points, you can modify the handlePriceChange function in the CreateListing component. Here's how you can do it:

  Step 1: Update the handlePriceChange Function
  Modify the function to allow only two decimal places:
  
  javascript
  Copy code
  const handlePriceChange = (e) => {
      const input = e.target.value;
      // Remove non-numeric characters (except for the $ and .)
      let sanitizedInput = input.replace(/[^0-9.]/g, '');
  
      // Ensure that there's only one decimal point and cap to two decimal places
      const parts = sanitizedInput.split('.');
      if (parts.length > 2) {
          sanitizedInput = `${parts[0]}.${parts[1]}`;
      } else if (parts.length === 2) {
          sanitizedInput = `${parts[0]}.${parts[1].slice(0, 2)}`;
      }
  
      // Add a $ at the start if it's not already there
      setPrice(sanitizedInput ? `$${sanitizedInput}` : '$');
  };
  Explanation:
  Sanitization: The input is sanitized by removing any non-numeric characters except for the decimal point (.) and the dollar sign ($).
  Decimal Point Handling: If the input has more than one decimal point, it only keeps the first one. If there is a decimal point, it caps the number to two decimal places by slicing the second part to the first two digits.
  Set Price: The price is then set with a $ at the start, ensuring it always starts with a dollar sign.
  Updated CreateListing Component
  Here's the full CreateListing component with the updated price handling:
  
  javascript
  Copy code
  import React, { useState } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import { collection, addDoc, serverTimestamp } from "firebase/firestore";
  import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
  import { db, auth } from "../firebaseConfig";
  import TextField from "@mui/material/TextField";
  import Button from "@mui/material/Button";
  import MenuItem from "@mui/material/MenuItem";
  
  const puzzleTypes = [
    "3x3", "2x2", "4x4", "5x5", "6x6", "7x7", 
    "Megaminx", "Pyraminx", "Skewb", "Square-1", 
    "Clock", "Non-WCA", "Miscellaneous"
  ];
  
  const CreateListing = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('$');
    const [usage, setUsage] = useState('');
    const [puzzleType, setPuzzleType] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const { competitionId } = useParams();
    const navigate = useNavigate();
  
    const handleImageChange = (e) => {
      if (e.target.files[0]) {
        setImage(e.target.files[0]);
      }
    };
  
    const handlePriceChange = (e) => {
      const input = e.target.value;
      // Remove non-numeric characters (except for the $ and .)
      let sanitizedInput = input.replace(/[^0-9.]/g, '');
  
      // Ensure that there's only one decimal point and cap to two decimal places
      const parts = sanitizedInput.split('.');
      if (parts.length > 2) {
          sanitizedInput = `${parts[0]}.${parts[1]}`;
      } else if (parts.length === 2) {
          sanitizedInput = `${parts[0]}.${parts[1].slice(0, 2)}`;
      }
  
      // Add a $ at the start if it's not already there
      setPrice(sanitizedInput ? `$${sanitizedInput}` : '$');
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
        puzzleType,
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
