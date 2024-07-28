import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Conversations.css'; // Create this CSS file for styling

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [listings, setListings] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', auth.currentUser.uid)
    );
    const q2 = query(
      collection(db, 'messages'),
      where('recipientId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const convos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!convos.find((c) => c.listingId === data.listingId)) {
          convos.push(data);
        }
      });
      setConversations((prev) => [...prev, ...convos]);
    });

    const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
      const convos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!convos.find((c) => c.listingId === data.listingId)) {
          convos.push(data);
        }
      });
      setConversations((prev) => [...prev, ...convos]);
    });

    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      const listingsMap = {};
      for (let convo of conversations) {
        const docRef = doc(db, 'listings', convo.listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          listingsMap[convo.listingId] = docSnap.data().name;
        }
      }
      setListings(listingsMap);
    };

    if (conversations.length > 0) {
      fetchListings();
    }
  }, [conversations]);

  const handleConversationClick = (listingId) => {
    navigate(`/messages/${listingId}`);
  };

  return (
    <div className="conversations-container">
      <h2>Conversations</h2>
      <ul className="conversations-list">
        {conversations.map((convo, index) => (
          <li key={index} className="conversation-item" onClick={() => handleConversationClick(convo.listingId)}>
            <p className="conversation-title">{listings[convo.listingId] || convo.listingId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Conversations;
