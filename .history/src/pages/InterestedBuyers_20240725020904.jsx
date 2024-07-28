import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Button from '@mui/material/Button';

const InterestedBuyers = () => {
  const { listingId } = useParams();
  const [buyers, setBuyers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterestedBuyers = async () => {
      const q = query(collection(db, "interests"), where("listingId", "==", listingId));
      const querySnapshot = await getDocs(q);
      const buyersData = querySnapshot.docs.map(doc => doc.data());
      setBuyers(buyersData);
    };

    fetchInterestedBuyers();
  }, [listingId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="interested-buyers">
      <Button onClick={handleGoBack}>Back</Button>
      <h2>Interested Buyers</h2>
      <ul>
        {buyers.map((buyer, index) => (
          <li key={index}>
            User ID: {buyer.userId} - Timestamp: {new Date(buyer.timestamp.seconds * 1000).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InterestedBuyers;
