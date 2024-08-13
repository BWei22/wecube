import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const authContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return React.createElement(
    authContext.Provider,
    { value: auth },
    !auth.loading ? children : null
  );
}

export const useAuth = () => {
  return useContext(authContext);
};

export const AuthProvider = ProvideAuth;

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [newUser, setNewUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const signupWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
  
    // Do not set the user as fully authenticated yet
    setUser(null); // Temporarily nullify the user until the username is set
    setNewUser(true); // Indicate that this is a new user who needs to complete their profile
  
    // Store the UID and email in the navigate state for use in the CompleteProfile component
    navigate('/complete-profile', { state: { email, uid: user.uid } });
    setLoading(false); // Set loading to false after the operation completes
  };
  

  const signinWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().username) {
      setUser(user);
      setUsername(userDocSnap.data().username);
      setNewUser(false);
      navigate('/competitions');
    } else {
      // If no username is set, redirect to complete profile
      setUser(null);
      navigate('/complete-profile');
    }
    setLoading(false); // Set loading to false after the operation completes
  };

  const signout = async (callback) => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    setUsername('');
    setNewUser(false);
    setLoading(false); // Set loading to false after the operation completes
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

        if (userDocSnap.exists() && userDocSnap.data().username) {
          setUser(user);
          setUsername(userDocSnap.data().username);
          setNewUser(false);
        } else {
          setUser(null); // Clear user if they do not have a valid username
        }
      } else {
        setUser(null);
        setUsername('');
        setNewUser(false);
      }
      setLoading(false); // Set loading to false after the operation completes
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    username,
    newUser,
    loading, // Include the loading state in the returned value
    setUsername,
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
    deleteUserAccount,
  };
}
