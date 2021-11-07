const express = require('express');
const app= express();
const https = require('https');
const fs=require('fs')
const path=require('path')
require('dotenv').config();
const {auth,requiresAuth} = require('express-openid-connect');
const port= process.env.PORT;
var locations= [];
var user1= ['Zlatko123@mailinator.com','45.76663','15.77883'];
var user2= ['Vlatko123@mailinator.com','45.77663','15.76883'];
var user3= ['Mirko123@mailinator.com','45.78663','15.75883'];
var user4= ['Ratko123@mailinator.com','45.77333','15.73883'];
var user5= ['Kristijan123@mailinator.com','45.726663','15.71883'];
locations.push(user1);
locations.push(user2);
locations.push(user3);
locations.push(user4);
locations.push(user5);
const axiosConfig= {
    baseUrl: process.env.BASE_URL
}
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

if(port!=3000){
app.listen(port, ()=> {
    console.log(`listening on port ${port}`);
})
} else{
    const sslServer=https.createServer(
        {
        key: fs.readFileSync(path.join(__dirname,'cert','key.pem')),
        cert: fs.readFileSync(path.join(__dirname,'cert','cert.pem'))
    },app)
    sslServer.listen(port,()=>console.log(`ssl server listening on port ${port}`))
}

app.get('/profile',requiresAuth(),(req,res)=> {
    res.send(JSON.stringify(req.oidc.user.name))
})
app.get('/',(req,res)=>{
    res.send(req.oidc.isAuthenticated() ? 'Logged in':'Logged out')
});

app.get('/map',requiresAuth(),(req,res)=>{
    
res.writeHead(200,{
    'Content-Type':'text/html'
    });
fs.readFile('./index.html',null,function (error, data) {
    if (error) {
        res.writeHead(404);
        res.write('Whoops! File not found!');
    } else {
        res.write(data);
    }
    res.end();
    });
})
function isUsernameInArray(arr, username){
    var item_as_string = JSON.stringify(username);
    var bool=false;
     for(var i=0;i<arr.length;i++){
            if(arr[i][0]==username){
                bool=true;
            }
     }
    return bool;
  }
app.post('/map/location/:latitude/:longitude/',requiresAuth(),(req,res)=>{
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date+' '+time;
        var latitude=req.params.latitude;
        var longitude=req.params.longitude;
        var userlocation= [];
        var username=req.oidc.user.name;
        userlocation.push(username);
        userlocation.push(latitude);
        userlocation.push(longitude);
        userlocation.push(dateTime);
        if(isUsernameInArray(locations,userlocation[0])){
            res.end();
        }else{
            if(locations.length==5){
                locations.shift();
                locations.push(userlocation);
            }
            locations.push(userlocation);
            res.end();
        }
        
        

})
app.get('/map/locations',requiresAuth(),(req,res)=>{
            res.send(locations);
})
