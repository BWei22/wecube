import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, deleteDoc, doc, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './Listings.css'; 

const Listings = () => {
  const { competitionId } = useParams();
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "listings"), where("competitionId", "==", competitionId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listingsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setListings(listingsData);
    }, error => {
      console.error("Error fetching listings:", error);
    });

    return () => unsubscribe();
  }, [competitionId]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "listings", id));
      console.log("Listing successfully deleted!");
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateListingClick = (competitionId) => {
    navigate(`/create-listing/${competitionId}`)
  }

  const handleGoBack = () => {
    navigate("/competitions");
  };

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  return (
    <div className="listings">
      <Button onClick={handleGoBack}>Back</Button>
      <h2>Listings for {competitionId}</h2>
      <TextField
        label="Search Listings"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={() => handleCreateListingClick(competitionId)}>
        + Create Listing
      </Button>
      <div className="listings-grid">
        {filteredListings.map(listing => (
          <div key={listing.id} className="listing-item" onClick={() => handleListingClick(listing.id)}>
            <img src={listing.imageUrl} alt={listing.name} className="listing-image" />
            <div className="listing-info">
              <span className="listing-name">{listing.name}</span>
              <span className="listing-price">${listing.price}</span>
            </div>
            {auth.currentUser && listing.userId === auth.currentUser.uid && (
              <Button variant="contained" color="secondary" onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}>
                Delete
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listings;
