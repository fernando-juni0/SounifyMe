import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth,GoogleAuthProvider, signInWithPopup , onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';



var firebaseDATA = null
await $.post('/firebaseApp', (data)=>{
    firebaseDATA = data
})


const firebaseApp = initializeApp(firebaseDATA);
const provider = new GoogleAuthProvider();

const auth = getAuth();

document.getElementById('googleLogin').addEventListener('click',()=>{
    signInWithPopup(auth, provider)
    .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
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
                window.location.href = '/home'
            }, 2000);
            
        }
    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
    });
})