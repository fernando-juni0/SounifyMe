const socket = io();

window.addEventListener('beforeunload', function (event) {
    
});

var url = window.location.pathname
var partes = url.split("/");
var roomID = partes.pop();



// if (joinroom == null || joinroom == '') {
//     location.href = '/conection'
// }


// $.ajax({
//     traditional: true,
//     url: '/getAudioURL?url=https://www.youtube.com/watch?v=O4irXQhgMqg&list=RD9-XJw7SYBLY&index=10',
//     type: 'POST',
//     success: function(response) {
//         if (response.success == true) {
//             console.log(1);
//             const audioPlayer = document.getElementById('audioPlayer');
//             audioPlayer.src = data.audioURL;
//             audioPlayer.style.display = 'block';
//             audioPlayer.play();
//         }
//     },
//     error: function(xhr, status, error) {
//         console.error(error);
//     }
// })

socket.emit('joinRoom', {roomID:roomID, uid:uid});


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
    var primeiraPalavra = palavras[0];
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear().toString().substring(2);
    const dataHoraFormatada = dataAtual.toLocaleString('pt-BR').replace('20' + anoAtual, anoAtual).replace(/:\d{2}$/, '').replace(',', ' ás')
    if (primeiraPalavra == '/play') {
        let link = palavras[1]
        input = ''
        socket.emit('getCommand',{room:roomID, command:primeiraPalavra, link:link, user:{uid:uid,displayName:displayName,profilePic:profilePic},date:dataHoraFormatada});
        return
    }
    input = ''
    socket.emit('sendMessage',{room:roomID, mensage:inputContain, user:{uid:uid,displayName:displayName,profilePic:profilePic},date:dataHoraFormatada});
    
}

socket.on('receiveCommand',(data)=>{
    switch (data.command) {
        case '/play':
            let audioTag = document.getElementById('audioTag')
            audioTag.src = data.linkInfos.link
            audioTag.play()
            
            break;
    
        default:
            break;
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