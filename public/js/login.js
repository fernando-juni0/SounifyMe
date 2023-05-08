import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, browserSessionPersistence ,setPersistence,  signInWithPopup ,createUserWithEmailAndPassword,fetchSignInMethodsForEmail, onAuthStateChanged, signInWithEmailAndPassword  } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';



var firebaseDATA = null
await $.post('/firebaseApp', (data)=>{
    firebaseDATA = data
})


const firebaseApp = initializeApp(firebaseDATA);
const provider = new GoogleAuthProvider();

const auth = getAuth();



document.getElementById('emailFormLogin').addEventListener('submit',(e)=>{
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('senha').value
    if (email == null || email == undefined || email == "" && password == null || password == undefined || password == "") {
        console.log('digite um email e uma senha');
    }else{
        fetchSignInMethodsForEmail(auth,email).then((signInMethods) => {
            setPersistence(auth, browserSessionPersistence).then(() => {
                if (signInMethods.length > 0) {
                    console.log('usuario existe');
                    return signInWithEmailAndPassword( auth,email, password).then((userCredential) => {
                        const user = userCredential.user;
                        if (user) {
                            $.ajax({
                                traditional: true,
                                url: '/auth/email',
                                type: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify( user ),
                                dataType: 'json',
                                success: function(response){ console.log( "success" ); },
                                error: function(err){
                                    console.log(err);
                                }
                            })
                            reloadActivate()
                            setTimeout(()=>{
                                document.getElementById('emailFormLogin').submit()
                            },1000)
                            
                        }
                    })
                } else {
                    console.log('usuario não existe');
                    return createUserWithEmailAndPassword(auth,email,password).then((userCredential) => {
                        const user = userCredential.user;
                        if (user) {
                            $.ajax({
                                traditional: true,
                                url: '/auth/email',
                                type: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify( user ),
                                dataType: 'json',
                                success: function(response){ console.log( "success" ); },
                                error: function(err){
                                    console.log(err);
                                }
                            })
                            reloadActivate()
                            setTimeout(()=>{
                                document.getElementById('emailFormLogin').submit()
                            },1000)
                            
                        }
                    })
                }
            })
        })
    }
    
      
})
document.getElementById('googleLogin').addEventListener('click',()=>{
    signInWithPopup(auth, provider).then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        if (user) {
            $.ajax({
                traditional: true,
                url: '/auth/Google',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify( user ),
                dataType: 'json',
                success: function(response){ console.log( "success" ); },
                error: function(err){
                    console.log(err);
                }
            })
            reloadActivate()
            setTimeout(()=>{
                console.log(1);
                document.getElementById('googleFormLogin').submit()
            },1000)
        }
    })
})