'use script'

const express=require('express')
const fs=require('fs')
const https=require('https')
const path=require('path')
const morgan=require('morgan')

const app=express();
//const directoryToServe='client'
const port= 3443
const mysql =require('mysql')
const passport = require('passport')


var cookieParser=require('cookie-parser');
var session=require('express-session');
var bodyParser=require("body-parser");
var mongoose=require('mongoose');
var flash =require('connect-flash');
//var angular=require('angularjs');

var configDB='mongodb://localhost:27017/test_1';
//var configDB = require('./config/database.js');


//connection to database
mongoose.connect(configDB,function (err) {
    if(err) throw err;
    console.log('Database Created');
});
mongoose.Promise=global.Promise;
var db =mongoose.connection;
db.on('error',console.error.bind(console,'MongoDB connection error'));


//pass passport for configuration
var routing =require('../config/passport.js') (passport);
//app.use(route);

//path for the frontend
app.use(express.static(__dirname + '/client'));

app.use(bodyParser.json());
//setup express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));


 //set view engine
app.set('view engine', 'ejs');




//required for passport
app.use(session({secret: 'AnyStringOfText',resave:true,saveUninitialized:true,cookie:{secure :true} })); //session secret
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash());

//express-session-fixation
 var fixation = require('express-session-fixation');
//
// // Register with express
 app.use(fixation({everyRequest : true}));

 app.use('/login', function(req, res, next,callback) {
     if(callback){
         throw err;
     }
     req.login();
     req.resetSessionID().then(function() {
         next();
     });
 });



//routes===============================

require('../app/routes.js') (app,passport);









// ssl/tls configuration
const httpsOptions={
	cert : fs.readFileSync(path.join(__dirname,'ssl','server.crt')),
	key : fs.readFileSync(path.join(__dirname,'ssl','server.key'))


}

https.createServer(httpsOptions,app).listen(port,function (err){
	if(err){
		return console.log("Something happened", err);
	}

	console.log(`Serving the  port ${port}`)});


