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


var firebaseDATA = null
await $.post('/firebaseApp', (data)=>{
    firebaseDATA = data
})

const firebaseApp = initializeApp(firebaseDATA);
const auth = getAuth();

document.getElementById('logout').addEventListener('click',()=>{
    location.href = '/logout'
})

