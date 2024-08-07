import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthComponent.css'; // Import the CSS for styling

const AuthComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await auth.signInWithEmail(email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
      console.error('Login failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await auth.signinWithGoogle();
      if (!auth.username) {
        navigate('/signup'); // Prompt for username if not set
      } else {
        navigate('/');
      }
    } catch (error) {
      setError(error.message);
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form onSubmit={handleEmailLogin} className="auth-form">
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
        {error && <p className="auth-error">{error}</p>}
        <button type="submit">Sign In</button>
      </form>
      <div className="auth-divider">OR</div>
      <button onClick={handleGoogleLogin} className="google-button">
        Continue with Google
      </button>
      <p>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
};

export default AuthComponent;
