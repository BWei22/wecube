import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [username, setUsername] = useState('');

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    setUser(auth.currentUser);

    // Fetch or set username from Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setUsername(userDocSnap.data().username);
    } else {
      setUsername('');
    }
  };

  const signupWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if the user already exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
      // If the user does not exist, prompt for username
      const username = prompt('Please enter a username:');
      const usernameDoc = await getDoc(doc(db, 'usernames', username));
      if (usernameDoc.exists()) {
        throw new Error('Username already exists. Please choose another one.');
      }

      // Add user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username,
      });

      // Save username to a separate collection to ensure uniqueness
      await setDoc(doc(db, 'usernames', username), {
        uid: user.uid,
      });
    }

    setUser(user);
    setUsername(userDocSnap.data().username);
  };

  const signinWithEmail = async (email, password) => {
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
  };

  const signupWithEmail = async (email, password, username) => {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if the username already exists
    const usernameDoc = await getDoc(doc(db, 'usernames', username));
    if (usernameDoc.exists()) {
      throw new Error('Username already exists. Please choose another one.');
    }

    // Add user to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      username,
    });

    // Save username to a separate collection to ensure uniqueness
    await setDoc(doc(db, 'usernames', username), {
      uid: user.uid,
    });

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
    signupWithGoogle,
    signinWithEmail,
    signupWithEmail,
    signout,
  };
}
