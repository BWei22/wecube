import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import './Conversations.css';
import Message from './Message'; // Import the Message component

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [listings, setListings] = useState({});
  const [usernames, setUsernames] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null); // State to track selected conversation

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
    const fetchListingsAndUsernames = async () => {
      const listingsMap = {};
      const usernamesMap = {};
      for (let convo of conversations) {
        const docRef = doc(db, 'listings', convo.listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          listingsMap[convo.listingId] = docSnap.data().name;
          const userDocRef = doc(db, 'users', convo.senderId === auth.currentUser.uid ? convo.recipientId : convo.senderId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            usernamesMap[convo.senderId === auth.currentUser.uid ? convo.recipientId : convo.senderId] = userDocSnap.data().username;
          }
        }
      }
      setListings(listingsMap);
      setUsernames(usernamesMap);
    };

    if (conversations.length > 0) {
      fetchListingsAndUsernames();
    }
  }, [conversations]);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="conversations-container">
      <div className="conversations-list">
        {conversations.map((convo, index) => (
          <div key={index} className="conversation-item" onClick={() => handleConversationClick(convo)}>
            <p className="conversation-title">{listings[convo.listingId] || convo.listingId}</p>
            <p className="conversation-username">
              {usernames[convo.senderId === auth.currentUser.uid ? convo.recipientId : convo.senderId] || 'Unknown'}
            </p>
          </div>
        ))}
      </div>
      <div className="conversation-messages">
        {selectedConversation ? (
          <Message listingId={selectedConversation.listingId} />
        ) : (
          <p>Select a conversation to view messages</p>
        )}
      </div>
    </div>
  );
};

export default Conversations;
