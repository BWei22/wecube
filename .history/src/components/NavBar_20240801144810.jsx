import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import './NavBar.css';

const NavBar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [newMessages, setNewMessages] = useState(0);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const fetchUsername = async () => {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUsername(userDocSnap.data().username);
      }
    };

    fetchUsername();

    const q = query(collection(db, 'messages'), where('recipientId', '==', auth.currentUser.uid), where('isRead', '==', false));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNewMessages(querySnapshot.size);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleLogout = () => {
    auth.signout(() => navigate('/'));
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <Link to="/competitions">Competitions</Link>
      </div>
      <div className="navbar-right">
        {auth.user ? (
          <>
            <span className="navbar-username">Hello, {username}</span>
            <Badge badgeContent={newMessages} color="error">
              <Link to="/conversations">Conversations</Link>
            </Badge>
            <Link to="/profile">Profile</Link>
            <Button onClick={handleLogout} variant="contained" color="secondary">Logout</Button>
          </>
        ) : (
          <Button onClick={() => navigate('/auth')} variant="contained" color="primary">Login</Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
