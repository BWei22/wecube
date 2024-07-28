// src/pages/Conversations.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'messages'), where('senderId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const convos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!convos.find(c => c.listingId === data.listingId)) {
          convos.push(data);
        }
      });
      setConversations(convos);
    });

    return () => unsubscribe();
  }, []);

  const handleConversationClick = (listingId) => {
    navigate(`/messages/${listingId}`);
  };

  return (
    <div>
      <h2>Conversations</h2>
      <ul>
        {conversations.map((convo, index) => (
          <li key={index} onClick={() => handleConversationClick(convo.listingId)}>
            <p>Conversation for listing: {convo.listingId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Conversations;
