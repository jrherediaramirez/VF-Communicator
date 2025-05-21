// firebase-admin-scripts/setCustomClaim.js
const admin = require('firebase-admin');

// !! REPLACE WITH THE PATH TO YOUR SERVICE ACCOUNT KEY !!
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// !! REPLACE WITH THE UID OF THE USER YOU CREATED IN FIREBASE AUTH !!
const uid = 'S9Qai54mVTRrl0QGv7qpZjQZ7dL2';
const customClaims = {
  role: 'processor', // or 'qa', 'admin'
};

admin.auth().setCustomUserClaims(uid, customClaims)
  .then(() => {
    console.log(`Successfully set custom claims for user ${uid}:`, customClaims);
    // Verify claims (optional)
    return admin.auth().getUser(uid);
  })
  .then((userRecord) => {
    console.log('Verified user claims:', userRecord.customClaims);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  });