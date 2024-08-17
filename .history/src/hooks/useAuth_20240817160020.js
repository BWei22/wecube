import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateEmail, 
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
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
          const userData = userDocSnap.data();
          
          // Check if there is a pending email update
          if (userData.pendingEmail && user.emailVerified) {
            try {
              // Update the email to the pending email
              await updateEmail(user, userData.pendingEmail);
              
              // Clear the pending email in Firestore
              await updateDoc(userDocRef, { email: userData.pendingEmail, pendingEmail: '' });

              console.log('Email successfully updated to:', userData.pendingEmail);
            } catch (error) {
              console.error('Failed to update email:', error);
            }
          }
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

  const updateUsername = async (newUsername) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { username: newUsername }, { merge: true });
      setUsername(newUsername);  // Update the username in context, triggering a re-render
    }
  };

  const updateEmailWithVerification = async (newEmail) => {
    if (user && newEmail !== user.email) {
      const credential = EmailAuthProvider.credential(user.email, prompt('Please enter your current password:'));
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Send verification email
      await sendEmailVerification(auth.currentUser);
      alert(`A verification email has been sent to ${user.email}. Please verify it before updating your email.`);

      // Store the new email in Firestore until verification is done
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { pendingEmail: newEmail }, { merge: true });
    }
  };

  return {
    user,
    username,
    setUser,          
    setUsername,      
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
    updateUsername,,  
  };
}
