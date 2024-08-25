import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Flag from "react-world-flags";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import "./Competitions.css"; 

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("current");
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/competitions-page-1.json')
      .then(response => response.json())
      .then(data => {
        setCompetitions(data.items);
      })
      .catch(error => console.error('Error fetching competitions:', error));
  }, []);

  const handleCompetitionClick = (competitionId) => {
    navigate(`/listings/${competitionId}`);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const currentDate = new Date();
  const pastMonthDate = new Date();
  pastMonthDate.setMonth(currentDate.getMonth() - 1);

  const filteredCompetitions = competitions.filter(comp => {
    const competitionEndDate = new Date(comp.date.till + );
    const competitionStartDate = new Date(comp.date.from);
    const isUpcoming = competitionStartDate >= currentDate;
    const isRightNow = competitionStartDate <= currentDate && competitionEndDate >= currentDate;
    const isPastMonth = competitionEndDate < currentDate && competitionEndDate >= pastMonthDate;

    if (view === "current") {
      return (isUpcoming || isRightNow) && (
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (view === "past") {
      return isPastMonth && (
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return false;
  });

  const sortedCompetitions = filteredCompetitions.sort((a, b) => {
    if (view === "past") {
      return new Date(b.date.till) - new Date(a.date.till);
    } else {
      return new Date(a.date.from) - new Date(b.date.from);
    }
  });

  const handleGoBack = () => {
    navigate("/");
  };

  const formatDateRange = (from, till) => {
    // Parse the date strings and create Date objects in UTC
    const fromDate = new Date(`${from}T00:00:00Z`);
    const tillDate = new Date(`${till}T00:00:00Z`);
  
    // Options for formatting the dates
    const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
  
    // Use Intl.DateTimeFormat to ensure the date is treated as UTC and displayed consistently
    const fromDateString = new Intl.DateTimeFormat('en-US', options).format(fromDate);
    const tillDateString = new Intl.DateTimeFormat('en-US', options).format(tillDate);
  
    if (fromDateString === tillDateString) {
      return fromDateString;
    } else {
      return `${fromDateString} - ${tillDateString}`;
    }
  };
  
  


  return (
    <div className="competitions">
      <Button onClick={handleGoBack}>Back</Button>
      <h2>{view === "current" ? "Current Competitions" : "Past Month Competitions"}</h2>
      <div className="view-toggle">
        <Button 
          variant={view === "current" ? "contained" : "outlined"} 
          onClick={() => setView("current")}
        >
          Current
        </Button>
        <Button 
          variant={view === "past" ? "contained" : "outlined"} 
          onClick={() => setView("past")}
        >
          Past Month
        </Button>
      </div>
      <TextField
        label="Search Competitions"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <ul className="competitions-list">
        {sortedCompetitions.map(comp => (
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
