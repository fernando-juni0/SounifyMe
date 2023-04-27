require('dotenv').config()





module.exports = {
    session:{
        secret: process.env.SECRET || "290j15mpjn0nf09wnf9032hbt30ng093bg209gn9320gh092ng302hg29bg30",
        resave: false, 
        saveUninitialized: true,
    },
    port: process.env.PORT || 80,
    dropboxToken: process.env.DROPBOXTOKEN,
    serviceAccount: require('../config/clone-68fd8-firebase-adminsdk-wip76-11748d9022.json')
}