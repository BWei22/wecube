import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import Button from '@mui/material/Button';
import "./listing"

const ListingDetails = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [sellerUsername, setSellerUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, 'listings', listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const listingData = docSnap.data();
          setListing(listingData);

          const sellerDocRef = doc(db, 'users', listingData.userId);
          const sellerDocSnap = await getDoc(sellerDocRef);
          if (sellerDocSnap.exists()) {
            setSellerUsername(sellerDocSnap.data().username);
          }
        } else {
          setError('Listing not found');
        }
      } catch (error) {
        setError('Error fetching listing');
      }
    };

    fetchListing();
  }, [listingId]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'listings', listingId));
      navigate('/competitions');
    } catch (error) {
      setError('Error deleting listing');
    }
  };

  const handleContactSeller = async () => {
    if (!auth.currentUser) {
      navigate('/auth');
      return;
    }

    try {
      const q = query(
        collection(db, 'messages'),
        where('listingId', '==', listingId),
        where('senderId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        navigate(`/messages/${listingId}`);
      } else {
        navigate(`/messages/${listingId}`);
      }
    } catch (error) {
      console.error('Error checking for existing conversation:', error);
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!listing) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{listing.name}</h2>
      <p>Price: {listing.price}</p>
      <p>Usage: {listing.usage}</p>
      <p>Description: {listing.description}</p>
      <p>Seller: {sellerUsername}</p>
      {listing.imageUrl && <img src={listing.imageUrl} alt={listing.name} />}
      {auth.currentUser && auth.currentUser.uid === listing.userId ? (
        <Button onClick={handleDelete} variant="contained" color="secondary">
          Delete Listing
        </Button>
      ) : (
        <Button onClick={handleContactSeller} variant="contained" color="primary">
          Contact the Seller
        </Button>
      )}
    </div>
  );
};

export default ListingDetails;
