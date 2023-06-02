import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, browserSessionPersistence ,setPersistence,  signInWithPopup ,createUserWithEmailAndPassword,fetchSignInMethodsForEmail, onAuthStateChanged, signInWithEmailAndPassword  } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


var firebaseDATA = null
await $.post('/firebaseApp', (data)=>{
    firebaseDATA = data
})


const firebaseApp = initializeApp(firebaseDATA);
const provider = new GoogleAuthProvider();

const auth = getAuth();

document.getElementById('body-containner').hide()

auth.onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById('userAutenticate').value = JSON.stringify(user)
        document.getElementById('formignore').submit()
    }else{
        document.getElementById('body-containner').show('block')
    }
});


document.getElementById('emailFormLogin').addEventListener('submit',(e)=>{
    e.preventDefault()
    const email = document.getElementById('emailLogin').value
    const password = document.getElementById('senhaLogin').value
    const mensage = document.getElementById('fail-login')
    if (email.trim() === '' || password.trim() === '') {
        if (email.trim() === '' ) {
            mensage.innerText = 'Digite um email!'
            return false
        }
        if (password.trim() === '') {
            mensage.innerText = 'Digite uma senha!'
            return false
        }
    }
    reloadActivate()
    setTimeout(()=>{
        document.getElementById('emailFormLogin').submit()
    },1000)
    
})

document.getElementById('emailFormCadastro').addEventListener('submit',(e)=>{
    e.preventDefault()
    const user = document.getElementById('userCadastro').value
    const email = document.getElementById('emailCadastro').value
    const password = document.getElementById('senhaCadastro').value
    const termos = document.getElementById('checkbox1')
    const mensage = document.getElementById('fail-cadastro')
    if (user.trim() === '' || email.trim() === '' || password.trim() === '' || termos.checked == false) {
        if (user.trim() === '') {
            mensage.innerText = 'Digite um usuario!'
            return false
        }
        if (email.trim() === '') {
            mensage.innerText = 'Digite um email!'
            return false
        }
        if (password.trim() === '') {
            console.log(1);
            mensage.innerText = 'Digite uma senha!'
            return false
        }
        if (termos.checked == false) {
            console.log(1);
            mensage.innerText = 'Aceite os termos de uso para continuar!'
            return false
        }
        
    }else{
        reloadActivate()
        setTimeout(()=>{
            document.getElementById('emailFormCadastro').submit()
        },1000)
    }

})


document.getElementById('googleLogin').addEventListener('click',()=>{
    signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
        if (user) {
            document.getElementById('user').value = JSON.stringify(user)
            reloadActivate()
            setTimeout(()=>{
                document.getElementById('googleFormLogin').submit()
            },1000)
        }
    })
})

var checkbox = document.getElementById('remember-input')
document.getElementById('remember-content').addEventListener('click',()=>{
    checkbox.checked = !checkbox.checked;
    if (checkbox.checked) {
        document.getElementById('check-circle').show()
    }else{
        document.getElementById('check-circle').hide()
    }
})



var url = new URL(window.location.href);
var params = new URLSearchParams(url.search);



let larguraDaTela = window.innerWidth

if (larguraDaTela <= 1200) {
    indexPageMini()
}else{
    indexPage()
}


window.addEventListener('resize',()=>{
    larguraDaTela = window.innerWidth
    if (larguraDaTela <= 1200) {
        indexPageMini()
    }else{
        indexPage()
    }
});

function indexPageMini() {
    if(params.get('login') == 'false'){
        document.getElementById('login-form-containner').hide()
        document.getElementById('cadastro-form-containner').css({
            display:'flex',
            width:'100%'
        })
        document.getElementById('cadastro-form-content').show('flex')
        
    }else {
        document.getElementById('cadastro-form-containner').hide()
        document.getElementById('login-form-containner').css({
            display:'flex',
            width:'100%'
        })
        document.getElementById('login-form-content').show('block')
    }
}

function  indexPage(){
    document.getElementById('login-form-containner').css({
        display:'flex',
        width:'50%'
    })
    document.getElementById('cadastro-form-containner').css({
        display:'flex',
        width:'50%'
    })
    if(params.get('login') == 'false'){
        document.querySelector('#login-img-containner img').css({
            borderRadius: '10px 0 0 10px',
            left:'50%'
        })
        document.getElementById('login-form-content').hide()
        document.getElementById('cadastro-form-content').show('flex')
    }else{
        document.getElementById('login-form-content').show('block')
        document.getElementById('cadastro-form-content').hide()
    }
    
}

document.getElementById('button-cadastro').addEventListener('click',()=>{
    if (larguraDaTela <= 1200) {
        console.log(1);
        loginAnimation(false,'right',false) 
    }else{
        loginAnimation(true,'right',false) 
    }
    
})


document.getElementById('button-login').addEventListener('click',()=>{
    if (larguraDaTela <= 1200) {
        console.log(1);
        loginAnimation(false,'left',false) 
    }else{
        loginAnimation(true,'left',false) 
    }
})



function loginAnimation(animation, direction,pageReload) {
    
    
    
    if (direction == 'right') {
        if (pageReload == false) {
            params.set('login', 'false');
            url.search = params.toString();
            history.pushState(null, null, url.href);
        }
        if (animation == false) {
            document.getElementById('login-form-containner').hide()
            document.getElementsByClassName('loader-containner')[0].css({
                display:'flex',
                width:'100%'
            })
            setTimeout(()=>{
                document.getElementById('cadastro-form-containner').css({
                    display:'flex',
                    width:'100%'
                })
                document.getElementById('cadastro-form-content').show('flex')
                document.getElementsByClassName('loader-containner')[0].hide()
            },2000)
            return
        }

        document.getElementsByClassName('loader-containner')[1].show("flex")
        document.getElementsByClassName('loader-containner')[0].show("flex")
        document.getElementById('login-form-content').hide()
        document.querySelector('#login-img-containner img').css({
            borderRadius: '0 10px 10px 0',
            animation:'rightMenu 2s forwards'
        })
        setTimeout(()=>{
            document.getElementById('cadastro-form-content').show('flex')
        },2000)
    }else if(direction == 'left'){
        if (pageReload == false) {
            params.set('login', 'true');
            url.search = params.toString();
            history.pushState(null, null, url.href);
        }
        
        if (animation == false) {
            document.getElementById('cadastro-form-containner').hide()
            document.getElementsByClassName('loader-containner')[0].css({
                display:'flex',
                width:'100%'
            })
            setTimeout(()=>{
                document.getElementById('login-form-containner').css({
                    display:'flex',
                    width:'100%'
                })
                document.getElementById('login-form-content').show('block')
                document.getElementsByClassName('loader-containner')[0].hide()
            },2000)
            return
        }
        document.getElementsByClassName('loader-containner')[1].show("flex")
        document.getElementsByClassName('loader-containner')[0].show("flex")
        document.getElementById('cadastro-form-content').hide()
        document.querySelector('#login-img-containner img').css({
            borderRadius: '10px 0 0 10px',
            animation:'leftMenu 2s forwards'
        })
        setTimeout(()=>{
            document.getElementById('login-form-content').show('block')
        },2000)
    }
    setTimeout(()=>{
        document.getElementsByClassName('loader-containner')[1].hide()
        document.getElementsByClassName('loader-containner')[0].hide()
    },2000)
}



