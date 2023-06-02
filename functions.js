const admin = require('firebase-admin');


module.exports = {
    isAuthenticated: async (req, res, next)=> {
        const idToken = req.session.accesstoken;
        if (!idToken) {
            res.redirect('/login');
        } else {
            await admin.auth().verifyIdToken(idToken).then(function(decodedToken) {
                if (!req.session.uid) {
                    req.session.uid = decodedToken.uid
                    req.session.accesstoken = idToken
                }
                next();
            }).catch(function(error) {
                console.error('Erro ao verificar o token de autenticação:', error);
                res.redirect('/login');
            });
        }
    },
    verifyAuthToken: async (idToken)=>{
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const uid = decodedToken.uid;
            // O token de autenticação é válido e pertence ao usuário com UID uid
            return uid
        } catch (error) {
            // O token de autenticação é inválido ou expirado
            console.error(error);
            return null;
        }
    }
}