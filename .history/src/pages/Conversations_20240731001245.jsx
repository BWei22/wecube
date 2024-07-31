import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, getDocs, orderBy, limit } from 'firebase/firestore'; // Ensure orderBy and limit are imported
import { useLocation } from 'react-router-dom';
import './Conversations.css';
import Message from './Message';

const Conversations = ({ onNewMessage }) => {
  const [conversations, setConversations] = useState([]);
  const [listings, setListings] = useState({});
  const [usernames, setUsernames] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', auth.currentUser.uid)
    );

    const handleSnapshot = async (querySnapshot) => {
      const convos = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const lastMessageQuery = query(
          collection(db, 'messages'),
          where('conversationId', '==', doc.id),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const lastMessageSnapshot = await getDocs(lastMessageQuery);
        const lastMessage = lastMessageSnapshot.docs.length > 0 ? lastMessageSnapshot.docs[0].data() : null;
        convos.push({ ...data, id: doc.id, lastMessage });
      }
      setConversations(convos);
    };

    const unsubscribe = onSnapshot(q, handleSnapshot);

    return () => {
      unsubscribe();
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
          const userDocRef = doc(db, 'users', convo.participants.find(id => id !== auth.currentUser.uid));
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            usernamesMap[convo.participants.find(id => id !== auth.currentUser.uid)] = userDocSnap.data().username;
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

  const handleConversationClick = async (conversation) => {
    setSelectedConversation(conversation);

    const q = query(
      collection(db, 'messages'),
      where('listingId', '==', conversation.listingId),
      where('recipientId', '==', auth.currentUser.uid),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q); // Fixed getDocs error
    querySnapshot.forEach(async (docSnapshot) => {
      await updateDoc(docSnapshot.ref, { isRead: true });
    });

    if (onNewMessage) {
      onNewMessage();
    }
  };

  return (
    <div className="conversations-container">
      <div className="conversations-list">
        {conversations.map((convo, index) => {
          const lastMessage = convo.lastMessage || '';
          const isUnread = convo.participants.includes(auth.currentUser.uid) && lastMessage.senderId !== auth.currentUser.uid && !lastMessage.isRead;
          return (
            <div
              key={index}
              className={`conversation-item ${isUnread ? 'unread' : ''}`}
              onClick={() => handleConversationClick(convo)}
            >
              <p className="conversation-title">{listings[convo.listingId] || convo.listingId}</p>
              <p className="conversation-username">
                {usernames[convo.participants.find(id => id !== auth.currentUser.uid)] || 'Unknown'}
              </p>
              <p className="conversation-preview">
                {lastMessage.message}
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
