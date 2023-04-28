let miniperfil = document.getElementById('mini-perfil-header-content')
let optionsMiniperfilContainner = document.getElementById('mini-perfil-options-containner')
let optionsMiniperfil = document.getElementsByClassName('mini-perfil-options-popup')
let optionsOpen = false



miniperfil.addEventListener('click',()=>{
    if (optionsOpen == false) {
        optionsMiniperfil[0].classList.add('optionsOpen')
        optionsOpen = true
    }else{
        optionsMiniperfil[0].classList.remove('optionsOpen')
        optionsOpen = false
    }
})
document.getElementById('close-area').addEventListener('click',()=>{
    if (optionsOpen == true) {
        optionsMiniperfil[0].classList.remove('optionsOpen')
        optionsOpen = false
    }
})