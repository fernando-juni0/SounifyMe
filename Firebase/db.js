const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getAnalytics } = require('firebase/analytics');
var admin = require("firebase-admin");


var serviceAccount = require('../config/index-config').serviceAccount


initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});


// const analytics = getAnalytics(app);
const db = getFirestore();

module.exports = db