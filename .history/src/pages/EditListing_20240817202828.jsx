import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import './EditListing.css';

const EditListing = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, 'listings', listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleSave = async () => {
    if (!listing.name || !listing.description || !listing.price) {
      alert('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'listings', listingId);
      await updateDoc(docRef, listing);
      navigate(`/listing/${listingId}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update the listing.');
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-listing-container">
      <h2>Edit Listing</h2>
      <TextField
        label="Name"
        value={listing.name}
        onChange={(e) => setListing({ ...listing, name: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        value={listing.description}
        onChange={(e) => setListing({ ...listing, description: e.target.value })}
        fullWidth
        margin="normal"
      />
           <TextField
        label="Description"
        value={listing.description}
        onChange={(e) => setListing({ ...listing, description: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Price"
        value={listing.price}
        onChange={(e) => setListing({ ...listing, price: e.target.value })}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save'}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate(-1)}
        disabled={loading}
        style={{ marginLeft: '10px' }}
      >
        Cancel
      </Button>
    </div>
  );
};

export default EditListing;
