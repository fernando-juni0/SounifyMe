//TODO-------------importes------------

const express = require('express')
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session')
const path = require('path');
const multer = require('multer')
const io = require('socket.io')
const cookieParser = require("cookie-parser");
const configs = require('./config/index-config')
const dropbox = require('./config/dropbox-config')
const db = require('./Firebase/models');
const functions = require('./functions');
const authentication = require('./Firebase/authentication')
const { getAuth,fetchSignInMethodsForEmail } = require('firebase/auth')


//TODO------------Configs--------------
const app = express();



require('dotenv').config()


app.use(session(configs.session));
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('src'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'src')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');

const auth = getAuth();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname +'/uploads/')
    },
    filename: function (req, file, cb) {
        const nomeArquivo = file.originalname
        
        // Indica o novo nome do arquivo:
        cb(null, `${nomeArquivo}`)
    }
});

const upload = multer({ storage });






//TODO-----------------GET--------------------



//TODO PAGES

app.get('/', (req,res)=>{
    if (req.session.uid) {
        res.redirect('/home')
    } else {
        res.redirect('/login')
    }
})


app.get('/home', functions.isAuthenticated, async (req,res)=>{
    if (req.session.uid) {
        await db.findOne({colecao:'users',doc:req.session.uid}).then((result)=>{
            const user = {
                uid: result.uid,
                profilePic: result.profilePic,
                email: result.email,
                displayName: result.displayName,
                banda: result.banda
            }
            res.render('index',{user:user})
        })
    } else {
        res.redirect('/login')
    }
})

app.get('/login', async (req,res)=>{
    if (req.session.uid) {
        res.redirect('/home')
    } else {
        res.render('login')
    }
})

app.get('/auth/Google/login',(req,res)=>{
    res.render('google-login')
})

//TODO-----------------POST--------------------

app.post('/auth/Google', async (req,res)=>{
    authentication.googleLogin(req,res).then(()=>{
        res.redirect('/home')
    })
})

app.post('/auth/email', async (req,res)=>{
    fetchSignInMethodsForEmail(auth,req.body.email).then((signInMethods) => {
        if (signInMethods.length > 0) {
            if (signInMethods == "google.com") {
                return res.redirect('/auth/Google/login')
            }
            authentication.singInEmail(req,res)
        }else{
            authentication.singUpEmail(req,res)
        }
    })
})

app.post('/auth',(req,res)=>{
    let user = JSON.parse(req.body.user)
    if (!req.session.uid) {
        functions.verifyAuthToken(user.stsTokenManager.accessToken).then((result)=>{
            console.log(result);
            if (result) {
                req.session.uid = user.uid
                req.session.accesstoken = user.stsTokenManager.accessToken
                res.redirect('/home')
            }else{
                res.redirect('/logout')
            }
        })
        
    }
    
})
//TODO AUTH LOGIN

app.get('/logout',(req,res)=>{
    if (req.session.uid) {
        const sessionID = req.session.id;
            req.sessionStore.destroy(sessionID, (err) => {
            if(err){
                return console.error(err)
            }
        })
    }
    res.render('logout')
})





//TODO-----------POST CONFIGS-----------------

app.post('/firebaseApp',(req,res)=>{
    res.send(require('./config/index-config').firebaseConfig)
})



//TODO SERVER
app.listen(configs.port,()=>{
    console.log(`Servidor rodando na porta ${configs.port}` );
});