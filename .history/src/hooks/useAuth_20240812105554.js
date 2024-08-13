function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const updateUsername = async (newUsername) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { username: newUsername }, { merge: true });
      setUsername(newUsername);  // Update the username in context, triggering a re-render
    }
  };

  return {
    user,
    username,
    setUser,
    setUsername,
    updateUsername,  // Expose updateUsername to allow updating from Profile page
    signupWithEmailAndPassword,
    signinWithEmailAndPassword,
    signout,
  };
}
