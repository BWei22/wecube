// src/hooks/useAuth.jsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
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
  const [newUser, setNewUser] = useState(false);
  const navigate = useNavigate();

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;

    // Check if there's an existing email/password account with the same email
    const email = googleUser.email;
    const userDocRef = doc(db, 'users', googleUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      setUser(googleUser);
      setUsername(userDocSnap.data().username);
      setNewUser(false);
      navigate('/competitions');
    } else {
      setUser(googleUser);
      setNewUser(true);
      navigate('/complete-profile');
    }
  };

  const signupWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    setUser(user);
    setNewUser(true);
    navigate('/complete-profile');
  };

  const signinWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      setUser(user);
      setUsername(userDocSnap.data().username);
      setNewUser(false);
      navigate('/competitions');
    } else {
      setUser(user);
      setNewUser(true);
      navigate('/complete-profile');
    }
  };

  const completeProfile = async (username) => {
    if (!user) throw new Error("User not authenticated");
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { username });
    setUsername(username);
    setNewUser(false);
    navigate('/competitions');
  };

  const signout = async (callback) => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    setUsername('');
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
      setNewUser(false);
      navigate('/');
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUser(user);
          setUsername(userDocSnap.data().username);
          setNewUser(false);
        } else {
          setUser(user);
          setNewUser(true);
        }
      } else {
        setUser(null);
        setUsername('');
        setNewUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    username,
    newUser,
    setUsername,
    signinWithGoogle,
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    completeProfile,
    signout,
    deleteUserAccount,
  };
}
