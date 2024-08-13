import { useState, useEffect, useContext, createContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
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

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [newUser, setNewUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
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
    setLoading(false); // Set loading to false after the operation completes
  };

  const signupWithEmailAndPassword = async (email, password) => {
    const auth = getAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    setUser(user);
    setNewUser(true);
    navigate('/complete-profile');
    setLoading(false); // Set loading to false after the operation completes
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
      navigate('/signup');
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
    signinWithGoogle,
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
    deleteUserAccount,
  };
}
