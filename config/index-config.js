require('dotenv').config()

module.exports = {
    session:{
        secret: process.env.SECRET || "290j15mpjn0nf09wnf9032hbt30ng093bg209gn9320gh092ng302hg29bg30",
        resave: false, 
        saveUninitialized: false,
    },
    port: process.env.PORT || 3000,
    serviceAccount: require('../config/sounifyme-firebase-admin.json'),
    firebaseConfig: require('../config/firebase-config.json'),
    lastFmKey: '59af3a6cb9bba4735bd9bb9d47485c47',
    spotifyClientId: '16ed8fdb95de4ea5a6fda5434762a574',
    spotifyClientSecret:'ba9ecc5eacf74472b42bb5f27d31cf7c'
}