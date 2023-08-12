// const socket = io();

// Cria uma nova sala quando o botão "Criar Sala" é clicado
// function createRoom() {
//     const roomNameInput = document.getElementById('roomName');
//     const roomName = roomNameInput.value.trim();
//     if (roomName !== '') {
//         socket.emit('createRoom', roomName);
//         roomNameInput.value = '';
//     }
// }

// // Atualiza a lista de salas na página
// function updateRooms(rooms) {
//     const roomListElement = document.getElementById('roomList');
//     roomListElement.innerHTML = '';

//     rooms.forEach((room) => {
//     const listItem = document.createElement('li');
//     listItem.textContent = room;
//     listItem.onclick = () => {
//         // Conecta-se à sala quando uma sala da lista é clicada
//         socket.emit('joinRoom', room);
//     };
//     roomListElement.appendChild(listItem);
//     });
// }

// Evento para atualizar a página com os dados recebidos do servidor
// socket.on('updateRooms', (rooms) => {
//     updateRooms(rooms);
// });




document.getElementById('find-room-icon').addEventListener('click',()=>{
    if (document.getElementById('find-room-input').value == 0) {
        document.getElementById('find-room-input').focus()
    }else{
        findRoom(document.getElementById('find-room-input').value)
    }
})

addEventListener('keypress',(keyArray)=>{
    let keyCode = keyArray.keyCode
    if (keyCode == 13) {
        if (document.getElementById('find-room-input').value > 0) {
            findRoom(document.getElementById('find-room-input').value)
        }else{

        }
    }
})

function findRoom(value){
    console.log(value);
}


document.querySelectorAll('.server-list-col').forEach((element,index)=>{
    element.addEventListener('click',()=>{
        let roomId = element.getAttribute('data-roomId')
        $.ajax({
            traditional: true,
            url: '/findconnection',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                roomId: roomId,
                
            } ), 
            success: function(response) {
                if (response.success == true) {
                    let room = response.room
                    document.getElementById('server-list-right-containner').innerHTML = `
                            <div id="server-list-right-content">
                            <div id="server-list-right-top-infos">
                                <div id="room-right-pic">
                                    <img id="room-right-pic-img" src="${room.roomPic}" >
                                </div>
                                <div id="room-right-title">
                                    <h1 id="room-right-title-h1">${room.roomName}</h1>
                                </div>
                            </div>
                            <div class="linha"></div>
                            <div id="server-list-right-music-infos">
                                <h1 id="room-right-tocando">Tocando</h1>
                                <div id="room-right-music-pic">
                                    <img id="room-right-music-pic-img" src="../public/img/exempleImg.jpg">
                                </div>
                                <div id="room-right-music-name">
                                    <h1 id="room-right-music-name-h1">Nome da Musica</h1>
                                </div>
                                <div id="room-right-music-banda">
                                    <p id="room-right-music-banda-p">Nome da Banda</p>
                                </div>
                            </div>
                            <div class="linha"></div>
                            <div id="server-list-right-others-infos">
                                <div id="server-list-right-others-infos-islocked">
                                    <h1 id="server-list-right-others-infos-islocked-h1">${room.islocked == false ? "Sem Senha" : "Com Senha"}</h1>
                                </div>
                                <div id="server-list-right-others-infos-estilos">
                                    <h1 id="server-list-right-others-infos-estilos-h1">${room.estilos}</h1>
                                </div>
                                <div id="server-list-right-others-infos-pessoas">
                                    <h1 id="server-list-right-others-infos-pessoas-h1">${room.pessoas.length} pessoas de ${room.maxpessoas}</h1>
                                </div>
                                
                            </div>
                            <div class="linha"></div>
                            <div id="server-list-right-button-containner">
                                <div id="server-list-right-button-content" data-roomId="${room.roomId}">
                                    <span id="server-list-right-button-span">Entrar</span>
                                    <svg id="server-list-right-button-svg" viewBox="-27 0 448 448" xmlns="http://www.w3.org/2000/svg"><path d="m341.332031 448h-224v-138.667969h21.335938v117.335938h202.664062c17.601563 0 32-14.402344 32-32v-341.335938c0-17.597656-14.398437-32-32-32h-202.664062v117.335938h-21.335938v-138.667969h224c29.46875 0 53.335938 23.867188 53.335938 53.332031v341.335938c0 29.464843-23.867188 53.332031-53.335938 53.332031zm0 0"></path><path d="m203.867188 312.535156-15.066407-15.070312 73.464844-73.464844-73.464844-73.464844 15.066407-15.070312 88.53125 88.535156zm0 0"></path><path d="m0 213.332031h277.332031v21.335938h-277.332031zm0 0"></path></svg>
                                </div>
                            </div>
                        </div>
                    `
                    document.getElementById('server-list-right-button-content').addEventListener('click',()=>{
                        joinRoom({roomID:document.getElementById('server-list-right-button-content').getAttribute('data-roomId'), uid:uid})
                    })
                }
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
})



document.querySelectorAll('.enter-room').forEach((element,index)=>{
    element.addEventListener('click',()=>{
        joinRoom({roomID:element.getAttribute('data-roomId'), uid:uid})
    })
})
function joinRoom(data) {
    // socket.emit('joinRoom', {roomID:data.roomID, uid:data.uid});
    location.href = '/room/'+data.roomID
}

