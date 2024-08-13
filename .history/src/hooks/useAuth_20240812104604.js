import React, { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AuthContext = createContext();

export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return React.createElement(
    AuthContext.Provider,
    { value: auth },
    children
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(user);
          setUsername(userDocSnap.data().username || '');
        }
      } else {
        setUser(null);
        setUsername('');
      }
    });

    return unsubscribe;
  }, [auth]);

  const signupWithEmailAndPassword = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    return user;
  };

  const signinWithEmailAndPassword = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    return user;
  };

  const signout = async () => {
    await signOut(auth);
    setUser(null);
    setUsername('');
  };

  return {
    user,
    username,
    setUser,          // Ensure setUser is exposed to the context
    setUsername,      // Ensure setUsername is exposed to the context
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
  };
}
