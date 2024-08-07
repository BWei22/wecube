// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUserDocument = functions.auth.user().onDelete((user) => {
  const uid = user.uid;
  const userDocRef = admin.firestore().collection('users').doc(uid);

  return userDocRef.delete()
    .then(() => {
      console.log(`Successfully deleted user document for UID: ${uid}`);
    })
    .catch((error) => {
      console.error(`Error deleting user document for UID: ${uid}`, error);
    });
});
