// src/hooks/useAuth.jsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser, EmailAuthProvider } from 'firebase/auth';
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
  const navigate = useNavigate();

  const logState = (message) => {
    console.log(message);
    console.log("User:", user);
    console.log("Username:", username);
    console.log("ProfileComplete:", profileComplete);
  };

  const handleAuthStateChange = async (firebaseUser) => {
    if (firebaseUser) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUser(firebaseUser);
        setUsername(userData.username);
        setProfileComplete(userData.profileComplete);
        logState("Auth state changed: user signed in");
        if (userData.profileComplete) {
          navigate('/competitions');
        } else {
          navigate('/complete-profile');
        }
      } else {
        console.log('No user document found in Firestore.');
        await setDoc(userDocRef, { profileComplete: false });
        setUser(firebaseUser);
        setProfileComplete(false);
        logState("Auth state changed: new user, redirected to complete profile");
        navigate('/complete-profile');
      }
    } else {
      setUser(null);
      setUsername('');
      setProfileComplete(false);
      logState("Auth state changed: user signed out");
    }
  };

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    handleAuthStateChange(result.user);
  };

  const signupWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    handleAuthStateChange(result.user);
  };

  const signinWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    handleAuthStateChange(result.user);
  };

  const signout = async (callback) => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    setUsername('');
    setProfileComplete(false);
    logState("User signed out");
    if (callback) callback();
  };

  const deleteUserAccount = async () => {
    const auth = getAuth();
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);
      await deleteUser(auth.currentUser);
      setUser(null);
      setUsername('');
      setProfileComplete(false);
      logState("User account deleted");
      navigate('/');
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
    signinWithGoogle,
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
    deleteUserAccount,
  };
}
