// firebase-admin-scripts/setCustomClaim.js
const admin = require('firebase-admin');

// !! REPLACE WITH THE PATH TO YOUR SERVICE ACCOUNT KEY !!
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// !! REPLACE WITH THE UID OF THE **NEW QA USER** !!
const uid = 'PfisurrhJkY3fpaP9swCRs3DOul2'; 

const customClaims = {
  role: 'qa', // <--- SET THE ROLE TO 'qa'
};

admin.auth().setCustomUserClaims(uid, customClaims)
  .then(() => {
    console.log(`Successfully set custom claims for user ${uid}:`, customClaims);
    // Verify claims (optional)
    return admin.auth().getUser(uid);
  })
  .then((userRecord) => {
    console.log('Verified user claims:', userRecord.customClaims);
    process.exit(0); // Exit successfully
  })
  .catch((error) => {
    console.error('Error setting custom claims:', error);
    process.exit(1); // Exit with error
  });