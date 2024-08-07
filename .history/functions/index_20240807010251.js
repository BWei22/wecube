const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  const db = admin.firestore();

  // Delete user data from the 'users' collection
  await db.collection("users").doc(uid).delete();

  // Delete user's conversations and messages
  const conversationsQuerySnapshot = await db.collection("conversations")
    .where("participants", "array-contains", uid).get();

  conversationsQuerySnapshot.forEach(async (doc) => {
    const conversationId = doc.id;

    // Delete messages in each conversation
    const messagesQuerySnapshot = await db.collection("messages")
      .where("conversationId", "==", conversationId).get();

    messagesQuerySnapshot.forEach(async (messageDoc) => {
      await db.collection("messages").doc(messageDoc.id).delete();
    });

    // Delete the conversation
    await db.collection("conversations").doc(conversationId).delete();
  });

  return;
});
