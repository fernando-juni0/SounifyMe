const token = require('./index-config').dropboxToken
const Dropbox = require('dropbox').Dropbox;

const dbx = new Dropbox({ accessToken: token });

module.exports = dbx