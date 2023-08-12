import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signOut} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';



let miniperfil = document.getElementById('mini-perfil-header-content')
let optionsMiniperfil = document.getElementsByClassName('mini-perfil-options-popup')
let miniPerfilMiniHeader = document.getElementById('profile-image-miniheader')
let header = document.getElementById('header')
let miniHeader = document.getElementById('miniHeader')

miniperfil.addEventListener('click',()=>{
    optionsMiniperfil[0].classList.toggle('optionsOpen')
})

miniPerfilMiniHeader.addEventListener('click',()=>{
    optionsMiniperfil[0].classList.toggle('optionsOpen')
})

document.getElementById('close-options').addEventListener('click',()=>{
    optionsMiniperfil[0].classList.toggle('optionsOpen')
})

const menuType = localStorage.getItem('menu')

if (menuType == null || menuType == undefined) {
    localStorage.setItem('menu','full')
}else if(menuType == 'full'){
    header.show('flex')
    miniHeader.hide()
}else{
    document.getElementById('main-containner').style.width = 'calc(100% - 4em)'
    header.hide()
    miniHeader.show('flex')
}



document.getElementById('hamburgerMenu').addEventListener('click', ()=>{
    header.toggle()
    miniHeader.toggle('flex')
    if (miniHeader.style.display == 'none') {
        document.getElementById('main-containner').style.width = 'calc(100% - 15em)'
        localStorage.setItem('menu','full')
    }else{
        document.getElementById('main-containner').style.width = 'calc(100% - 4em)'
        localStorage.setItem('menu','mini')
    }
    
})
var windowWidth = window.innerWidth
if (windowWidth <= 1000) {
    setMenuResize()
}   
addEventListener('resize',()=>{
    windowWidth = window.innerWidth
    if (windowWidth <= 1000) {
        setMenuResize()
    }   
})
function setMenuResize() {
    if (localStorage.getItem('menu') == 'full') {
        header.hide()
        miniHeader.show('flex')
        document.getElementById('main-containner').style.width = 'calc(100% - 4em)'
        localStorage.setItem('menu','mini')
    } 
}


document.getElementById('logout').addEventListener('click',()=>{
    location.href = '/logout'
})
var numberPlaylist = parseInt(playlists.length)

document.querySelectorAll('.playlistCreate').forEach(element=>{
    element.addEventListener("click",()=>{

        $.ajax({
            traditional: true,
            url: '/createPlaylist/' + uid,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                numberPlaylist: numberPlaylist + 1
            } ), 
            success: function(response) {
                console.log(response);
               if (response.success == true) {
                    numberPlaylist + 1
                    document.querySelector('#playlists-created-mini').innerHTML += `
                            <li><a href="/playlist/${response.newPlaylist.playlistUID}"><img class="svg-icons-Miniheader" src="${response.newPlaylist.playlistImg}" alt=""><span class="miniHeader-text-links">${response.newPlaylist.playlistName}</span></a></li>
                        `
                    
                    document.querySelector('#playlists-created').innerHTML += `
                            <li><a href="/playlist/${response.newPlaylist.playlistUID}"><img class="svg-icons-header" src="${response.newPlaylist.playlistImg}" alt=""><span class="header-text-links">${response.newPlaylist.playlistName}</span></a></li>
                        `
               }
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        })
    })
})

