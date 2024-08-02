import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Flag from "react-world-flags";
import TextField from "@mui/material/TextField";
import "./Competitions.css"; // Import the CSS file for styling
import Button from '@mui/material/Button';

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/competitions-page-1.json')
      .then(response => response.json())
      .then(data => {
        const upcomingCompetitions = data.items
          .filter(comp => new Date(comp.date.from) >= new Date())
          .sort((a, b) => new Date(a.date.from) - new Date(b.date.from)); // Sort competitions chronologically
        setCompetitions(upcomingCompetitions);
      })
      .catch(error => console.error('Error fetching competitions:', error));
  }, []);

  const handleCompetitionClick = (competitionId) => {
    navigate(`/listings/${competitionId}`);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredCompetitions = competitions.filter(comp => 
    comp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    comp.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoBack = () => {
    navigate("/");
  };

  const formatDateRange = (from, till) => {
    const fromDate = new Date(from);
    const tillDate = new Date(till);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };

    if (fromDate.toDateString() === tillDate.toDateString()) {
      return fromDate.toLocaleDateString(undefined, options);
    } else {
      return `${fromDate.toLocaleDateString(undefined, options)} - ${tillDate.toLocaleDateString(undefined, options)}`;
    }
  };

  return (
    <div className="competitions">
      <Button onClick={handleGoBack}>Back</Button>
      <h2>Upcoming Competitions</h2>
      <TextField
        label="Search Competitions"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <ul className="competitions-list">
        {filteredCompetitions.map(comp => (
          <li key={comp.id} className="competition-item" onClick={() => handleCompetitionClick(comp.id)}>
            <div className="competition-flag">
              <Flag code={comp.country} height="24" />
            </div>
            <div className="competition-details">
              <span className="competition-name">{comp.name}</span>
              <span className="competition-date">
                {formatDateRange(comp.date.from, comp.date.till)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Competitions;
