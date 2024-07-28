import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      const q = query(
        collection(db, "interests"),
        where("sellerId", "==", auth.user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => doc.data());
        setNotifications(notificationsData);
      });

      return () => unsubscribe();
    }
  }, [auth.user]);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>
            {notification.userName} is interested in your puzzle: {notification.listingName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
