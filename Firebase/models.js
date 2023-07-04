const db = require('./db.js')


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
        const firebaseData = await db.collection(props.colecao).get();
        return model(props, firebaseData).then((res)=>{ return res })
    },
    findOne: async (props)=>{
        const firebaseData = await db.collection(props.colecao).get();
        return model(props, firebaseData).then((res)=>{
            if (props.doc) {
                let findItem = res.find(({doc})=>doc == props.doc)
                return findItem
            }
            if (props.where) {
                
                let whereKeys = Object.keys(props.where)
                let whereValues = Object.values(props.where)
                return res.find((item,index)=>{ return item[whereKeys[index]] == whereValues[index] })
            }
        })
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
