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

var connection=mysql.createConnection({
    'host':'mydbinstance.cm9l4ehvcosw.us-east-1.rds.amazonaws.com',
    'user':'stanneru',
    'password':'Momndad_99'
});
//connection.connect();
connection.query('USE chain_reaction',function (err) {
    if(err)
        throw err;
    console.log('Connected to MySQL Database');
});


var cookieParser=require('cookie-parser');
var session=require('express-session');
var bodyParser=require("body-parser");
var mongoose=require('mongoose');
var flash =require('connect-flash');
//var angular=require('angularjs');

// var configDB='mongodb://localhost:27017/test_1';
// //var configDB = require('./config/database.js');
// //
// //
// // //connection to database
// mongoose.connect(configDB,function (err) {
//     if(err) throw err;
//     console.log('Database Created');
// });
// mongoose.Promise=global.Promise;
// var db =mongoose.connection;
// db.on('error',console.error.bind(console,'MongoDB connection error'));


//pass passport for configuration
require('../config/passport.js') (passport,connection);
//app.use(route);

//path for the frontend
//app.use(express.static(__dirname + '/client'));

//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
//setup express application
app.use(morgan('dev'));
app.use(cookieParser());



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

require('../app/routes.js') (app,passport,connection);










// ssl/tls configuration
const httpsOptions={
	cert : fs.readFileSync(path.join(__dirname,'ssl','server.crt')),
	key : fs.readFileSync(path.join(__dirname,'ssl','server.key'))


}

https.createServer(httpsOptions,app).listen(port,function (err){
	if(err){
		return console.log("Something happened", err);
	}

	console.log(`Serving the port ${port}`)});


