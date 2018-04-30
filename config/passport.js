//load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
//load up the user model
var User= require('../app/models/user.js');
var PlayMove=require('../app/models/PlayMoves');
var bcrypt = require('bcrypt-nodejs');
// var mysql=require('mysql');
// var connection=mysql.createConnection({
//     'host':'mydbinstance.cm9l4ehvcosw.us-east-1.rds.amazonaws.com',
//     'user':'stanneru',
//     'password':'Momndad_99'
// });
// connection.query('USE chain_reaction');

//expose this function to our app using module.exports
module.exports=function (passport,connection) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        // User.findById(id, function(err, user) {
        //     if(err) {
        //         console.log('There was an error accessing the records of' +
        //             ' user with id: ' + id);
        //         //return console.log(err.message);
        //         done(err);
        //     }
        //     done(null, user);
        // })

        connection.query("select * from users where id = ?",[id],function(err,rows){
            done(err,rows[0]);

        });

    });

        // =========================================================================
        // LOCAL SIGNUP ============================================================
        // =========================================================================
        // we are using named strategies since we have one for login and one for signup
        // by default, if there was no name, it would just be called 'local'

        passport.use('local-signup', new LocalStrategy({
                // by default, local strategy uses username and password, we will override with username
                usernameField : 'username',
                passwordField : 'password',
                passReqToCallback : true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) {

                // asynchronous
                // User.findOne wont fire unless data is sent back
                // process.nextTick(function() {
                var re = RegExp('^[A-Za-z0-9_.]{3,12}$');
                if (false == re.test(username)) {
                    return done(null, false, req.flash('signupMessage', 'username is invalid'));
                }
                var Pasre = RegExp('^[A-Za-z0-9_.@#$*!^]{6,20}$');
                if (false == Pasre.test(password)) {
                    return done(null, false, req.flash('signupMessage', 'password is invalid'));
                }

                // find a user whose username is the same as the forms username
                // we are checking to see if the user trying to login already exists
                //         User.findOne({ username :  username }, function(err, user) {
                //             // if there are any errors, return the error
                //             if (err)
                //                 return done(err);
                //             /*if(err.message== 'User validation failed'){
                //                 console.log('please fill all fields');
                //                 return done(null,false,req.flash('signupMessage','Please fill all fields'));
                //             }*/
                //
                //             // check to see if theres already a user with that username
                //             if (user) {
                //                 console.log('username exists');
                //                 return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                //             } else {
                //
                //                 // if there is no user with that username
                //                 // create the user
                //                 var newUser            = new User();
                //
                //                 // set the user's local credentials
                //                  newUser.username    = username;
                //                  newUser.password = bcrypt.hashSync(password,null,null);
                //
                //                  console.log('values entered');
                //
                //
                //                 // save the user
                //                 newUser.save(function(err) {
                //                     if (err)
                //                         throw err;
                //                     console.log('values saved in the database');
                //                     return done(null, newUser);
                //
                //                 });
                //             }
                //
                //         });
                //
                //     //});
                //
                // }));
                var selectQuery = "select * from users where username= ?";
                connection.query(selectQuery, [username], function (err, rows) {
                    if (err)
                        return done(err);
                    if (rows.length) {
                        return done(null, false, req.flash('signupMessage', 'The username is already taken..Try another one'));
                    }
                    else {
                        var newUser = {
                            username: username,
                            password: bcrypt.hashSync(password,null,null)
                        };

                        var insertQuery = "insert into users (username,password,role) values (?,?,\"user\")";
                        connection.query(insertQuery, [newUser.username,newUser.password], function (err, rows) {
                            newUser.id = rows.insertId;
                            return done(null, newUser);
                        });
                    }
                });

                })
        );


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

        passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
        }, function(req, username, password, done) {
       //console.log("search for the user");
       //  User.findOne({ username : username }, function(err, user) {
       //      if (err) {
       //          console.log('Weird Error');
       //          return done(err.message);
       //      }
       //
       //
       //      // If no user is found
       //      if (!user) {
       //          console.log('user not found ' + username);
       //          return done(null, false, req.flash('loginMessage', 'No user found.'));
       //      }else {
       //          // Wrong password
       //          if (!user.validPassword(password)) {
       //
       //              console.log('wrong password or passwords did not match');
       //              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
       //          }
       //          else
       //              return done(null, user);
       //      }
       //
       //
       //  });



            var searchQuery="select * from users where username= ?";
    connection.query(searchQuery,[username],function (err,rows) {
        if(err)
            return done(null,err);
        if(!rows.length)
            return done(null,false,req.flash('loginMessage','No user found'));
        console.log('before bcrypt');
        //compares password with salted password in database
        //var hash = bcrypt.hashSync(password,null,null);
        //var passw=rows[0].password
        if(!bcrypt.compareSync(password,rows[0].password)){
            return done(null,false,req.flash('loginMessage','Oops, Wrong Password'));
        }

        else return done(null,rows[0]);
    });
}));


};