// src/hooks/useAuth.jsx
import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, query, where, collection, getDocs } from 'firebase/firestore';
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
  const [profileComplete, setProfileComplete] = useState(false);
  const navigate = useNavigate();

  const linkEmailPasswordWithGoogle = async (email, password) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(email, password);

    try {
      await user.linkWithCredential(credential);
      console.log("Accounts linked successfully");
    } catch (error) {
      console.error("Error linking accounts: ", error);
    }
  };

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log('User data from Firestore:', userData);
      setUser(user);
      setUsername(userData.username);
      setProfileComplete(userData.profileComplete);
      if (userData.profileComplete) {
        navigate('/competitions');
      } else {
        navigate('/complete-profile');
      }
    } else {
      const existingUserQuery = await getDocs(
        query(collection(db, "users"), where("email", "==", user.email))
      );

      if (!existingUserQuery.empty) {
        const existingUser = existingUserQuery.docs[0];
        const email = existingUser.data().email;
        const password = prompt("Enter your password to link your account:");
        await linkEmailPasswordWithGoogle(email, password);
      }

      await setDoc(userDocRef, { profileComplete: false });
      console.log('New user document created in Firestore.');
      setUser(user);
      setProfileComplete(false);
      navigate('/complete-profile');
    }
  };

  const signupWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { profileComplete: false });
    console.log('New user signed up with email and password. User document created in Firestore.');

    setUser(user);
    setProfileComplete(false);
    navigate('/complete-profile');
  };

  const signinWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log('User data from Firestore:', userData);
      setUser(user);
      setUsername(userData.username);
      setProfileComplete(userData.profileComplete);
      if (userData.profileComplete) {
        navigate('/competitions');
      } else {
        navigate('/complete-profile');
      }
    } else {
      navigate('/signup');
    }
  };

  const signout = async (callback) => {
    const auth = getAuth();
    await signOut(auth);
    setUser(null);
    setUsername('');
    setProfileComplete(false);
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
          const userData = userDocSnap.data();
          console.log('User data from Firestore:', userData);
          setUser(user);
          setUsername(userData.username);
          setProfileComplete(userData.profileComplete);
          if (!userData.profileComplete) {
            navigate('/complete-profile');
          }
        } else {
          console.log('No user document found in Firestore.');
          setUser(user);
          setProfileComplete(false);
          navigate('/complete-profile');
        }
      } else {
        console.log('No user is signed in.');
        setUser(null);
        setUsername('');
        setProfileComplete(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    username,
    profileComplete,
    newUser,
    setUsername,
    setProfileComplete,
    signinWithGoogle,
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
    deleteUserAccount,
  };
}
