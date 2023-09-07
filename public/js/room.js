const socket = io();

window.addEventListener('beforeunload', function (event) {
    
});

var url = window.location.pathname
var partes = url.split("/");
var roomID = partes.pop();
var roomUsers = removeDuplicates(room.pessoas)
var roomUserNumber = roomUsers.length 

var audioTag = document.getElementById('audioTag')


var currentMusicPic = document.getElementById('current-music-pic-img')
var currentMusicTitle = document.getElementById('current-music-texts-name-h1')
var currentMusicBanda = document.getElementById('current-music-texts-banda-p')

var openVote = false


function removeDuplicates(arr) {
  const uniqueValues = [];
  
  for (const value of arr) {
    if (!uniqueValues.includes(value)) {
      uniqueValues.push(value);
    }
  }
  
  return uniqueValues;
}




window.addEventListener('load',async()=>{
    document.getElementById('containner').hide()
    if (roomUserNumber >= 1) {
        roomUsers.forEach((element,index) => {
            if (element == uid) {
                roomUsers.splice(index,1)
                roomUserNumber = roomUsers.length 
            }
        });
    }
    await socket.emit('joinRoom', {roomID:roomID, uid:uid});
})

document.getElementById('click-button-back').addEventListener('click',async()=>{
    await socket.emit('leaveRoom', {roomID:roomID, uid:uid});
    location.href = '/conection'
})
document.getElementById('click-button-continuar').addEventListener('click',async()=>{
    document.getElementById('click-containner').hide()
    document.getElementById('containner').show()

    
    document.getElementById('main-chat-row').scrollTop = document.getElementById('main-chat-row').scrollHeight; 

    if (roomUserNumber >= 2) {
        await socket.emit('reqTimeMusic',uid,roomID)
    }
    if (room.musicaAtual.link && roomUserNumber == 0) {
        addCurrentMusic({
            linkInfos:{
                banda: room.musicaAtual.banda,
                musica: room.musicaAtual.musica,
                thumbnail: room.musicaAtual.thumbnail,
                link: room.musicaAtual.link
            }
        })
    }
})






document.getElementById('sairDaSala').addEventListener('click',()=>{
    socket.emit('leaveRoom',{roomID:roomID, uid:uid})
    location.href = '/conection'
})



socket.on('join_user', (data) => {
    document.getElementById('main-chat-containner').innerHTML += ` <p>${data}</p> ` 
});


document.getElementById('send-mensage').addEventListener('click',()=>{
    if (document.getElementById('input-mensage').value.trim() !== '') {
        enviarMensagem()
    }
})

addEventListener('keypress',(keyArray)=>{
    let keyCode = keyArray.keyCode
    if (keyCode == 13) {
        if (document.getElementById('input-mensage').value.trim() !== '') {
            enviarMensagem()
        }
    }
})

function enviarMensagem() {
    let input = document.getElementById('input-mensage').value
    let inputContain = input
    var palavras = input.split(" ");
    var primeiraPalavra = palavras[0].toLowerCase();
    var segundaPalavra = palavras[1]
    document.getElementById('input-mensage').value = ''
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear().toString().substring(2);
    const dataHoraFormatada = dataAtual.toLocaleString('pt-BR').replace('20' + anoAtual, anoAtual).replace(/:\d{2}$/, '').replace(',', ' ás')
    switch (primeiraPalavra) {
        case '/play':
            const content = inputContain.startsWith('/play ') ? inputContain.slice(6) : inputContain;
            const type = content.match(/^https:\/\/(www\.)?youtube\.com/) ? 'youtube' : (content.match(/^https:\/\/(open\.)?spotify\.com/) ? 'spotify' : 'songName');
            socket.emit('getCommand',{type:type,room:roomID, command:primeiraPalavra, link:type === 'songName' ? content : type === 'youtube' ? content : content.split('&')[0], user:{uid:uid,displayName:displayName,profilePic:profilePic},date:dataHoraFormatada});
            return
            break;
        case '/clear':
            switch (segundaPalavra) {
                case 'chat':
                    initVote("/clear",'apagar o chat')
                    break;
                case 'music':
                    initVote("/clear",'parar a musica atual',{
                        banda: currentMusicBanda.textContent,
                        musica: currentMusicTitle.textContent,
                        thumbnail: currentMusicPic.src,
                        link: audioTag.src
                    })
                    break
                case 'queue':
                    initVote('/clear','apagar a fila de reprodução')
                    break
            }
            return
            break
    }
    socket.emit('sendMessage',{room:roomID, mensage:inputContain, user:{uid:uid,displayName:displayName,profilePic:profilePic},date:dataHoraFormatada});
}



function addCurrentMusic(data) {
    currentMusicTitle.innerText = data.linkInfos.musica
    currentMusicBanda.innerText = data.linkInfos.banda
    currentMusicPic.src = data.linkInfos.thumbnail

    
    audioTag.src = data.linkInfos.link
    
    audioTag.play()

    document.getElementById('options-button-pause-music').show()
    document.getElementById('options-button-play-music').hide()
}

// controla o volume do audio
let volumeRange = document.getElementById('volumeRange')
audioTag.volume = localStorage.getItem('volume')
volumeRange.value = localStorage.getItem('volume') * 100
document.addEventListener('DOMContentLoaded', () => {
    volumeRange.style.setProperty('--value', volumeRange.value);
});
volumeRange.addEventListener('input', () => {
    audioTag.volume = volumeRange.value / 100;
    localStorage.setItem('volume',volumeRange.value / 100)
    volumeRange.style.setProperty('--value', volumeRange.value);
});




async function initVote(command,action, other = null) {
    if (openVote == true) {
        return
    }
    if (roomUserNumber <= 1 ) {
        socket.emit('getCommand',{action:action,command:command,roomID:roomID,other:other})
        return
    }
    await socket.emit('initVote', {command: command,other:other,numberRecuses:0,numberVotes:1,roomID:roomID,displayName:displayName,roomUserNumber:roomUserNumber, uid:uid,action:action});

    document.getElementById('main-chat-row').innerHTML += ` 
        <div id="main-chat-vote-col">
            <div class="main-chat-vote-content">
                <div class="main-chat-vote-text">
                    <h1 class="main-chat-vote-text-h1">O Usuário ${displayName} Iniciou a votação para ${action}</h1>
                </div>
                <div class="main-chat-vote-votes">
                    <p class="main-chat-vote-votes-content"><span id="main-chat-vote-votes-number">1</span>/<span id="main-chat-vote-votes-max">${roomUserNumber}</span></p>
                </div>
                <div class="main-chat-vote-buttons">
                    <input id="vote-recuse" disabled='disabled' type="button" value="Recusar">
                    <input id="vote-acept" disabled='disabled' type="button" value="Aceitar">
                </div>
            </div>
        </div> 
    `
    document.getElementById('main-chat-row').scrollTop = document.getElementById('main-chat-row').scrollHeight; 
}
socket.on('reqVote',(data)=>{
    if (roomUserNumber <= 1 || openVote == true) {
        console.log(roomUserNumber);
        return
    }

    if (data.uid != uid) {
        openVote = true

            document.getElementById('main-chat-row').innerHTML += ` 
                <div id="main-chat-vote-col">
                    <div class="main-chat-vote-content">
                        <div class="main-chat-vote-text">
                            <h1 class="main-chat-vote-text-h1">O Usuário ${data.displayName} Iniciou a votação para ${data.action}</h1>
                        </div>
                        <div class="main-chat-vote-votes">
                            <p class="main-chat-vote-votes-content"><span id="main-chat-vote-votes-number">${data.numberVotes}</span>/<span id="main-chat-vote-votes-max">${roomUserNumber}</span></p>
                        </div>
                        <div class="main-chat-vote-buttons">
                            <input id="vote-recuse" type="button" value="Recusar">
                            <input id="vote-acept" type="button" value="Aceitar">
                        </div>
                    </div>
                </div> 
            `
            document.getElementById('vote-acept').addEventListener('click',async()=>{
                if (document.getElementById('vote-acept').getAttribute('disabled') == 'disabled') {
                    return
                }
                document.getElementById('main-chat-vote-votes-number').innerText = parseInt(document.getElementById('main-chat-vote-votes-number').textContent) + 1
                document.getElementById('vote-acept').setAttribute('disabled','disabled')
                document.getElementById('vote-recuse').setAttribute('disabled','disabled')
                await socket.emit('resVote', {other:data.other,command:data.command, action:data.action,numberRecuses:data.numberRecuses,numberVotes:(data.numberVotes + 1),roomID:roomID,roomUserNumber:roomUserNumber, uid:uid});
            })
            document.getElementById('vote-recuse').addEventListener('click',async()=>{
                if (document.getElementById('vote-recuse').getAttribute('disabled') == 'disabled') {
                    return
                }
                document.getElementById('vote-acept').setAttribute('disabled','disabled')
                document.getElementById('vote-recuse').setAttribute('disabled','disabled')
                await socket.emit('resVote', {other:data.other,command:data.command, action:data.action,numberRecuses:(data.numberRecuses + 1),numberVotes:data.numberVotes,roomID:roomID,roomUserNumber:roomUserNumber, uid:uid});
            })
        document.getElementById('main-chat-row').scrollTop = document.getElementById('main-chat-row').scrollHeight; 
    }
    
})

socket.on('resultVote',(data,result)=>{
    if (result == true) {
        openVote = false
        socket.emit('getCommand',data)
    }
})



document.getElementById('options-button-pause-music').addEventListener('click',async()=>{
    if (audioTag.src) {
        audioTag.pause()
        document.getElementById('options-button-pause-music').hide()
        document.getElementById('options-button-play-music').show()
        
        
    }
}) 

document.getElementById('options-button-play-music').addEventListener('click',async()=>{
    if (roomUserNumber <= 1 && audioTag.src) {
        audioTag.play()

        document.getElementById('options-button-pause-music').show()
        document.getElementById('options-button-play-music').hide()
        return
    }
    await socket.emit('reqTimeMusic',uid,roomID);
    
    
})

function clearMusic() {
    document.getElementById('audioTag').src = ''
    document.getElementById('current-music-pic-img').src = '../public/img/istockphoto-1292092283-612x612.jpg'
    document.getElementById("current-music-texts-name-h1").innerText = 'Nome da Musica'
    document.getElementById('current-music-texts-banda-p').innerText = "Nome da Banda"
    document.getElementById('current-music-options-content').innerHTML = ` 
        <svg class="current-music-options-svg" id="current-music-options-svg-curtir" version="1.1"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 329.928 329.928" xml:space="preserve"><path d="M232.478,13.406c-24.56,0-48.827,9.248-67.511,25.279c-18.689-16.032-42.956-25.279-67.517-25.279 C42.805,13.406,0,56.212,0,110.857C0,176.912,45.99,217.286,115.604,278.4c5.95,5.224,12.091,10.614,18.41,16.202 c0.044,0.039,0.087,0.077,0.131,0.115l21.018,18.156c2.816,2.433,6.311,3.649,9.806,3.649s6.991-1.217,9.807-3.65l21.014-18.156 c0.044-0.038,0.087-0.076,0.131-0.114c41.606-36.797,72.802-64.967,95.37-92.439c26.36-32.088,38.638-61.101,38.638-91.305 C329.928,56.212,287.123,13.406,232.478,13.406z M176.105,272.076l-11.138,9.623l-11.145-9.628 c-6.324-5.592-12.47-10.988-18.426-16.217C69.671,198.155,30,163.328,30,110.857c0-38.454,28.997-67.451,67.45-67.451 c20.925,0,42.409,10.03,56.066,26.176c2.851,3.37,7.041,5.313,11.454,5.313c4.414,0,8.603-1.944,11.453-5.315 c13.651-16.145,35.131-26.174,56.056-26.174c38.452,0,67.449,28.997,67.449,67.451C299.928,160.154,255.188,202.134,176.105,272.076 z"></path></svg>
        <svg class="current-music-options-svg" id="current-music-options-svg-playlistAdd" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="add_to_playlist_pmftupht1zcd 1" clip-path="url(#clip0_1350_43)"><path id="Vector" d="M34.6431 2.03133C34.6431 2.37667 34.523 2.70786 34.3094 2.95204C34.0957 3.19623 33.8059 3.33341 33.5037 3.33341H1.6027C1.30053 3.33341 1.01074 3.19623 0.797079 2.95204C0.583415 2.70786 0.463379 2.37667 0.463379 2.03133C0.463379 1.686 0.583415 1.35481 0.797079 1.11062C1.01074 0.866432 1.30053 0.729248 1.6027 0.729248H33.5037C33.8059 0.729248 34.0957 0.866432 34.3094 1.11062C34.523 1.35481 34.6431 1.686 34.6431 2.03133ZM33.5037 13.7501H1.6027C1.30053 13.7501 1.01074 13.8873 0.797079 14.1315C0.583415 14.3756 0.463379 14.7068 0.463379 15.0522C0.463379 15.3975 0.583415 15.7287 0.797079 15.9729C1.01074 16.2171 1.30053 16.3542 1.6027 16.3542H33.5037C33.8059 16.3542 34.0957 16.2171 34.3094 15.9729C34.523 15.7287 34.6431 15.3975 34.6431 15.0522C34.6431 14.7068 34.523 14.3756 34.3094 14.1315C34.0957 13.8873 33.8059 13.7501 33.5037 13.7501ZM17.5532 26.7709H1.6027C1.30053 26.7709 1.01074 26.9081 0.797079 27.1523C0.583415 27.3965 0.463379 27.7277 0.463379 28.073C0.463379 28.4183 0.583415 28.7495 0.797079 28.9937C1.01074 29.2379 1.30053 29.3751 1.6027 29.3751H17.5532C17.8554 29.3751 18.1452 29.2379 18.3588 28.9937C18.5725 28.7495 18.6925 28.4183 18.6925 28.073C18.6925 27.7277 18.5725 27.3965 18.3588 27.1523C18.1452 26.9081 17.8554 26.7709 17.5532 26.7709ZM33.5037 26.7709H30.0858V22.8647C30.0858 22.5193 29.9657 22.1881 29.7521 21.944C29.5384 21.6998 29.2486 21.5626 28.9465 21.5626C28.6443 21.5626 28.3545 21.6998 28.1408 21.944C27.9272 22.1881 27.8071 22.5193 27.8071 22.8647V26.7709H24.3892C24.087 26.7709 23.7972 26.9081 23.5835 27.1523C23.3699 27.3965 23.2498 27.7277 23.2498 28.073C23.2498 28.4183 23.3699 28.7495 23.5835 28.9937C23.7972 29.2379 24.087 29.3751 24.3892 29.3751H27.8071V33.2813C27.8071 33.6267 27.9272 33.9579 28.1408 34.202C28.3545 34.4462 28.6443 34.5834 28.9465 34.5834C29.2486 34.5834 29.5384 34.4462 29.7521 34.202C29.9657 33.9579 30.0858 33.6267 30.0858 33.2813V29.3751H33.5037C33.8059 29.3751 34.0957 29.2379 34.3094 28.9937C34.523 28.7495 34.6431 28.4183 34.6431 28.073C34.6431 27.7277 34.523 27.3965 34.3094 27.1523C34.0957 26.9081 33.8059 26.7709 33.5037 26.7709Z" fill="white"/></g><defs><clipPath id="clip0_1350_43"><rect width="35" height="35" fill="white" transform="translate(0.0078125)"/></clipPath></defs></svg>
        <svg class="current-music-options-svg" id="current-music-options-svg-favoritar" viewBox="0 0 41 40"  xmlns="http://www.w3.org/2000/svg"><g id="favorite_zsbmczw5nz2n 1" clip-path="url(#clip0_1350_47)"><g id="Group"><g id="Group_2"><path id="Vector" d="M20.0078 0C8.97984 0 0.0078125 8.97203 0.0078125 20C0.0078125 31.028 8.97984 40 20.0078 40C31.0358 40 40.0078 31.028 40.0078 20C40.0078 8.97203 31.0358 0 20.0078 0ZM20.0078 37.3913C10.4183 37.3913 2.61648 29.5896 2.61648 20C2.61648 10.4104 10.4183 2.60867 20.0078 2.60867C29.5973 2.60867 37.3991 10.4105 37.3991 20C37.3991 29.5895 29.5973 37.3913 20.0078 37.3913Z" fill="white"/></g></g><g id="Group_3"><g id="Group_4"><path id="Vector_2" d="M30.1197 15.4848L23.9409 14.587L21.1777 8.98801C20.7001 8.02035 19.3162 8.0202 18.8384 8.98801L16.0752 14.587L9.89647 15.4848C8.8289 15.6397 8.40054 16.9561 9.17358 17.7096L13.6445 22.0678L12.5891 28.2215C12.4068 29.2848 13.5259 30.0988 14.4816 29.5966L20.008 26.6911L25.5344 29.5965C25.7253 29.6968 25.9337 29.7464 26.1413 29.7464C26.9442 29.7464 27.5645 29.0232 27.427 28.2215L26.3716 22.0678L30.8425 17.7096C31.6151 16.9566 31.188 15.64 30.1197 15.4848ZM24.0597 20.6784C23.7522 20.9781 23.6119 21.4098 23.6845 21.8329L24.4091 26.0577L20.6151 24.063C20.235 23.8632 19.7812 23.8632 19.4011 24.063L15.607 26.0577L16.3316 21.8329C16.4042 21.4098 16.264 20.9781 15.9565 20.6784L12.887 17.6864L17.129 17.07C17.5538 17.0082 17.921 16.7414 18.1111 16.3564L20.008 12.5125L21.9051 16.3564C22.0951 16.7414 22.4623 17.0082 22.8872 17.07L27.1291 17.6864L24.0597 20.6784Z" fill="white"/></g></g></g><defs><clipPath id="clip0_1350_47"><rect width="40" height="40" fill="white" transform="translate(0.0078125)"/></clipPath></defs></svg>
    `
}


let roomQueue = room.queue
let indexMusic = room.positionQueue
let musicOptions = room.musicOptions



audioTag.addEventListener('ended',async()=>{
    await socket.emit('indexMusic',indexMusic + 1,roomID);
})

document.getElementById('options-button-next-music').addEventListener('click',()=>{
    initVote('/indexChange','pular a musica atual',indexMusic + 1)
})
document.getElementById('options-button-back-music').addEventListener('click',()=>{
    initVote('/indexChange','voltar para a musica anterior',indexMusic - 1)
})


document.querySelectorAll('.queue-col').forEach((element,index)=>{
    element.addEventListener('click',(res)=>{
        let index = parseInt(element.getAttribute('data-index'))
        initVote('/indexChange',`Iniciar a Musica ${element.querySelector('.queue-col-music-texts-music-h1').textContent} da fila de Reprodução`,index)
    })
})



socket.on('resultCommandsMusic',async(musicIndex,room)=>{
    if (indexMusic > roomQueue.length) {
        if (musicOptions.loop == false) {
            clearMusic()
        }else{
            let dataMusic = {linkInfos:roomQueue[0]}
            addCurrentMusic(dataMusic)
        }
        

        return
    }
    let dataMusic = {linkInfos:roomQueue[musicIndex - 1]}
    addCurrentMusic(dataMusic)
})



socket.on("TimeMusicGet", async(data)=>{
    if (data.user != uid) {
        return
    }
    if (data.user == uid && data.currentTime) {
        addCurrentMusic(data)
        audioTag.currentTime = data.currentTime
    }
    if (data.data == null && room.musicaAtual.link || roomUserNumber <= 1) {
        addCurrentMusic({
            linkInfos:{
                banda: room.musicaAtual.banda,
                musica: room.musicaAtual.musica,
                thumbnail: room.musicaAtual.thumbnail,
                link: room.musicaAtual.link
            }
        })
        return
    }
    
})

socket.on('TimeMusicPost',(user,room)=>{
    if (audioTag.src || !audioTag.paused && user != uid) {
        socket.emit('resTimeMusic',{user:user,room:room,currentTime:audioTag.currentTime,linkInfos:{
            link:audioTag.src,
            musica:currentMusicTitle.textContent,
            banda:currentMusicBanda.textContent,
            thumbnail:currentMusicPic.src
        }});
    }else{
        socket.emit('resTimeMusic',{user:user,room:room,data:null});
    }
})

socket.on('getMuiscPlaylist',(data)=>{
    if (data.typeResult == 'play') {
        addCurrentMusic(data)
        successNotify('Playlist adicionada a fila e iniciada')
        document.getElementById('main-chat-row').innerHTML += `
            <div class="main-chat-command-col">
                <div class="main-chat-command-col-content">
                    <div class="main-chat-command-text">
                        <p class="main-chat-command-text-p">${data.date}</p>
                        <h1 class="main-chat-command-text-h1">O Usuário <b>${data.user.displayName}</b> adicionou uma playlist do youtube a fila de reprodução!</h1>
                    </div>
                </div>
            </div>
        `
        document.getElementById('main-chat-row').scrollTop = document.getElementById('main-chat-row').scrollHeight; 
    }else{
        let dataMusic = data.linkInfos
        roomQueue.push(dataMusic)
        successNotify('Playlist adicionada a fila')
    }
    roomQueue.push(data.linkInfos.index)
    document.getElementById('queue-row').innerHTML += `
        <div class="queue-col" data-index='${data.linkInfos.index}'>
            <div class="queue-col-count">
                <span class="queue-col-count-span">${data.linkInfos.index}</span>
            </div>
            <div class="queue-col-music-stats">
                <div class="queue-col-music-pic">
                    <img src="${data.linkInfos.thumbnail}" class="queue-col-music-pic-img">
                </div>
                <div class="queue-col-music-texts">
                    <div class="queue-col-music-texts-music">
                        <h1 class="queue-col-music-texts-music-h1">${data.linkInfos.musica}</h1>
                    </div>
                    <div class="queue-col-music-texts-banda">
                        <p class="queue-col-music-texts-banda-p">${data.linkInfos.banda}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="linha"></div>
    `
    document.querySelectorAll('.queue-col').forEach((element,index)=>{
        element.addEventListener('click',(res)=>{
            let index = parseInt(element.getAttribute('data-index'))
            initVote('/indexChange',`Iniciar a Musica ${element.querySelector('.queue-col-music-texts-music-h1').textContent} da fila de Reprodução`,index)
           
        })
    })

})


socket.on('receiveCommand',(data)=>{
    switch (data.command) {
        case '/play':
                if (data.typeResult == 'play') {
                    addCurrentMusic(data)
                    successNotify('Musica Iniciada')
                }else{
                    let dataMusic = data.linkInfos
                    dataMusic.index = data.queueIndex
                    roomQueue.push(dataMusic)
                    successNotify('Musica adicionada a fila')
                }
                document.getElementById('queue-row').innerHTML += `
                    <div class="queue-col" data-index='${data.queueIndex}'>
                        <div class="queue-col-count">
                            <span class="queue-col-count-span">${data.queueIndex}</span>
                        </div>
                        <div class="queue-col-music-stats">
                            <div class="queue-col-music-pic">
                                <img src="${data.linkInfos.thumbnail}" class="queue-col-music-pic-img">
                            </div>
                            <div class="queue-col-music-texts">
                                <div class="queue-col-music-texts-music">
                                    <h1 class="queue-col-music-texts-music-h1">${data.linkInfos.musica}</h1>
                                </div>
                                <div class="queue-col-music-texts-banda">
                                    <p class="queue-col-music-texts-banda-p">${data.linkInfos.banda}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="linha"></div>
                `
                document.getElementById('main-chat-row').innerHTML += `
                    <div class="main-chat-command-col">
                        <div class="main-chat-command-col-content">
                            <div class="main-chat-command-text">
                                <p class="main-chat-command-text-p">${data.date}</p>
                                <h1 class="main-chat-command-text-h1">O Usuário <b>${data.user.displayName}</b> adicionou a música <b>${data.linkInfos.musica}</b> a fila de reprodução!</h1>
                            </div>
                        </div>
                    </div>
                `
                document.getElementById('main-chat-row').scrollTop = document.getElementById('main-chat-row').scrollHeight; 
            break;
    
        case '/clear':
            switch (data.action) {
                case 'apagar o chat':
                    document.getElementById('main-chat-row').innerHTML = ''
                    openVote = false
                    if (document.getElementById('main-chat-vote-col')) {
                        document.getElementById('main-chat-row').removeChild(document.getElementById('main-chat-vote-col'))
                    }
                    successNotify('Chat Apagado')
                    break;
                case 'parar a musica atual':
                    openVote = false
                    if (document.getElementById('main-chat-vote-col')) {
                        document.getElementById('main-chat-row').removeChild(document.getElementById('main-chat-vote-col'))
                    }
                    let roomQueueClear = roomQueue
                    roomQueueClear.forEach((element,index)=>{
                        if (element.link == data.other.link) {
                            roomQueueClear.splice(index,1)
                            return
                        }
                        document.getElementById('queue-row').innerHTML = `
                            <div class="queue-col" data-index='${element.index}'>
                                <div class="queue-col-count">
                                    <span class="queue-col-count-span">${element.index}</span>
                                </div>
                                <div class="queue-col-music-stats">
                                    <div class="queue-col-music-pic">
                                        <img src="${element.thumbnail}" class="queue-col-music-pic-img">
                                    </div>
                                    <div class="queue-col-music-texts">
                                        <div class="queue-col-music-texts-music">
                                            <h1 class="queue-col-music-texts-music-h1">${element.musica}</h1>
                                        </div>
                                        <div class="queue-col-music-texts-banda">
                                            <p class="queue-col-music-texts-banda-p">${element.banda}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="linha"></div>
                        `
                        roomQueueClear.index = roomQueueClear.index - 1
                    })
                    
                    clearMusic()
                    successNotify('Musica Atual Apagada')
                    break
                case 'apagar a fila de reprodução':
                    roomQueue = []
                    indexMusic = 1
                    document.getElementById('queue-row').innerHTML = ''
                    clearMusic()
                    successNotify('File de reprodução Apagada')
                    break
            }
            break
        case '/indexChange':
            console.log(1);
            if (data.other > roomQueue.length || data.other <= 0) {
                return
            }
            indexMusic = data.other
            let dataMusic = {linkInfos:roomQueue[data.other - 1]}
            console.log(data.other,dataMusic);
            addCurrentMusic(dataMusic)
            break
    }
})

socket.on('receiveMessage', (data) => {
    document.getElementById('main-chat-row').innerHTML += `
        <div class="main-chat-col">
            <div class="main-chat-user-profile-pic">
                <img src="${data.user.profilePic}" class="main-chat-user-profile-pic-img">
            </div>
            <div class="main-chat-text-containner">
                <div class="main-chat-user-top">
                    <span class="main-chat-user-name-span">${data.user.displayName}</span>
                    <span class="main-chat-user-date">${data.date}</span>
                </div>
                <div class="main-chat-user-mensage">
                    <p class="main-chat-user-mensage-p">${data.mensage}</p>
                </div>
            </div>
        </div> 
    `
});

socket.on('isMyUser',(userUID)=>{
    if (userUID == uid) {
        location.href = '/conection'
    }
})

socket.on('Reqerror',(res)=>{
    errorNotify(res.errorText)
})

socket.on('join_user',(uid)=>{
    roomUsers.push(uid)
    roomUserNumber = roomUserNumber + 1
})
socket.on('leave_user',(uid)=>{
    const indexToRemove = roomUsers.indexOf(uid);
    roomUsers.splice(indexToRemove, 1);
    roomUserNumber = roomUserNumber - 1
})
