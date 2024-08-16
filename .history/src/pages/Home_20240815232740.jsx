import React from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="home">
      <h1>WeCube</h1>
      <h3>Puzzles for Everyone</h3>
      <Button variant="contained" color="primary" onClick={handleLogin}>
        Login
      </Button>
      <Button variant="contained" color="secondary" onClick={handleSignUp}>
        Sign Up
      </Button>
    </div>
  );
};

export default Home;
