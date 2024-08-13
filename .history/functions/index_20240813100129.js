const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;
  const db = admin.firestore();

  try {
    // Delete all messages sent to/from the user
    const messagesRef = db.collection('messages');
    const messagesQuery = messagesRef.where('senderId', '==', userId).get();
    const receivedMessagesQuery = messagesRef.where('recipientId', '==', userId).get();

    const [sentMessages, receivedMessages] = await Promise.all([messagesQuery, receivedMessagesQuery]);

    const batch = db.batch();

    sentMessages.forEach((doc) => {
      batch.delete(doc.ref);
    });

    receivedMessages.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete all listings posted by the user
    const listingsRef = db.collection('listings');
    const listingsQuerySnapshot = await listingsRef.where('ownerId', '==', userId).get();

    listingsQuerySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`Successfully deleted user data for user: ${userId}`);
  } catch (error) {
    console.error(`Error deleting user data for user: ${userId}`, error);
  }
});
