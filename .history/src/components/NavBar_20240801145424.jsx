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
      console.log('No authenticated user found.');
      return;
    }

    const fetchUsername = async () => {
      try {
        console.log('Fetching username for user:', auth.currentUser.uid);
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          console.log('User document data:', userDocSnap.data());
          setUsername(userDocSnap.data().username);
        } else {
          console.log('No user document found.');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
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
            <Badge badgeContent={newMessages} color="error">
              <Link to="/conversations">Conversations</Link>
            </Badge>
            <Link to="/profile">Profile</Link>
            <Button onClick={handleLogout} variant="contained" color="secondary">Logout</Button>
            <span className="navbar-username">{username}</span>
          </>
        ) : (
          <Button onClick={() => navigate('/auth')} variant="contained" color="primary">Login</Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
