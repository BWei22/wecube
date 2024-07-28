import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, deleteDoc, doc, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../hooks/useAuth";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import "./Listings.css"; // Import the CSS file for styling

const Listings = () => {
  const { competitionId } = useParams();
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    console.log("Fetching listings...");
    const q = query(collection(db, "listings"), where("competitionId", "==", competitionId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listingsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      console.log("Listings fetched:", listingsData);
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

  const handleCreateListingClick = () => {
    navigate(`/create-listing/${competitionId}`)
  };

  const handleGoBack = () => {
    navigate("/competitions");
  };

  const handleInterest = (listingId) => {
    if (!auth.user) {
      navigate("/auth");
      return;
    }
    // Logic to express interest
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
      <Button variant="contained" color="primary" onClick={handleCreateListingClick}>
        + Create Listing
      </Button>
      <div className="listings-grid">
        {filteredListings.map(listing => (
          <div key={listing.id} className="listing-item" onClick={() => handleListingClick(listing.id)}>
            <div className="listing-details">
              <img src={listing.imageUrl} alt={listing.name} className="listing-image" />
              <span className="listing-name">{listing.name}</span>
              <span className="listing-price">${listing.price}</span>
              {auth.user && auth.user.uid === listing.ownerId ? (
                <Button variant="contained" color="secondary" onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}>
                  Delete
                </Button>
              ) : auth.user && (
                <Button variant="contained" color="primary" onClick={(e) => { e.stopPropagation(); handleInterest(listing.id); }}>
                  I'm Interested
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listings;
