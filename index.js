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
const db = require('./Firebase/models');
const functions = require('./functions');
const authentication = require('./Firebase/authentication')
const { getAuth,fetchSignInMethodsForEmail } = require('firebase/auth')
const cloudinary = require('cloudinary')

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
        const codigo = require('crypto').randomBytes(42).toString('hex');
        const originalName = file.originalname;
        const extension = originalName.substr(originalName.lastIndexOf('.'));
        const fileName = codigo + extension;
        cb(null, `${fileName}`)
    }
});

const upload = multer({ storage });



cloudinary.config({ 
    cloud_name: 'dgcnfudya', 
    api_key: '634395634388475', 
    api_secret: 'sGIzXYveDRCN_iSnjKepzB8mMd8' 
});


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
    let mensage = ''
    if (req.query.exist == 'false' ) {
        mensage = 'Esse email não existe, tente cadastra-lo!' 
    }else{
        mensage = 'Esse email ja existe, faça login para acessar sua conta!'
    }
    if (req.query.pass == 'invalid') {
        mensage = 'Senha incorreta!'
    }
    if (req.query.redirect) {
        if (req.session.uid) {
            res.redirect(req.query.redirect)
        } else {
            res.render('login',{mensage,exist:req.query.exist,pass:req.query.pass,login: req.query.login ? req.query.login : null})
        }
    }else{
        if (req.session.uid) {
            res.redirect('/home')
        } else {
            res.render('login',{mensage,exist:req.query.exist,pass:req.query.pass,login: req.query.login ? req.query.login : null})
        }
    }
    
})


app.get('/user/:uid',functions.isAuthenticated, async(req,res)=>{
    await db.findOne({colecao:'users',doc:req.session.uid}).then(async(result)=>{
        let seguindo = await functions.removeArrayEmpty(result.folowInfo.seguindo)
        let playlist = await functions.removeArrayEmpty(result.playlist)
        let seguidores = await functions.removeArrayEmpty(result.folowInfo.seguidores)
        var isFolow = null
        let isMyProfile = result.uid == req.params.uid ? true : false
        seguindo.forEach(element => {
            if (req.params.uid == element) {
                isFolow = true
            }
        });
        const myUser = {
            uid: result.uid,
            profilePic: result.profilePic,
            email: result.email,
            displayName: result.displayName,
            banda: result.banda,
            userConta: result.uid == req.session.uid ? true : false,
            banner:result.banner,
            folowInfo: {
                seguindo,
                seguidores
            },
            playlist: playlist,
            isMyProfile: isMyProfile,
            isFolow: isFolow == true ? true : false
        }
        
        if (isMyProfile == true) {
            userProfile = myUser
        }else{
            await db.findOne({colecao:'users',doc:req.params.uid }).then( async(result1)=>{
                let playlist = await functions.removeArrayEmpty(result1.playlist)
                let seguidores = await functions.removeArrayEmpty(result1.folowInfo.seguidores)
                let seguindo = await functions.removeArrayEmpty(result1.folowInfo.seguindo)
                userProfile = {
                    uid: result1.uid,
                    profilePic: result1.profilePic,
                    email: result1.email,
                    displayName: result1.displayName,
                    banda: result1.banda,
                    banner:result1.banner,
                    folowInfo: {
                        seguindo,
                        seguidores
                    },
                    playlist: playlist,
                    isMyProfile: isMyProfile,
                    isFolow: isFolow == true ? true : false
                }
            })
            
        }
        

        res.render('perfil',{user:myUser, userProfile:userProfile})
    }) 
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

app.post('/auth/email/login', async (req,res)=>{
    fetchSignInMethodsForEmail(auth,req.body.email).then((signInMethods) => {
        if (signInMethods.length > 0) {
            if (signInMethods == "google.com") {
                return res.redirect('/auth/Google/login')
            }
            authentication.singInEmail(req,res)
        }else{
            return res.redirect('/login?login=false&exist=false')
        }
    })
})

app.post('/auth/email/cadastro', async (req,res)=>{
    fetchSignInMethodsForEmail(auth,req.body.email).then((signInMethods) => {
        if (signInMethods.length > 0) {
            if (signInMethods == "google.com") {
                return res.redirect('/auth/Google/login')
            }
            return res.redirect('/login?exist=true')
        }else{
            authentication.singUpEmail(req,res)
        }
    })
})


app.post('/auth',(req,res)=>{
    let user = JSON.parse(req.body.user)
    if (!req.session.uid) {
        functions.verifyAuthToken(user.stsTokenManager.accessToken).then((result)=>{
            if (result) {
                req.session.uid = user.uid
                req.session.accesstoken = user.stsTokenManager.accessToken
                if (req.body.redirect) {
                    return res.redirect(req.body.redirect)
                }else{
                    return res.redirect('/home')
                }
                
            }else{
                res.redirect('/logout')
            }
        })
    }
})


app.post("/folow/:uid", async(req,res)=>{
    const responseData = {};
    await db.findOne({colecao:'users',doc:req.params.uid}).then( async(result1)=>{
        if (result1.uid) {
            responseData.success = true
        }else{
            responseData.success = false
        }
        let newFolowMe = result1.folowInfo.seguidores
        newFolowMe.push(req.session.uid)
        await db.update('users',req.params.uid, {
            folowInfo:{
                seguidores: newFolowMe,
                seguindo: result1.folowInfo.seguindo
            }
        })
        await db.findOne({colecao:'users',doc:req.session.uid}).then( async(result)=>{
            let newFolow = result.folowInfo.seguindo
            newFolow.push(req.params.uid)
            await db.update('users',req.session.uid, {
                folowInfo:{
                    seguidores: result.folowInfo.seguidores,
                    seguindo: newFolow
                }
            })
        }) 
        

    }) 
    
    res.status(200).json(responseData);
})

app.post("/unfolow/:uid", async(req,res)=>{
    const responseData = {};
    await db.findOne({colecao:'users',doc:req.params.uid}).then( async(result1)=>{
        if (result1.uid) {
            responseData.success = true
        }else{
            responseData.success = false
        }
        let newFolowMe = result1.folowInfo.seguidores
        let index = newFolowMe.indexOf(req.params.uid);
        newFolowMe.splice(index, 1);
        await db.update('users',req.params.uid, {
            folowInfo:{
                seguindo: result1.folowInfo.seguindo,
                seguidores: newFolowMe,
            }
        })
        await db.findOne({colecao:'users',doc:req.session.uid}).then( async(result)=>{
            
            let newFolow = result.folowInfo.seguindo
            let index = newFolow.indexOf(req.params.uid);
            newFolow.splice(index, 1);
            await db.update('users',req.session.uid, {
                folowInfo:{
                    seguidores: result.folowInfo.seguidores,
                    seguindo: newFolow
                }
            })
        }) 
        
    }) 
    
    res.status(200).json(responseData);
})

app.post('/findUser', async(req,res)=>{
    const {pageinPage, pageIndex,userUid} = req.body
    
    var responseData = {}
    await db.findOne({colecao:"users", doc:userUid}).then(async(result)=>{
        responseData.plus = result.folowInfo[pageIndex].length >= parseInt(pageinPage * 10) ? true : false
        if (result.folowInfo[pageIndex].length > 0) {
            let dataUser = await functions.removeArrayEmpty(result.folowInfo[pageIndex])
            let users = await functions.findUser(dataUser,pageinPage,10)
            responseData.success = true
            responseData.data = users
            
        }else{
            responseData.success = false
        }
    })
    
    res.status(200).json(responseData);
})


app.post('/editProfile/:uid',upload.single('file'),async(req,res)=>{
    var responseData = {}
    let fileContent = fs.readFileSync(req.file.path)
    await db.update('users',req.params.uid, {
        displayName: req.body.inputValue
    }).then(()=>{
        return responseData.displayName = req.body.inputValue
    }).catch((err)=>{
        return responseData.success = false
    })

    try{
        const stream = await cloudinary.uploader.upload_stream(async(result) => {
            if (result) {
                await db.update('users',req.params.uid, {
                    profilePic: result.url
                })
                fs.unlink(req.file.path, function (err){
                    if (err) throw err;
                })
                
            }else{
                responseData.success = false
            }
        }, { 
            public_id: "sounifyme/" + req.params.uid + "-profileImg",
            transformation: {
                width: 500, 
                height: 500,
                crop: "fill"
            } 
        });
        await stream.write(fileContent);
        await stream.end();
    }catch(err){
        console.log(err);
        responseData.success = false
    }
    responseData.success = true
    
    console.log(responseData);
    res.status(200).json(responseData);
})

app.post('/editProfileBanner/:uid',upload.single('file'),async(req,res)=>{
    let fileContent = fs.readFileSync(req.file.path)
    await db.update('users',req.params.uid, {
        displayName: req.body.inputValue
    })
    const stream = await cloudinary.uploader.upload_stream(async(result) => {
        if (result) {
            await db.update('users',req.params.uid, {
                banner: {
                    type
                }
            })
            fs.unlink(req.file.path, function (err){
                if (err) throw err;
            })
        }
    }, { 
        public_id: "sounifyme/" + req.params.uid + "-profileImg",
        transformation: {
            width: 500, 
            height: 500,
            crop: "fill"
        } 
    });
    await stream.write(fileContent);
    await stream.end();
    
    var responseData = {}
    res.status(200).json(responseData);
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