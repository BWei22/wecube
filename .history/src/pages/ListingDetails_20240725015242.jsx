import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./ListingDetails.css"; // Import the CSS file for styling

const ListingDetails = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);

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

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="listing-details-page">
      <h2>{listing.name}</h2>
      <img src={listing.imageUrl} alt={listing.name} className="listing-image" />
      <p><strong>Price:</strong> ${listing.price}</p>
      <p><strong>Usage:</strong> {listing.usage}</p>
      <p><strong>Description:</strong> {listing.description}</p>
    </div>
  );
};

export default ListingDetails;
