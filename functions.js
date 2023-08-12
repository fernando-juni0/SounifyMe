const admin = require('firebase-admin');
const models = require('./Firebase/models');
const ytdl = require('ytdl-core');

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
    },
    frequenceData: async (dadosRecebidos)=>{
        if (dadosRecebidos.length === 0) {
            console.log('Ainda não há dados recebidos.');
            return null;
        }
    
        // Crie um objeto para armazenar a contagem dos dados
        const contador = {};
    
        // Percorra o array de dados recebidos e conte a frequência de cada dado
        dadosRecebidos.forEach(dado => {
            contador[dado] = (contador[dado] || 0) + 1;
        });
    
        // Encontre o dado com a maior frequência
        let dadoMaisFrequente = dadosRecebidos[0];
        let frequenciaMaisAlta = contador[dadosRecebidos[0]];
    
        for (const dado in contador) {
            if (contador[dado] > frequenciaMaisAlta) {
            frequenciaMaisAlta = contador[dado];
            dadoMaisFrequente = dado;
            }
        }
    
        console.log('Dado mais frequente:', dadoMaisFrequente);
        console.log('Frequência:', frequenciaMaisAlta);
        return dadoMaisFrequente
    },
    percentualNumber: async (initialValue,finalValue,thresholdPercentage)=>{
        const thresholdValue = (initialValue * thresholdPercentage) / 100;
        
        if (finalValue >= thresholdValue) {
            return true
        }else{
            return false
        } 
    },
    searchTrackLink:async (songName)=> {
        const accessToken = await require('./Firebase/authentication').authenticateSpotify();
      
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      
        const data = await response.json();
        
        if (data.tracks && data.tracks.items.length > 0) {
            const track = data.tracks.items[0];
            const response2 = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(track.external_urls.spotify)}`);
            const data2 = await response2.json();
            
            const info = await ytdl.getInfo(data2.linksByPlatform.youtube.url);
            const link = ytdl.chooseFormat(info.formats, { filter: 'audioonly' }).url
            const trackInfo = {
                thumbnail: track.album.images[0].url,
                musica: track.name,
                banda: track.artists[0].name,
                link: link,
            };
            return trackInfo;
        } else {
          console.log('Nenhuma música encontrada.');
        }
    }
    
}
module.exports.removeArrayEmpty = module.exports.removeArrayEmpty.bind(module.exports);
module.exports.numberFormater = module.exports.numberFormater.bind(module.exports);