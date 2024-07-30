import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import './Navbar.css';

const Navbar = () => {
  const [newMessageCount, setNewMessageCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('recipientId', '==', auth.currentUser.uid),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNewMessageCount(querySnapshot.size);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/conversations">
        Conversations
        {newMessageCount > 0 && <span className="notification-badge">{newMessageCount}</span>}
      </Link>
      <Link to="/profile">Profile</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
};

export default Navbar;
