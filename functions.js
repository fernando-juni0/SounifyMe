const admin = require('firebase-admin');
const models = require('./Firebase/models');


module.exports = {
    isAuthenticated: async (req, res, next)=> {
        const idToken = req.session.accesstoken;
        if (!idToken) {
            res.redirect('/login?redirect='+req.originalUrl);
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
    },
    removeArrayEmpty: (array)=>{
        var arrayFilter = array.filter(function(elemento) {
            return elemento !== '' && elemento !== null && elemento !== undefined;
        });
        
        var index = array.indexOf('');
        if (index > -1) {
          array.splice(index, 1);
        }
        return arrayFilter
    },
    numberFormater: (array)=>{
        // -----

        // inacabado!!!!!!!!!!!
        
        // -----
        function formatarNumero(number) {
            let numero = parseInt(number)
            var resultado = numero.toString();

            switch (true) {
                case numero >= 1000000000:
                    var bilhao = Math.floor(numero / 1000000000);
                    resultado = bilhao + " bi";
                break;

                case numero >= 1000000:
                    var milhao = Math.floor(numero / 1000000);
                    resultado = milhao + " mi";
                break;

                case numero >= 1000:
                    var mil = Math.floor(numero / 1000);
                    resultado = mil + " mil";
                break;

                default:
                    resultado = resultado;
                break;
            }

            return resultado;
        }
        if (number) {
            formatarNumero(number)
        }
        if (array) {
            var arrayFormatado = [];

            for (var i = 0; i < array.length; i++) {
                var numeroFormatado = formatarNumero(array[i]);
                arrayFormatado.push(numeroFormatado);
            }
        
            return arrayFormatado;
        }
    },
    stringLimit: (str,maxLength)=>{
        if (str.length <= maxLength) {
            return str; // Retorna a string original se já estiver dentro do tamanho desejado
        } else {
            // Procura o último espaço antes do tamanho desejado
            var ultimoEspaco = str.lastIndexOf(' ', maxLength);
            if (ultimoEspaco !== -1) {
            // Se encontrou um espaço antes do tamanho desejado, retorna a substring até esse ponto
                return str.substring(0, ultimoEspaco);
            } else {
            // Se não encontrou um espaço antes do tamanho desejado, retorna a substring até o tamanho
                return str.substring(0, maxLength);
            }
        }
    },
    findUser: async (array,pagina, porPagina)=>{
        if (array.length <= 0) {
            return null
        }
        let findIni = parseInt((pagina * porPagina) - porPagina)
        let findEnd = parseInt(findIni + porPagina)

        let arrayModify = array.length <= porPagina ? array : array.slice(findIni, findEnd)
        let userData = await arrayModify.map(async(result)=>{
            let findUser = await models.findOne({colecao:'users',doc:result})
            if (findUser) {
                return {
                    displayName: findUser.displayName,
                    profilePic: findUser.profilePic,
                    uid: findUser.uid
                }  
            }else{
                return null
            }
            
            
        })
        return await Promise.all(userData)
        
    },
    userModel: async (result,removeArrayEmpty)=>{
        let seguindo = removeArrayEmpty(result.folowInfo.seguindo)
        let playlist = removeArrayEmpty(result.playlist)
        let seguidores = removeArrayEmpty(result.folowInfo.seguidores)
        return {
            uid: result.uid,
            profilePic: result.profilePic,
            email: result.email,
            displayName: result.displayName,
            banda: result.banda,
            banner:result.banner,
            folowInfo: {
                seguindo,
                seguidores
            },
            playlist: playlist,
            playlistString: JSON.stringify(playlist),
            joinroom:result.joinroom
        }
    }
}
module.exports.removeArrayEmpty = module.exports.removeArrayEmpty.bind(module.exports);
module.exports.numberFormater = module.exports.numberFormater.bind(module.exports);