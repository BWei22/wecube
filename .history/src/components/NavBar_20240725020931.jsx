import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "@mui/material/Button";
import "./NavBar.css"; // Create this CSS file for styling

const NavBar = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signout(() => navigate("/"));
  };

  return (
    <div className="navbar">
      <Link to="/">Home</Link>
      <Link to="/competitions">Competitions</Link>
      {auth.user ? (
        <>
          <Button onClick={handleLogout}>Logout</Button>
        </>
      ) : (
        <Link to="/auth">Login</Link>
      )}
    </div>
  );
};

export default NavBar;
