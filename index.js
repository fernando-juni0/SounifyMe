//TODO-------------importes------------

const express = require('express')
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session')
const path = require('path');
const multer = require('multer')
const cookieParser = require("cookie-parser");
const configs = require('./config/index-config')
const db = require('./Firebase/models');
const functions = require('./functions');
const authentication = require('./Firebase/authentication')
const { getAuth,fetchSignInMethodsForEmail } = require('firebase/auth')
const cloudinary = require('cloudinary')
var ytdl = require('ytdl-core');
const cors = require('cors');
// let servers = require('./config/originals-servers')
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

//TODO------------Configs--------------




require('dotenv').config()

app.use(cors());

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





//TODO----------------SOCKET------------------
io.on('connection', async(socket) => {

    //TODO------Sockets---------
    

    socket.on('initVote',async(data)=>{
        io.to(data.roomID).emit('reqVote', data)
        
    })
    socket.on('resVote',async(data)=>{
        if (data.numberVotes > data.numberRecuses) {
            functions.percentualNumber(data.numberVotes,data.roomUserNumber,80).then((res)=>{
                if (res == true) {
                    socket.to(data.roomID).emit('resultVote',data, true);
                }else{
                    socket.to(data.roomID).emit('resultVote',data, false);
                }
            })
        }else{
            socket.to(data.roomID).emit('resultVote',data,false);
        }
        
        
    })


    socket.on("reqTimeMusic",async(user,room)=>{
        io.to(room).emit('TimeMusicPost', user,room)
    })

    socket.on('resTimeMusic',async(data)=>{
        //TODO(UPDATE)  adicionar o script de frequencia que esta no functions ,
        io.to(data.room).emit('TimeMusicGet',data)
    })

    socket.on("indexMusic",async(musicIndex,room)=>{
        io.to(room).emit('resultCommandsMusic', musicIndex,room)
        await db.update('Conections',room,{
            positionQueue:musicIndex
        })
    })

    socket.on('getCommand', async(data)=>{
        switch (data.command) {
            case '/play':
                var roomData = await db.findOne({colecao:'Conections',doc:data.room})
                var roomQueue = roomData.queue
                var roomQueueCount = roomQueue.length + 1
                async function validLinkType(data) {
                     switch (data.type) {
                        case 'youtube':
                            if (data.link.includes('/playlist')) {
                                let playlistDataYt = await functions.getPlaylistYoutube(data.link);
                                const promises = [];
                                
                                for (const [index, element] of playlistDataYt.entries()) {
                                    let matchLink = element.match(/[?&]v=([^&]+)/);
                                    let playlistID =  matchLink ? matchLink[1] : null;
                                    if (playlistID) {
                                        let linkData = await functions.getLinkYtData(element)
                                        linkData.index = roomQueueCount + index
                                        promises.push(linkData);
                                    } else {
                                        
                                        console.error('ID de playlist inválido:', element);
                                        return {erro:"ID de playlist inválido"}
                                    }
                                }

                                await Promise.all(promises);
                                return {
                                    type:'youtubePlaylist',
                                    playlistDataRes : promises
                                }
                            }else{
                                let linkData = await functions.getLinkYtData(data.link)
                                return linkData
                            } 
                            break;
                        case 'songName':
                            return await functions.searchTrackLink(data.link).then((res)=>{
                                if (res == 'erro') {
                                    return {erro:"Não foi possivel encontrar a musica"}
                                }
                                return res
                            }).catch(err=>{
                                console.log(err);
                                return {erro:err}
                            })
                            break;
                        case 'spotify':
                            if (data.link.includes('/playlist/')) {
                                return alert('Atualmente não aceitamos playlists do spotify')
                            }else{
                                const response2 = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(data.link)}`);
                                const data2 = await response2.json();
                                
                                const infoRES = await ytdl.getInfo(data2.linksByPlatform.youtube.url);
                                const linkRES = ytdl.chooseFormat(infoRES.formats, { filter: 'audioonly' }).url
                                const resInfos = data2.entitiesByUniqueId[data2.entityUniqueId]
                                return {
                                    thumbnail: resInfos.thumbnailUrl,
                                    musica: resInfos.title,
                                    banda: resInfos.artistName,
                                    link: linkRES,
                                };
                            }
                            break
                        default:
                            break;
                    }
                }
            
                
               

                let verifyLinkResult = await validLinkType(data)
                if (verifyLinkResult.erro) {
                    switch (verifyLinkResult.erro) {
                        case 'Não foi possivel encontrar a musica':
                            io.to(data.room).emit('Reqerror', {erroType:'playMusic',errorText:verifyLinkResult.erro});
                            break;
                    
                        default:
                            break;
                    
                    }
                    
                    return
                }

                if (verifyLinkResult.type == 'youtubePlaylist') {
                    var roomDataPl = await db.findOne({colecao:'Conections',doc:data.room})
                    let roomModifyAddPlaylist = roomDataPl.queue
                    var roomQueueCount = roomDataPl.queue.length + 1
                    await verifyLinkResult.playlistDataRes.forEach(async(element,index)=>{
                        let elementResolve = await Promise.resolve(element)
                        if (roomModifyAddPlaylist.length == 0 && index == 0) {
                            io.to(data.room).emit('getMuiscPlaylist', {user:data.user,typeResult:'play', date:data.date,queueIndex:roomQueueCount, linkInfos:elementResolve});
                            db.update('Conections',data.room,{
                                musicaAtual:{
                                    link:elementResolve.link,
                                    thumbnail: elementResolve.thumbnail ? elementResolve.thumbnail : 'https://res.cloudinary.com/dgcnfudya/image/upload/v1690939381/isjslkzdlkswe9pcnrn4.jpg',
                                    banda:elementResolve.banda,
                                    musica:elementResolve.musica
                                }
                            })
                        }else{
                            io.to(data.room).emit('getMuiscPlaylist', {user:data.user,typeResult:'queue', date:data.date,queueIndex:roomQueueCount, linkInfos:elementResolve});
                        }
                        await roomModifyAddPlaylist.push(elementResolve)
                    })
                    let mensageObj = await roomDataPl.mensages
                    await mensageObj.push({
                        userUID:data.user.uid,
                        mensageDate: data.date,
                        userName: data.user.displayName,
                        userPic: data.user.profilePic,
                        command:data.command,
                        type:'playlistYT',
                    })
                    db.update('Conections',data.room,{
                        queue:roomModifyAddPlaylist,
                        mensages:mensageObj
                    })

                    return
                }

                if (verifyLinkResult.type == 'spotifyPlaylist') {
                    console.log(verifyLinkResult);
                    // io.to(data.room).emit('test',verifyLinkResult.playlistData );
                    return
                }
                let modelAddMusic = {
                    link:verifyLinkResult.link,
                    thumbnail: verifyLinkResult.thumbnail ? verifyLinkResult.thumbnail : 'https://res.cloudinary.com/dgcnfudya/image/upload/v1690939381/isjslkzdlkswe9pcnrn4.jpg',
                    banda:verifyLinkResult.banda,
                    musica:verifyLinkResult.musica
                }

                
                
                if (roomQueue.length == 0) {
                    io.to(data.room).emit('receiveCommand', {typeResult:'play',command:data.command,user:data.user, date:data.date, queueIndex:roomQueueCount,linkInfos:modelAddMusic});
    
                    await db.update('Conections',data.room,{
                        musicaAtual:modelAddMusic
                    })
                }else{
                    io.to(data.room).emit('receiveCommand', {typeResult:'queue',command:data.command,user:data.user, date:data.date,queueIndex:roomQueueCount, linkInfos:modelAddMusic});
                }
                let modelAddMusicQueue = modelAddMusic
                modelAddMusicQueue.index = roomQueueCount
                await roomQueue.push(modelAddMusicQueue)
                await db.update('Conections',data.room,{
                    queue:roomQueue
                })
                
                
                
                let mensageObj = await roomData.mensages
                await mensageObj.push({
                    userUID:data.user.uid,
                    mensageDate: data.date,
                    userName: data.user.displayName,
                    userPic: data.user.profilePic,
                    command:data.command,
                    resCommand:{
                        link:verifyLinkResult.link,
                        thumbnail: verifyLinkResult.thumbnail ? verifyLinkResult.thumbnail : 'https://res.cloudinary.com/dgcnfudya/image/upload/v1690939381/isjslkzdlkswe9pcnrn4.jpg',
                        banda:verifyLinkResult.banda,
                        musica:verifyLinkResult.musica
                    }
                })
                await db.update('Conections',data.room,{
                    mensages:mensageObj
                })
                break;
            case '/clear':
                switch (data.action) {
                    case 'apagar o chat':
                        io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,});
                        await db.update('Conections',data.roomID,{
                            mensages:[]
                        })
                        break;
                    case 'parar a musica atual':
                        if (data.other.link) {
                            const roomDataClear = await db.findOne({colecao:'Conections',doc:data.roomID})
                            let roomQueueClear = roomDataClear.queue
                            let newArrayQueue = []
                            let indexArray = 0
                            await roomQueueClear.forEach((element,index)=>{
                                indexArray ++ 
                                if (element.link == data.other.link) {
                                    indexArray -- 
                                }else{
                                    newArrayQueue.push({
                                        link:element.link,
                                        thumbnail: element.thumbnail,
                                        banda:element.banda,
                                        musica:element.musica,
                                        index: indexArray
                                    })
                                }
                            })
                            await db.update('Conections',data.roomID,{
                                musicaAtual:{},
                                queue:newArrayQueue
                            })
                            io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,other:data.other});
                        }else{
                            io.to(data.roomID).emit('Reqerror', {erroType:'empty',errorText:'Não tem nenhuma musica em reprodução para ser apagada!'});
                        }
                        
                        break;
                    case 'apagar a fila de reprodução':
                        io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,});
                        await db.update('Conections',data.roomID,{
                            musicaAtual:{},
                            queue:[]
                        })
                        break
                    
                }
                break
            case '/indexChange':
                const roomDataChange = await db.findOne({colecao:'Conections',doc:data.roomID})
                let roomDataQueue = roomDataChange.queue
                if (data.other > roomDataQueue.length || data.other <= 0) {
                    return
                }
                io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,other:data.other});
                await db.update('Conections',data.roomID,{
                    positionQueue:data.other,
                    musicaAtual:roomDataQueue[data.other - 1]
                })
                break
            case '/kick':
                const roomDataKick = await db.findOne({colecao:'Conections',doc:data.roomID})
                const roomPessoas = roomDataKick.pessoas
                const index = await roomPessoas.indexOf(data.other);
                if (index !== -1) {
                    await roomPessoas.splice(index, 1);
                }
                
                await db.update('Conections',data.roomID,{
                    pessoas:roomPessoas
                })

                io.to(data.roomID).emit('receiveCommand', {command:data.command, action:data.action,other:data.other});
                break
        }
    })

    socket.on('sendMessage', async(data) => {
        let roomData = await db.findOne({colecao:'Conections',doc:data.room})
        let mensageObj = await roomData.mensages
        io.to(data.room).emit('receiveMessage', {mensage:data.mensage,user:data.user,date:data.date});
        await mensageObj.push({
            userUID:data.user.uid,
            mensageDate: data.date,
            userName: data.user.displayName,
            userPic: data.user.profilePic,
            mensage: data.mensage
        })
        await db.update('Conections',data.room,{
            mensages:mensageObj
        })
        
    });
    
    socket.on('joinRoom',async (data) => {
        let myUser = await db.findOne({colecao:'users',doc:data.uid})
        var room = await db.findOne({colecao:"Conections",doc:data.roomID})

        var pessoas = room.pessoas
        socket.join(data.roomID);
        if (pessoas.includes(myUser.uid)) {
            return
        }

        socket.user = myUser
        socket.room = data.roomID
        await db.update('users',data.uid,{
            joinroom: data.roomID,
        })
        await pessoas.push(data.uid)
        await db.update('Conections',data.roomID,{
            pessoas:pessoas
        })
       
        socket.broadcast.emit('join_user',myUser.uid);

        socket.on('disconnect', async () => {
            if (pessoas.includes(data.uid)) {
                socket.broadcast.emit('isMyUser',data.uid)
            }
    
            await db.update('users',data.uid,{
                joinroom:null
            })
            let removePessoa = pessoas
            const index = await removePessoa.indexOf(data.uid);
            if (index !== -1) {
                await removePessoa.splice(index, 1);
            }
            await db.update('Conections',data.roomID,{
                pessoas: await removePessoa
            })
            socket.broadcast.emit('leave_user',data.uid);
            socket.leave(data.roomID)
        });
    });
    socket.on('leaveRoom', async(data) => {
        var room = await db.findOne({colecao:"Conections",doc:data.roomID})
        
        var pessoas = room.pessoas

        if (pessoas.includes(data.uid)) {
            socket.broadcast.emit('isMyUser',data.uid)
        }

        await db.update('users',data.uid,{
            joinroom:null
        })
        let removePessoa = pessoas
        const index = await removePessoa.indexOf(data.uid);
        if (index !== -1) {
            await removePessoa.splice(index, 1);
        }
        await db.update('Conections',data.roomID,{
            pessoas: await removePessoa
        })
        socket.broadcast.emit('leave_user',data.uid);
        socket.leave(data.roomID)
    });
    socket.on('disconnect',async()=>{
        if (socket.user) {
            var room = await db.findOne({colecao:"Conections",doc:socket.room})
            socket.leave(socket.room)
            var pessoas = room.pessoas
            
            if (pessoas.includes(socket.user.uid)) {
                socket.broadcast.emit('isMyUser',socket.user.uid)
            }

            await db.update('users',socket.user.uid,{
                joinroom:null
            })
            let removePessoa = pessoas
            const index = await removePessoa.indexOf(socket.user.uid);
            if (index !== -1) {
                await removePessoa.splice(index, 1);
            }
            
            await db.update('Conections',socket.room,{
                pessoas: await removePessoa
            })
            socket.broadcast.emit('leave_user',socket.user.uid);
        }
    })
});



//TODO-----------POST CONFIGS-----------------

app.post('/firebaseApp',(req,res)=>{
    res.send(require('./config/index-config').firebaseConfig)
})

app.post('/getRoom/:roomID',async(req,res)=>{
    var responseData = {}

    let room = await db.findOne({colecao:'Conections',doc:req.params.roomID})
    if (room) {
        responseData.success = true
        responseData.room = room
    }else{
        responseData.success = false
        responseData.room = null
    }
    res.status(200).json(responseData);
})

//TODO-----------GET CONFIGS-----------------




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
        await db.findOne({colecao:'users',doc:req.session.uid}).then(async(result)=>{
            const user = await functions.userModel(result,functions.removeArrayEmpty)
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

app.get('/room/:roomid',functions.isAuthenticated,async(req,res)=>{
    if (req.session.uid) {
        let room = await db.findOne({colecao:'Conections',doc:req.params.roomid})
        let user = await db.findOne({colecao:"users",doc:req.session.uid})
        
        res.render('room',{myUser:user,room:room})
    } else {
        res.redirect('/login')
    }
})

app.get('/conection',functions.isAuthenticated,async(req,res)=>{
    if (req.session.uid) {
        await db.findOne({colecao:'users',doc:req.session.uid}).then(async(result)=>{
            const user = await functions.userModel(result,functions.removeArrayEmpty)
            let rooms = await db.findAll({colecao:'Conections'})
            res.render('conection',{user:user,rooms:rooms})
        })
    } else {
        res.redirect('/login')
    }
})
app.get('/user/:uid',functions.isAuthenticated, async(req,res)=>{
    await db.findOne({colecao:'users',doc:req.session.uid}).then(async(result)=>{
       
        let seguindo = await functions.removeArrayEmpty(result.folowInfo.seguindo)
        var isFolow = null
        let isMyProfile = result.uid == req.params.uid ? true : false
        seguindo.forEach(element => {
            if (req.params.uid == element) {
                isFolow = true
            }
        });
        const myUser = await functions.userModel(result,functions.removeArrayEmpty)
        myUser.userConta = result.uid == req.session.uid ? true : false
        myUser.isMyProfile = isMyProfile
        myUser.isFolow = isFolow == true ? true : false
        myUser.blockedUsers = result.blockedUsers
        if (isMyProfile == true) {
            userProfile = myUser
        }else{
            await db.findOne({colecao:'users',doc:req.params.uid }).then( async(result1)=>{
                if (result1 == undefined || result1.blockedUsers.includes(result.uid)) {
                    res.redirect('/404/profile')
                    return
                }
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
                    isFolow: isFolow == true ? true : false,
                    userBockeds: result1.userBockeds
                }
            })
            
        }
        res.render('perfil',{user:myUser, userProfile:userProfile})
    }) 
})

app.get('/auth/Google/login',(req,res)=>{
    res.render('google-login')
})

app.get('/404/:type',(req,res)=>{
    res.render('NotFoundPage',{type:req.params.type})
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

app.post('/userBlock/:uid',async(req,res)=>{
    var responseData = {}

    await db.findOne({colecao:'users',doc:req.session.uid}).then( async(result)=>{
        let userBockeds = result.blockedUsers
        await userBockeds.push(req.params.uid)
        await db.update('users',req.session.uid, {
            blockedUsers:userBockeds
        })
    }) 
    responseData.success = true
    res.status(200).json(responseData);
})
app.post('/userUnBlock/:uid',async(req,res)=>{
    var responseData = {}

    await db.findOne({colecao:'users',doc:req.session.uid}).then( async(result)=>{
        let userBockeds = result.blockedUsers
        let index = userBockeds.indexOf(req.params.uid);
        await userBockeds.splice(index, 1);
        await db.update('users',req.session.uid, {
            blockedUsers:userBockeds
        })
    }) 
    responseData.success = true
    res.status(200).json(responseData);
})

app.post('/findOne',async(req,res)=>{
    const {colecao,doc} = req.body
    var responseData = {}
    let userdata = await db.findOne({colecao:colecao, doc:doc}).then((res)=>{
        return {
            displayName: res.displayName,
            email: res.email,
            uid: res.uid,
            profilePic: res.profilePic
        }
    })
    if (userdata) {
        responseData.data = userdata
        responseData.success = true
    }else{
        responseData.data = null
        responseData.success = false
    }
    
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
app.post('/findArrayUsers',async(req,res)=>{
    var responseData = {}
    await db.findOne({colecao:'Conections',doc:req.body.roomID}).then(async(res)=>{
        let userData = await res.pessoas.map(async(result)=>{
            let findUser = await db.findOne({colecao:'users',doc:result})
            if (findUser) {
                return {
                    displayName: findUser.displayName,
                    profilePic: findUser.profilePic,
                    uid: findUser.uid
                }  
            }else{
                return null
            }
            
            
        })
        if (userData) {
            responseData.success = true
            responseData.data = await Promise.all(userData)
            return
        }else{
            responseData.success = false
            return 'error'
        }
        
    })
    res.status(200).json(responseData);
})

app.post('/editProfile/:uid',upload.single('file'),async(req,res)=>{
    var responseData = {}
    await db.update('users',req.params.uid, {
        displayName: req.body.inputValue
    }).then(()=>{
        return responseData.displayName = req.body.inputValue
    }).catch((err)=>{
        return responseData.success = false
    })
    if (req.file) {
        let fileContent = fs.readFileSync(req.file.path)
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
    }
    responseData.success = true
    res.status(200).json(responseData);
})

app.post('/editProfileBanner/:uid',upload.single('file'),async(req,res)=>{
    var responseData = {}
    if (req.body.type == "color") {
        await db.update('users',req.params.uid, {
            banner: {
                type:"color",
                content: req.body.color
            }
        })
        responseData.success = true
    }else{
        let fileContent = fs.readFileSync(req.file.path)
        const stream = await cloudinary.uploader.upload_stream(async(result) => {
            if (result) {
                await db.update('users',req.params.uid, {
                    banner: {
                        type:"image",
                        content: result.url
                    }
                })
                fs.unlink(req.file.path, function (err){
                    if (err) throw err;
                })
            }
        },{ 
            public_id: "sounifyme/" + req.params.uid + "-profileBanner",
            transformation: {
                width: 800, 
                height: 500,
                crop: "fill"
            } 
        });
        await stream.write(fileContent);
        await stream.end();
        responseData.success = true
    }
    res.status(200).json(responseData);
})


app.post('/createPlaylist/:uid', async(req,res)=>{
    let uid = req.params.uid
    var responseData = {}
    const codigo = require('crypto').randomBytes(16).toString('hex');
    let upPlaylist = {
        playlistUID: codigo,
        playlistName: "Playlist " + req.body.numberPlaylist,
        playlistMusics: [],
        playlistImg: "https://res.cloudinary.com/dgcnfudya/image/upload/v1689452893/j4tfvjlyp1ssspbefzg9.png"
    }
    let user = await db.findOne({colecao:'users',doc:uid})
    await db.update('users',uid, {
        playlist: [
            upPlaylist
        ].concat(user.playlist)
    })
    responseData.success = true
    responseData.newPlaylist = upPlaylist
    res.status(200).json(responseData);
})


app.post('/findconnection',async(req,res)=>{
    var responseData = {}

    let room = await db.findOne({colecao:'Conections',doc:req.body.roomId})
    responseData.room = room
    responseData.success = true
    res.status(200).json(responseData);
})



app.post('/createRoom',async(req,res)=>{
    var responseData = {}
    const roomId = require('crypto').randomBytes(11).toString('hex');
    const roomInvateCode = Math.random().toString().slice(2, 8);
    let model = {
        roomId:roomId,
        roomInvateCode:roomInvateCode,
        islocked: req.islocked,
        pass: req.pass,
        maxpessoas: req.maxpessoas,
        estilos: req.estilos,
        roomName: req.roomName,
        roomPic: req.roomPic
    }
    await functions.createServerDB(model)
    responseData.success = true
    responseData.data = model
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








//TODO SERVER
http.listen(configs.port,()=>{
    console.log(`Servidor rodando na porta ${configs.port}` );
});