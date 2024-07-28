import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      console.log("Fetching notifications for user:", auth.user.uid);

      const q = query(
        collection(db, "interests"),
        where("sellerId", "==", auth.user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => doc.data());
        console.log("Fetched notifications:", notificationsData);
        setNotifications(notificationsData);
      });

      return () => unsubscribe();
    } else {
      console.log("No user authenticated");
    }
  }, [auth.user]);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.length === 0 ? (
          <li>No notifications available.</li>
        ) : (
          notifications.map((notification, index) => (
            <li key={index}>
              {notification.userName} is interested in your puzzle: {notification.listingName}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Notifications;
