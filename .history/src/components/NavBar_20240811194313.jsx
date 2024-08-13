const NavBar = () => {
  const { user, username, signout } = useAuth();
  const navigate = useNavigate();
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    if (!user) {
      console.log('No authenticated user found.');
      return;
    }

    const q = query(collection(db, 'messages'), where('recipientId', '==', user.uid), where('isRead', '==', false));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNewMessages(querySnapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    signout(() => navigate('/'));
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <Link to="/competitions">Competitions</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <Badge badgeContent={newMessages} color="error">
              <Link to="/conversations">Conversations</Link>
            </Badge>
            <Link to="/profile">Profile</Link>
            <Button onClick={handleLogout} variant="contained" color="secondary">Logout</Button>
            <span className="navbar-username">{username}</span>
          </>
        ) : (
          <Button onClick={() => navigate('/login')} variant="contained" color="primary">Login</Button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
