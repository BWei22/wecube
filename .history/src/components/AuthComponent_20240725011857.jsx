import React, { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthComponent = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      navigate("/competitions");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Google</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default AuthComponent;
