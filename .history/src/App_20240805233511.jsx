// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Competitions from './pages/Competitions';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import Login from './pages/Login'; // Import the Login component
import { ProvideAuth } from './hooks/useAuth';

function App() {
  return (
    <ProvideAuth>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/listings/:competitionId" element={<Listings />} />
          <Route path="/create-listing/:competitionId" element={<CreateListing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} /> {/* Add Login route */}
        </Routes>
      </Router>
    </ProvideAuth>
  );
}

export default App;
