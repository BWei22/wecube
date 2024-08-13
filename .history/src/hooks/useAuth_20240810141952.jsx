// src/hooks/useAuth.jsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [authenticating, setAuthenticating] = useState(false);
  const navigate = useNavigate();

  const logState = (message) => {
    console.log(message);
    console.log("User:", user);
    console.log("Username:", username);
    console.log("ProfileComplete:", profileComplete);
  };

  const handleAuthStateChange = async (firebaseUser) => {
    if (firebaseUser) {
      setUser(firebaseUser); // Ensure user is set immediately
      setAuthenticating(true); 
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUsername(userData.username);
          setProfileComplete(userData.profileComplete);

          if (userData.profileComplete) {
            navigate('/competitions'); 
          } else {
            navigate('/complete-profile'); 
          }
        } else {
          await setDoc(userDocRef, { profileComplete: false });
          setProfileComplete(false);
          navigate('/complete-profile'); 
        }
      } catch (error) {
        console.error("Error handling user state change:", error);
      } finally {
        setAuthenticating(false);
      }
    } else {
      setUser(null);
      setUsername('');
      setProfileComplete(false);
      logState("Auth state changed: user signed out");
    }
  };

  const signupWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    try {
      setAuthenticating(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      handleAuthStateChange(result.user);
    } catch (error) {
      console.error("Sign-up error:", error);
    } finally {
      setAuthenticating(false);
    }
  };

  const signinWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    try {
      setAuthenticating(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleAuthStateChange(result.user);
    } catch (error) {
      console.error("Sign-in error:", error);
    } finally {
      setAuthenticating(false);
    }
  };

  const completeProfile = async (username) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { username, profileComplete: true }, { merge: true });
        setUsername(username);
        setProfileComplete(true);
        navigate('/competitions');
      } catch (error) {
        console.error("Error completing profile:", error);
      }
    } else {
      console.error("No user is authenticated when attempting to complete profile");
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
    authenticating,
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    completeProfile,
    signout,
  };
}
