import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './Listings.css';

const Listings = () => {
  const { competitionId } = useParams();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(collection(db, 'listings'), where('competitionId', '==', competitionId));
        const querySnapshot = await getDocs(q);
        const fetchedListings = [];
        querySnapshot.forEach((doc) => {
          fetchedListings.push({ id: doc.id, ...doc.data() });
        });
        setListings(fetchedListings);
      } catch (error) {
        setError('Error fetching listings');
      }
    };

    fetchListings();
  }, [competitionId]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="listings">
      <h2>Listings for Competition</h2>
      {listings.length > 0 ? (
        listings.map((listing) => (
          <div key={listing.id} className="listing">
            <h3>{listing.name}</h3>
            <p>Price: {listing.price}</p>
            <p>Usage: {listing.usage}</p>
            <p>Description: {listing.description}</p>
            {listing.imageUrl && <img src={listing.imageUrl} alt={listing.name} />}
          </div>
        ))
      ) : (
        <p>No listings found for this competition.</p>
      )}
    </div>
  );
};

export default Listings;
