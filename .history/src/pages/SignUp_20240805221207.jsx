import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthComponent.css'; // Import the CSS for styling

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    try {
      await auth.signUpWithEmail(email, password, username);
      navigate('/');
    } catch (error) {
      setError(error.message);
      console.error('Error signing up with email and password:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await auth.signinWithGoogle();
      navigate('/');
    } catch (error) {
      setError(error.message);
      console.error('Error signing up with Google:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Your Account</h2>
      <form onSubmit={handleEmailSignUp} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <div className="auth-divider">OR</div>
      <button onClick={handleGoogleSignUp} className="google-button">
        Continue with Google
      </button>
      <p>
        Already have an account? <a href="/auth">Login</a>
      </p>
    </div>
  );
};

export default SignUp;
