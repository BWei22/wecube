import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import './Conversations.css';
import Message from './Message'; // Import the Message component

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [listings, setListings] = useState({});
  const [usernames, setUsernames] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null); // State to track selected conversation
  const location = useLocation();

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

    const handleSnapshot = (querySnapshot) => {
      const convos = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const conversationId = `${data.listingId}_${data.senderId}_${data.recipientId}`;
        if (!convos.find((c) => c.id === conversationId)) {
          convos.push({ ...data, id: conversationId });
        }
      });
      setConversations((prev) => [...new Map([...prev, ...convos].map(item => [item.id, item])).values()]);
    };

    const unsubscribe = onSnapshot(q, handleSnapshot);
    const unsubscribe2 = onSnapshot(q2, handleSnapshot);

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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      const selected = conversations.find(convo => convo.id === selectedId);
      if (selected) {
        setSelectedConversation(selected);
      }
    }
  }, [location.search, conversations]);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read
    const q = query(
      collection(db, 'messages'),
      where('listingId', '==', conversation.listingId),
      where('recipientId', '==', auth.currentUser.uid),
      where('isRead', '==', false)
    );

    onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach(async (doc) => {
        await doc.ref.update({ isRead: true });
      });
    });
  };

  return (
    <div className="conversations-container">
      <div className="conversations-list">
        {conversations.map((convo, index) => {
          const isUnread = !convo.isRead && convo.recipientId === auth.currentUser.uid;
          return (
            <div
              key={index}
              className={`conversation-item ${isUnread ? 'unread' : ''}`}
              onClick={() => handleConversationClick(convo)}
            >
              <p className="conversation-title">{listings[convo.listingId] || convo.listingId}</p>
              <p className="conversation-username">
                {usernames[convo.senderId === auth.currentUser.uid ? convo.recipientId : convo.senderId] || 'Unknown'}
              </p>
              <p className="conversation-preview">
                {convo.message}
              </p>
              {isUnread && <span className="unread-dot">•</span>}
            </div>
          );
        })}
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
