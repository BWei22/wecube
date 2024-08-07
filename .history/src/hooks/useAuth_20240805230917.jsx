import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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

  const auth = getAuth();

  const signinWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    const currentUser = auth.currentUser;

    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      // Prompt user to create a username
      return { user: currentUser, isNewUser: true };
    }

    setUser(currentUser);
    return { user: currentUser, isNewUser: false };
  };

  const signupWithEmailAndPassword = async (email, password, username) => {
    await createUserWithEmailAndPassword(auth, email, password);
    const currentUser = auth.currentUser;
    await setDoc(doc(db, 'users', currentUser.uid), { username });
    setUser(currentUser);
  };

  const signinWithEmailAndPassword = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    const currentUser = auth.currentUser;
    setUser(currentUser);
  };

  const signout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        // Fetch username from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser((prevUser) => ({
            ...prevUser,
            username: userDocSnap.data().username,
          }));
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    signinWithGoogle,
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
  };
}
