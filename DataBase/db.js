const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
var admin = require("firebase-admin");


var serviceAccount = require('../config/clone-68fd8-firebase-adminsdk-wip76-11748d9022.json')



initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});



const db = getFirestore();

module.exports = db