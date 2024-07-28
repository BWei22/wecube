import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Competitions from "./pages/Competitions";
import Listings from "./pages/Listings";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import InterestedBuyers from "./pages/InterestedBuyers";
import AuthComponent from "./components/AuthComponent";
import PrivateRoute from "./components/PrivateRoute";
import NavBar from "./components/NavBar"; // Import the NavBar component
import { ProvideAuth } from "./hooks/useAuth";

const App = () => {
  return (
    <ProvideAuth>
      <Router>
        <NavBar /> {/* Add the NavBar component here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/listings/:competitionId" element={<Listings />} />
          <Route path="/create-listing/:competitionId" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
          <Route path="/listing/:listingId" element={<ListingDetails />} />
          <Route path="/interested-buyers/:listingId" element={<PrivateRoute><InterestedBuyers /></PrivateRoute>} />
          <Route path="/auth" element={<AuthComponent />} />
        </Routes>
      </Router>
    </ProvideAuth>
  );
};

export default App;
