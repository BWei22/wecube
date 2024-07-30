import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import Button from '@mui/material/Button';
import './ListingDetails.css';

const ListingDetails = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
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

  const handleContactSeller = () => {
    if (!auth.currentUser) {
      alert('You must be logged in to contact the seller.');
      return;
    }

    const conversationId = `${listingId}_${auth.currentUser.uid}_${listing.userId}`;
    navigate(`/conversations?selected=${conversationId}`);
  };

  if (!listing) {
    return <p>Loading...</p>;
  }

  return (
    <div className="listing-container">
      <img src={listing.imageUrl} alt={listing.name} className="listing-image" />
      <div className="listing-info">
        <h2>{listing.name}</h2>
        <p>{listing.description}</p>
        <p>Price: ${listing.price}</p>
        {auth.currentUser && listing.userId !== auth.currentUser.uid && (
          <Button variant="contained" color="primary" onClick={handleContactSeller}>
            Contact the Seller
          </Button>
        )}
      </div>
    </div>
  );
};

export default ListingDetails;
