import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

const InterestedBuyers = () => {
  const { listingId } = useParams();
  const [buyers, setBuyers] = useState([]);
  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      const q = query(
        collection(db, "interests"),
        where("listingId", "==", listingId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const buyersData = snapshot.docs.map(doc => doc.data());
        setBuyers(buyersData);
      });

      return () => unsubscribe();
    }
  }, [auth.user, listingId]);

  return (
    <div>
      <h2>Interested Buyers</h2>
      <ul>
        {buyers.map((buyer, index) => (
          <li key={index}>{buyer.userName} is interested in this puzzle.</li>
        ))}
      </ul>
    </div>
  );
};

export default InterestedBuyers;
