import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./NavBar.css"; // Add this import

const NavBar = () => {
  const auth = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/competitions">Competitions</Link></li>
        {auth.user ? (
          <>
            <li><Link to="/notifications">Notifications</Link></li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li><Link to="/auth">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
