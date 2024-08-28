import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
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

  const handleContactSeller = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to contact the seller.');
      navigate('/login');  // Redirect to the login page if the user is not authenticated
      return;
    }

    const conversationId = `${listingId}_${auth.currentUser.uid}_${listing.userId}`;

    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);

      if (!conversationDoc.exists()) {
        await setDoc(conversationRef, {
          listingId,
          participants: [auth.currentUser.uid, listing.userId],
          createdAt: serverTimestamp(),
          lastMessage: '',
          unreadBy: [listing.userId], 
        });
      }

      navigate(`/conversations?selected=${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!listing) {
    return <p>Loading...</p>;
  }

  return (
    <div className="listing-container">
      <Button className="back-button" onClick={handleGoBack} style={{ marginBottom: '20px' }}>
        Back
      </Button>
      <img src={listing.imageUrl} alt={listing.name} className="listing-image" />
      <div className="listing-info">
        <h2>{listing.name}</h2>
        <p>Puzzle Type: {listing.puzzleType}</p>
        <p>Price: ${listing.price}</p>
        <p>Usage: {listing.usage}</p>
        <p>Description: {listing.description}</p>
        <p>Seller: </p>
        {listing.userId !== auth.currentUser?.uid && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              if (auth.currentUser) {
                handleContactSeller();  // Handle contacting the seller
              } else {
                navigate('/login', { state: { from: location.pathname } });  // Redirect to login
              }
            }}
          >
            Contact the Seller
          </Button>
        )}

      </div>
    </div>
  );
};

export default ListingDetails;
