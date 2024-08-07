import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, EmailAuthProvider, linkWithCredential, fetchSignInMethodsForEmail } from 'firebase/auth';
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
  const [newUser, setNewUser] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false); // New state
  const navigate = useNavigate();

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;

    const userDocRef = doc(db, 'users', googleUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      setUser(googleUser);
      setUsername(userDocSnap.data().username);
      setNewUser(false);
      setProfileComplete(true); // Profile is complete if username exists
      navigate('/competitions');
    } else {
      setUser(googleUser);
      setNewUser(true);
      setProfileComplete(false); // Profile is not complete
      navigate('/complete-profile');
    }
  };

  const signupWithEmailAndPassword = async (email, password, username) => {
    const auth = getAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await setDoc(doc(db, 'users', user.uid), { username });

    setUser(user);
    setUsername(username);
    setNewUser(false);
    setProfileComplete(true); // Profile is complete
    navigate('/competitions');
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
      setProfileComplete(true); // Profile is complete
      navigate('/competitions');
    } else {
      navigate('/signup');
    }
  };

  const signout = async (callback) => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    setUsername('');
    setProfileComplete(false); // Reset profile complete state
    if (callback) callback();
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
          setProfileComplete(true); // Profile is complete
          setNewUser(false);
        } else {
          setUser(user);
          setProfileComplete(false); // Profile is not complete
          setNewUser(true);
        }
      } else {
        setUser(null);
        setUsername('');
        setProfileComplete(false); // Reset profile complete state
        setNewUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    username,
    newUser,
    profileComplete, // Expose profileComplete state
    setUsername,
    signinWithGoogle,
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
  };
}
