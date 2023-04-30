let miniperfil = document.getElementById('mini-perfil-header-content')
let optionsMiniperfil = document.getElementsByClassName('mini-perfil-options-popup')
let header = document.getElementById('header')
let miniHeader = document.getElementById('miniHeader')

miniperfil.addEventListener('click',()=>{
    optionsMiniperfil[0].classList.toggle('optionsOpen')
})


document.getElementById('hamburgerMenu').addEventListener('click', ()=>{
    header.toggle()
    miniHeader.toggle('flex')
})
