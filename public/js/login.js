import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, browserSessionPersistence ,setPersistence,  signInWithPopup ,createUserWithEmailAndPassword,fetchSignInMethodsForEmail, onAuthStateChanged, signInWithEmailAndPassword  } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


var firebaseDATA = null
await $.post('/firebaseApp', (data)=>{
    firebaseDATA = data
})


const firebaseApp = initializeApp(firebaseDATA);
const provider = new GoogleAuthProvider();

const auth = getAuth();

function handleCredentialResponse(response) {
    console.log(response);
  }
  
function onSignIn(){
    console.log(2);
}


auth.onAuthStateChanged(function(user) {
    if (user) {
        document.getElementById('userAutenticate').value = JSON.stringify(user)
        document.getElementById('formignore').submit()
    }
});


document.getElementById('emailFormLogin').addEventListener('submit',(e)=>{
    e.preventDefault()
    reloadActivate()
    const email = document.getElementById('email').value
    const password = document.getElementById('senha').value
    if (email == null || email == undefined || email == "" && password == null || password == undefined || password == "") {
        console.log('digite um email e uma senha');
    }else{
        setTimeout(()=>{
            document.getElementById('emailFormLogin').submit()
        },1000)
    } 
})


document.getElementById('googleLogin').addEventListener('click',()=>{
    signInWithPopup(auth, provider).then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
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