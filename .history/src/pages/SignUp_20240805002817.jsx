import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import './SignUp.css';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signinWithGoogle, setUserUsername, checkUsernameUnique, user, loading } = useAuth();

  const handleGoogleSignUp = async () => {
    try {
      await signinWithGoogle();
    } catch (error) {
      console.error("Error during sign-up:", error);
      setError("Error during sign-up. Please try again.");
    }
  };

  const handleSetUsername = async () => {
    try {
      const isUnique = await checkUsernameUnique(username);
      if (isUnique) {
        await setUserUsername(username);
        navigate("/");
      } else {
        setError("Username already exists. Please choose another one.");
      }
    } catch (error) {
      console.error("Error setting username:", error);
      setError(error.message);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setError(""); // Clear error message when user starts typing
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {!user ? (
        <Button variant="contained" color="primary" onClick={handleGoogleSignUp}>
          Sign Up with Google
        </Button>
      ) : (
        <>
          <TextField
            label="Choose a Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={handleUsernameChange}
            required
          />
          <Button variant="contained" color="primary" onClick={handleSetUsername}>
            Set Username
          </Button>
        </>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SignUp;
