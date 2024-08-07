import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Competitions from './pages/Competitions';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import ListingDetails from './pages/ListingDetails';
import InterestedBuyers from './pages/InterestedBuyers';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import NavBar from './components/NavBar';
import { ProvideAuth } from './hooks/useAuth';
import Message from './pages/Message';
import Conversations from './pages/Conversations';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SetUsername from './pages/SetUsername';
import './App.css'; // Import the global CSS

const App = () => {
  return (
    <Router>
      <ProvideAuth>
        <NavBar />
        <div className="main-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/listings/:competitionId" element={<Listings />} />
            <Route path="/create-listing/:competitionId" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
            <Route path="/listing/:listingId" element={<ListingDetails />} />
            <Route path="/interested-buyers/:listingId" element={<PrivateRoute><InterestedBuyers /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/auth" element={<Login />} />
            <Route path="/messages/:listingId" element={<PrivateRoute><Message /></PrivateRoute>} />
            <Route path="/conversations" element={<PrivateRoute><Conversations /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/set-username" element={<SetUsername />} />
          </Routes>
        </div>
      </ProvideAuth>
    </Router>
  );
};

export default App;
