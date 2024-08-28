import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, deleteDoc, doc, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // For three-dot icon
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './Listings.css'; 

const puzzleTypes = [
  "3x3", "2x2", "4x4", "5x5", "6x6", "7x7", 
  "Megaminx", "Pyraminx", "Skewb", "Square-1", 
  "Clock", "Non-WCA", "Miscellaneous"
];

const Listings = () => {
  const { competitionId } = useParams();
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPuzzleType, setSelectedPuzzleType] = useState('');
  const [sortOrder, setSortOrder] = useState('chronological');
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "listings"), where("competitionId", "==", competitionId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listingsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setListings(listingsData);
    }, error => {
      console.error("Error fetching listings:", error);
    });

    return () => unsubscribe();
  }, [competitionId]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "listings", id));
      console.log("Listing successfully deleted!");
    } catch (error) {
      console.error("Error deleting listing:", error);
    } finally {
      setDeleteConfirmationOpen(false);
      setListingToDelete(null);
    }
  };

  const handleDeleteClick = (id) => {
    setListingToDelete(id);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setListingToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (listingToDelete) {
      handleDelete(listingToDelete);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  const filteredListings = listings
    .filter(listing =>
      listing.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedPuzzleType === '' || listing.puzzleType === selectedPuzzleType)
    )
    .sort((a, b) => {
      if (sortOrder === 'priceLowToHigh') {
        return a.price - b.price;
      } else if (sortOrder === 'priceHighToLow') {
        return b.price - a.price;
      } else {
        return b.createdAt - a.createdAt;
      }
    });

  const handleCreateListingClick = (competitionId) => {
    navigate(`/create-listing/${competitionId}`);
  }

  const handleGoBack = () => {
    navigate("/competitions");
  };

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  return (
    <div className="listings">
      <Button onClick={handleGoBack}>Back</Button>
      <h2>Listings for {competitionId}</h2>
      <TextField
        label="Search Listings"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="filters">
        <div>
          <label>Puzzle Type:</label>
          <select onChange={(e) => setSelectedPuzzleType(e.target.value)} value={selectedPuzzleType}>
            <option value="">All</option>
            {puzzleTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Sort By:</label>
          <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
            <option value="chronological">Newest</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
          </select>
        </div>
      </div>

      <Button variant="contained" color="primary" onClick={() => handleCreateListingClick(competitionId)}>
        + Create Listing
      </Button>
      <div className="listings-grid">
        {filteredListings.map(listing => (
          <div key={listing.id} className="listing-item" onClick={() => handleListingClick(listing.id)}>
            <img src={listing.imageUrl} alt={listing.name} className="listing-image" />
            <div className="listing-info">
              <span className="listing-name">{listing.name}</span>
              <span className="listing-price">${listing.price}</span>
            </div>
            {auth.currentUser && listing.userId === auth.currentUser.uid && (
              <>
                <Button variant="contained" color="secondary" onClick={(e) => { e.stopPropagation(); handleDeleteClick(listing.id); }}>
                  Delete
                </Button>
                <Button variant="contained" color="primary" onClick={(e) => { e.stopPropagation(); handleEdit(listing.id); }}>
                  Edit
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={deleteConfirmationOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this listing? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Listings;
