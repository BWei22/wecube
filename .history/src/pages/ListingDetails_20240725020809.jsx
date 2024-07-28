import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from '@mui/material/Button';
import './ListingDetails.css';

const ListingDetails = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchListing();
  }, [listingId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="listing-details">
      <Button onClick={handleGoBack}>Back</Button>
      {listing ? (
        <div>
          <img src={listing.imageUrl} alt={listing.name} className="listing-image-large" />
          <h2>{listing.name}</h2>
          <p><strong>Price:</strong> ${listing.price}</p>
          <p><strong>Usage:</strong> {listing.usage}</p>
          <p><strong>Description:</strong> {listing.description}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ListingDetails;
