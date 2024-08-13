// src/hooks/useAuth.jsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the import path as necessary
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
  const navigate = useNavigate(); // Add the navigate hook here

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    setUser(auth.currentUser);

    // Fetch username from Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUsername(userDocSnap.data().username);
    } else {
      setUsername('');
    }

    navigate('/competitions'); // Navigate to competitions page after login
  };

  const signinWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
    setUser(auth.currentUser);

    // Fetch username from Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUsername(userDocSnap.data().username);
    } else {
      setUsername('');
    }

    navigate('/competitions'); // Navigate to competitions page after login
  };

  const signout = async (callback) => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    setUsername('');
    if (callback) callback();
  };

  const signupWithEmailAndPassword = async (email, password, username) => {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if username already exists
    const usernamesRef = doc(db, 'usernames', username);
    const usernameSnap = await getDoc(usernamesRef);
    if (usernameSnap.exists()) {
      throw new Error('Username already taken');
    }

    // Save user profile and username
    await setDoc(doc(db, 'users', user.uid), { username, email });
    await setDoc(usernamesRef, { userId: user.uid });

    setUser(user);
    setUsername(username);

    navigate('/competitions'); // Navigate to competitions page after signup
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Fetch username from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUsername(userDocSnap.data().username);
        } else {
          setUsername('');
        }
      } else {
        setUser(null);
        setUsername('');
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    username,
    signinWithGoogle,
    signinWithEmailAndPassword,
    signupWithEmailAndPassword,
    signout,
  };
}