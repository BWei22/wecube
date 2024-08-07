import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Correct import path
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import "./SignUp.css"; // Import the CSS file for styling

const SignUp = () => {
  const { signinWithGoogle, user } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSignUp = async () => {
    if (!user) {
      await signinWithGoogle();
    }

    // Check if the username already exists
    const usernamesQuery = query(collection(db, "users"), where("username", "==", username));
    const usernamesSnapshot = await getDocs(usernamesQuery);

    if (!usernamesSnapshot.empty) {
      setError("Username already exists. Please choose a different username.");
      return;
    }

    // Check if the user is already registered
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      setError("Account already exists with this email.");
      return;
    }

    // Register the new user
    await setDoc(userDocRef, {
      username,
      email: user.email,
    });

    navigate("/");
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={handleUsernameChange}
      />
      <Button variant="contained" color="primary" onClick={handleSignUp}>
        Sign Up with Google
      </Button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SignUp;
