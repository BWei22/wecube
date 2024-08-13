// src/hooks/useAuth.jsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [profileComplete, setProfileComplete] = useState(false);
  const [authenticating, setAuthenticating] = useState(false); // Indicates if the user is in the process of signing up or logging in
  const navigate = useNavigate();

  const logState = (message) => {
    console.log(message);
    console.log("User:", user);
    console.log("Username:", username);
    console.log("ProfileComplete:", profileComplete);
  };

  const handleAuthStateChange = async (firebaseUser) => {
    if (firebaseUser) {
      setAuthenticating(true); // Start authenticating
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUsername(userData.username);
          setProfileComplete(userData.profileComplete);

          if (userData.profileComplete) {
            setUser(firebaseUser); // User is fully signed in only if profile is complete
            navigate('/competitions'); // Navigate to main area of the app
          } else {
            navigate('/complete-profile'); // Redirect to complete profile
          }
        } else {
          await setDoc(userDocRef, { profileComplete: false });
          setProfileComplete(false);
          navigate('/complete-profile'); // Redirect to complete profile
        }
      } catch (error) {
        console.error("Error handling user state change:", error);
      } finally {
        setAuthenticating(false); // End authentication process
      }
    } else {
      // User is not authenticated
      setUser(null);
      setUsername('');
      setProfileComplete(false);
      logState("Auth state changed: user signed out");
    }
  };

  const signupWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    try {
      setAuthenticating(true); // Indicate that we're authenticating
      const result = await createUserWithEmailAndPassword(auth, email, password);
      handleAuthStateChange(result.user);
    } catch (error) {
      console.error("Sign-up error:", error);
    } finally {
      setAuthenticating(false); // End authentication process
    }
  };

  const signinWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    try {
      setAuthenticating(true); // Indicate that we're authenticating
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleAuthStateChange(result.user);
    } catch (error) {
      console.error("Sign-in error:", error);
    } finally {
      setAuthenticating(false); // End authentication process
    }
  };

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      setAuthenticating(true); // Indicate that we're authenticating
      const result = await signInWithPopup(auth, provider);
      handleAuthStateChange(result.user);
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setAuthenticating(false); // End authentication process
    }
  };

  const completeProfile = async (username) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });
        setUsername(username);
        setProfileComplete(true);
        setUser(user); // Now the user is fully signed in
        navigate('/competitions');
      } catch (error) {
        console.error("Error completing profile:", error);
      }
    }
  };

  const signout = async (callback) => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
      setUsername('');
      setProfileComplete(false);
      logState("User signed out");
      if (callback) callback();
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(handleAuthStateChange);
    return () => unsubscribe();
  }, []);

  return {
    user,
    username,
    profileComplete,
    authenticating, // Add this to the context
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signinWithGoogle, // Add Google sign-in method
    completeProfile, // Add a method to complete the profile
    signout,
  };
}
