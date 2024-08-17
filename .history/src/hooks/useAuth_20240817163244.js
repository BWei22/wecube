import React, { useState, useEffect, useContext, createContext } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, deleteDoc, query } from 'firebase/firestore';
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

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Delete user's messages
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(messagesRef, where('senderId', '==', user.uid));
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete user's listings
      const listingsRef = collection(db, 'listings');
      const listingsQuery = query(listingsRef, where('userId', '==', user.uid));
      const listingsSnapshot = await getDocs(listingsQuery);
      listingsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete user's conversations
      const conversationsRef = collection(db, 'conversations');
      const conversationsQuery = query(conversationsRef, where('participants', 'array-contains', user.uid));
      const conversationsSnapshot = await getDocs(conversationsQuery);
      conversationsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Delete user's data in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);

      // Delete the Firebase user
      await firebaseDeleteUser(auth.currentUser);

      // Sign out the user
      await signout();

    } catch (error) {
      console.error('Failed to delete account:', error);
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
    updateUsername,  
    deleteAccount,
  };
}
