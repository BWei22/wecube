// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

const Home = () => {
  const navigate = useNavigate();

  const handleFindCompetition = () => {
    navigate("/competitions");
  };

  return (
    <div className="home">
      <h1>WeCube</h1>z
      <Button variant="contained" color="primary" onClick={handleFindCompetition}>
        Find a Competition
      </Button>
    </div>
  );
};

export default Home;
