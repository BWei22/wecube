import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUsername(docSnap.data().username);
      }
    };

    fetchUsername();

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let unreadCount = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.unreadBy && data.unreadBy.includes(auth.currentUser.uid)) {
          unreadCount += 1;
        }
      });
      setNewMessages(unreadCount);
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
            <Link to="/profile">{username}</Link>
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
