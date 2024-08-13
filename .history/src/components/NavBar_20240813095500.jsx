import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import './NavBar.css';

const NavBar = () => {
  const { user, username, signout } = useAuth();
  const navigate = useNavigate();
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    if (!user) {
      console.log('No authenticated user found.');
      return;
    }

    // Query Firestore for unread messages where the recipient is the current user
    const q = query(
      collection(db, 'messages'),
      where('recipientId', '==', user.uid),
      where('isRead', '==', false)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNewMessages(querySnapshot.size); // Set the count of new messages
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, [user]);

  const handleLogout = () => {
    signout(() => navigate('/'));
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <Link to="/competitions">Competitions</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <Badge badgeContent={newMessages} color="error">
              <Link to="/conversations">Conversations</Link>
            </Badge>
            <Link to="/profile">Profile</Link>
            <Button onClick={handleLogout} variant="contained" color="secondary">Logout</Button>
            <span className="navbar-username">{username}</span>
          </>
        ) : (
          <Button onClick={() => navigate('/login')} variant="contained" color="primary">Login</Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;