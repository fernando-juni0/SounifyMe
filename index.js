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








//TODO-------------Banco de dados-------------


const dados = require('./Firebase/models');


dados.findAll({colecao:'contas'}).then((res)=>{console.log(res);})
//TODO----------------Funções--------------------



const functions = require('./functions');


//TODO-----------------GET--------------------



//TODO PAGES




app.get('/home', functions.isAuthenticated, async (req,res)=>{
    if (req.session.uid) {
        res.render('index')
    } else {
        res.redirect('/login')
    }
})

app.get('/login',(req,res)=>{
    if (req.session.uid) {
        res.redirect('/home')
    } else {
        res.render('login')
    }
})

//TODO-----------------POST--------------------



app.post('/auth/Google', async (req,res)=>{
    let userdata = req.body
    if (req.session.uid) {
        return res.redirect('/home')
    }
    if (userdata.uid) {
        let accessToken = userdata.stsTokenManager.accessToken
        await functions.verifyAuthToken(accessToken).then((result)=>{
            if (result) {
                
                req.session.uid = result
                req.session.accesstoken = accessToken
                req.session.google = true
                
            }
        })
        res.redirect('/home')
    }
})

app.post('/auth/email', async (req,res)=>{
    let userdata = req.body
    if (req.session.uid) {
        return res.redirect('/home')
    }
    if (userdata.uid) {
        let accessToken = userdata.stsTokenManager.accessToken
        await functions.verifyAuthToken(accessToken).then((result)=>{
            if (result) {
                req.session.uid = result
                req.session.accesstoken = accessToken
                req.session.google = false
            }
        })
        res.redirect('/home')
    }
})


//TODO AUTH LOGIN

app.get('/logout',(req,res)=>{
    const sessionID = req.session.id;
    req.sessionStore.destroy(sessionID, (err) => {
        if(err){
            return console.error(err)
        }
        res.redirect('/login')
    })
})





//TODO-----------POST CONFIGS-----------------

app.post('/firebaseApp',(req,res)=>{
    res.send(require('./config/index-config').firebaseConfig)
})



//TODO SERVER
app.listen(configs.port,()=>{
    console.log(`Servidor rodando na porta ${configs.port}` );
});