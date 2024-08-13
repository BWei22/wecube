// src/components/NavBar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import './NavBar.css';

const NavBar = () => {
  const { user, username, signout, loading } = useAuth();
  const navigate = useNavigate();
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    if (!user || loading) {
      return;
    }

    // Example logic for fetching messages, etc.
  }, [user, loading]);

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
