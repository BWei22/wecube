import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, doc, getDoc, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './Message.css';

const Message = ({ listingId, conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [usernames, setUsernames] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchRecipientId = async () => {
      try {
        const docRef = doc(db, 'listings', listingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRecipientId(docSnap.data().userId);
        }
      } catch (error) {
        console.error('Error fetching recipient ID:', error);
      }
    };

    fetchRecipientId();

    const q = query(collection(db, 'messages'), where('conversationId', '==', conversationId), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      const userIds = new Set();
      querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        msgs.push(data);
        userIds.add(data.senderId);
        if (data.recipientId === auth.currentUser.uid && !data.isRead) {
          await updateDoc(doc.ref, { isRead: true });
        }
      });
      setMessages(msgs);
      userIds.forEach(async (userId) => {
        if (!usernames[userId]) {
          const userDocRef = doc(db, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUsernames((prevUsernames) => ({
              ...prevUsernames,
              [userId]: userDocSnap.data().username,
            }));
          }
        }
      });
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [listingId, conversationId, usernames]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!auth.currentUser) {
      console.error('User not authenticated');
      return;
    }

    try {
      const messageRef = await addDoc(collection(db, 'messages'), {
        conversationId,
        listingId,
        senderId: auth.currentUser.uid,
        recipientId,
        message: newMessage,
        timestamp: serverTimestamp(),
        isRead: false,
      });

      // Update the lastMessage field in the corresponding conversation document
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: newMessage,
        lastMessageTimestamp: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.senderId === auth.currentUser.uid ? 'sent' : 'received'}`}>
            <div className={`message-content ${msg.senderId === auth.currentUser.uid ? '' : 'received'}`}>
              <p>{msg.message}</p>
            </div>
            <div className="message-sender">
              <small>{usernames[msg.senderId] || 'Unknown'}</small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input">
        <TextField
          label="Type a message"
          variant="outlined"
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} variant="contained" color="primary">
          Send
        </Button>
      </div>
    </div>
  );
};

export default Message;
