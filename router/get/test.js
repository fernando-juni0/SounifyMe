const Router = require('express').Router();

Router.get('/test',(req,res)=>{
    res.send('TEST')
})

module.exports = Router