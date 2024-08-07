import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
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
  const navigate = useNavigate();

  const checkUserExists = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  };

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (await checkUserExists(user.uid)) {
      setUser(user);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      setUsername(userDoc.data().username);
      navigate('/competitions');
    } else {
      navigate('/complete-profile', { state: { user } });
    }
  };

  const completeProfile = async (user, username) => {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { username });
    setUser(user);
    setUsername(username);
    navigate('/competitions');
  };

  const signupWithEmailAndPassword = async (email, password, username) => {
    const auth = getAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    await setDoc(doc(db, 'users', user.uid), { username });
    setUser(user);
    setUsername(username);
  };

  const signout = async (callback) => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    setUsername('');
    if (callback) callback();
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
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
    signupWithEmailAndPassword,
    completeProfile,
    signout,
  };
}
