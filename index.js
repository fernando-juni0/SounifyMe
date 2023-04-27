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
app.use(cookieParser());


app.use(session(configs.session))

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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



//TODO----------------Funções--------------------



const functions = require('./functions');



//TODO-----------------GET--------------------



//TODO PAGES



app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/login',(req,res)=>{
    res.render('login')
})




//TODO AUTH LOGIN

app.get('/logout',(req,res)=>{
    const sessionID = req.session.id;
    req.sessionStore.destroy(sessionID, (err) => {
    if(err){
        return console.error(err)
    }
    res.redirect('/')

})
})





//TODO-----------POST CONFIGS-----------------






//TODO SERVER
app.listen(configs.port,()=>{
    console.log(`Servidor rodando na porta ${configs.port}` );
});