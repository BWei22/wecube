const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
  const userId = user.uid;
  const db = admin.firestore();

  try {
    const batch = db.batch();

    // Delete all messages sent to/from the user
    const messagesRef = db.collection('messages');
    const sentMessages = await messagesRef.where('senderId', '==', userId).get();
    const receivedMessages = await messagesRef.where('recipientId', '==', userId).get();

    sentMessages.forEach((doc) => batch.delete(doc.ref));
    receivedMessages.forEach((doc) => batch.delete(doc.ref));

    console.log('deleting messages')
    // Delete all listings posted by the user
    const listingsRef = db.collection('listings');
    const listings = await listingsRef.where('userId', '==', userId).get();
    console.log()
    listings.forEach((doc) => {
      console.log(`Deleting listing: ${doc.id}`);
      batch.delete(doc.ref);
    });

    // Delete all conversations involving the user
    const conversationsRef = db.collection('conversations');
    const userConversations = await conversationsRef.where('participants', 'array-contains', userId).get();

    userConversations.forEach((doc) => batch.delete(doc.ref));

    // Commit the batch
    await batch.commit();

    console.log(`Successfully deleted user data for user: ${userId}`);
  } catch (error) {
    console.error(`Error deleting user data for user: ${userId}`, error);
  }
});
