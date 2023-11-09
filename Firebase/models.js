const db = require('./db.js')
const { Readable } = require('stream');

async function  model(props,firebase) {
    let arrayData = []
    firebase.forEach((doc)=>{
            var data = doc.data()
            data.doc = doc.id

            arrayData.push(data)
        })
    return await Promise.all(arrayData);
    
}

module.exports = {
    findAll: async (props)=> {
        const firebaseData = db.collection(props.colecao);
        return new Promise((resolve, reject) => {
            const outputStream = new Readable({ objectMode: true });
            outputStream._read = () => {};
        
            firebaseData.get().then((snapshot) => {
                snapshot.forEach((doc) => {
                  const data = doc.data();
                  outputStream.push(data);
                });
        
                outputStream.push(null); // Indica o fim da stream
                resolve(outputStream.toArray());
            }).catch((error) => {
                console.error('Erro ao buscar dados do Firestore:', error);
                reject(error);
            });
        
            outputStream.on('error', (err) => {
                console.error(err);
                reject(err);
            });
        });
        
        // return model(props, firebaseData).then((res)=>{ return res })
    },
    findOne: async (props)=>{

        let firebaseData = await db.collection(props.colecao).get()
        if (props.doc) {
            return model(props, firebaseData).then((res)=>{
                let findItem = res.find(({doc})=>doc == props.doc)
                return findItem
            })
        }
        if (props.where) {
            let firebaseDataWhere = await db.collection(props.colecao).where(props.where[0],props.where[1],props.where[2]).get()
            let data = await model(props,firebaseDataWhere)
            return data[0]
        }
    },
    update: async(colecao, documento, dados)=>{
        await db.collection(colecao).doc(documento).update(dados);
        return 
    },
    delete: async(colecao, documento)=>{
        await db.collection(colecao).doc(documento).delete();
        return
    },
    create: async (colecao,name,dados)=> {
        const firebaseData = db.collection(colecao).doc(name);
        await firebaseData.set(dados);
        return
    }    
}
