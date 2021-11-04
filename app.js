const express = require('express');
const app= express();
const https = require('https');
const fs=require('fs')
const path=require('path')
require('dotenv').config();
const {auth,requiresAuth} = require('express-openid-connect');

const port= process.env.PORT || 3000;
app.use(
    auth({
        authRequired:false,
        auth0Logout:true,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET,
    })
)
app.get('/',(req,res)=>{
    res.send(req.oidc.isAuthenticated() ? 'Logged in':'Logged out')
});
if(port!=3000){
app.listen(port, ()=> {
    console.log(`listening on port ${port}`);
});
} else{
    const sslServer=https.createServer(
        {
        key: fs.readFileSync(path.join(__dirname,'cert','key.pem')),
        cert: fs.readFileSync(path.join(__dirname,'cert','cert.pem'))
    },app)
    sslServer.listen(port,()=>console.log(`ssl server listening on port ${port}`))
}


app.get('/profile',requiresAuth(),(req,res)=> {
    res.send(JSON.stringify(req.oidc.user))
})