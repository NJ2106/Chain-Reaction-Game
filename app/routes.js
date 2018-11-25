
var controller=require('./controllers');
var Board=require('./models/boardCollection');
var BoardPlayers=require('./models/BoardPlayersCollection');
var User=require('./models/user');
var mongoose=require('mongoose');
var sanitize=require('mongoose-sanitizer');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports=function (app,passport,connection) {
//var passport=require('passport');
    //======================================

    // HOME PAGE

    //==========================================

    app.get('/', function (req, res) {

        res.render('index.ejs');

    });

    //======================================

    // LOGIN PAGE

    //==========================================

    app.get('/login', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
        //console.log("login page rendered");
    });
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
            successRedirect: 'launch', // redirect to the secure profile section
            failureRedirect: 'login', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            }
            else req.session.cookie.expires = false;
            res.redirect('/');
        }
    );


    //======================================

    // SIGN-UP PAGE

    //==========================================

    app.get('/signup', function (req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: 'signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    //========================================
    //========================================
    // LAUNCH SECTION =========================
    //========================================

    app.get('/launch', isLoggedIn, function (req, res) {
        console.log('server side get');
        if (req.query.request == "gamesExisted")
            controller.getGamesList(req, res);
        else if (req.query.request == "JoinExistingGame" && req.query.gameTitle) {

            var reg = RegExp('^[A-Za-z0-9@_-]{1,10}$')
            if (true == reg.test(req.query.gameTitle))
                controller.joinExistingGame(req, res);
            else
                res.send("Not a valid Game Name").status(500);
        }
        else if (req.query.request == "isPlayerinGame") {

            controller.currentlyInGame(req, res);
        }
        else
            res.render('launch.ejs', {
                username: req.user.username
            });
    });
    app.post('/launch', isLoggedIn, function (req, res) {
        console.log('server side post');
        if (req.body && req.body.request === "createNewGame") {
            var re = RegExp('^[A-Za-z0-9-_]{1,10}$');
            if (true === re.test(req.body.gameTitle)) {
                controller.createNewGame(req, res);
                //controller.addUserToBoard(req,res);

                console.log("added user to the board");
            }

        }

        //res.send("Game strored in the database")
        else
            res.status(401).send("Invalid name");

    });
    // =====================================
    //==========BOARD SECTION================
    app.get('/board', isLoggedIn, function (req, res) {
        if(req.query.request) {
            if (req.query.request == 'currentGame') {
                controller.userPlayingRequest(req, res);
            }
            else if (req.query.request == 'isMyTurn') {
                controller.processTurnRequest(req, res);
            }
            else if (req.query.request == 'startTheGame') {
                controller.startGame(req, res);
            }
            if (req.query.request == 'currentBoardStatus') {
                var re = RegExp('^[A-Za-z0-9-_]{1,10}$');
                if(true==re.test(req.query.boardName)){
                    controller.getBoardStatus(req, res);
                }
                else res.send("Invalid name of the board");

            }
            else if(req.query.request=='forfeitTheGame'){
                controller.forfeitTheGame(req,res);
            }

        }
        else {
            res.render('board.ejs', {
                username: req.user.username
            });
        }

    });
    
    app.post('/board',isLoggedIn,function (req,res) {
        if(req.body){
            if(req.body.request=="addMove"){
                var reg = RegExp('^[1-6][1-6]$');
                var moveValue = req.body.value;
                if(true==reg.test(""+moveValue)){
                    controller.addMoveRequest(req,res);
                }
                else {
                    res.send("Invalid Move");
                }
            }
        }

    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // Testing
    app.get('/board1', function (req, res,done) {
        var query="select * from (boards natural join players) where boardName=?";
        connection.query(query,['hyyy'],function (err,rows) {
            if(err){
                done(null,err);
            }else if(rows){
                res.json(rows);
                done(null,rows);
            }
        });
    });


    // TEsting DataBase Joins

    app.get('/board2', function (req, res, done) {
       var board=new Board({
           board_name:'new game1234',
           player:new mongoose.Types.ObjectId,
           board_status:'Waiting'
       });
       board.save(function (err) {
           if(err)
               throw err
           else done(null,board);
       });
       var boardPlayer=new BoardPlayers({
           board_id:board._id,
           username:board.player
       });
       boardPlayer.save(function (err) {
           if(err)
               throw err;
           else done(null,boardPlayer);
       })
    });

    app.get('/board4',function (req,res,done) {
        // var query= Board.aggregate().lookup({from:'boardPlayers',localField:'_id',foreignField:'board_id',as:'docs'}).exec(function (err,data) {
        //     if(err)
        //         throw err;
        //     else {
        //     query.eq('susmitha').exec(function (err,result) {
        //         if(err)
        //             throw err;
        //         console.log(result);
        //         res.json(result);
        //     }
        //
        //     );}
        //
        // });

        // BoardPlayers.aggregate([
        //     {
        //         $lookup: {
        //             from: "board",
        //             localField: "board_id",
        //             foreignField: "_id",
        //             as: "trips"
        //         }
        //     },
        //     {
        //         $project: {
        //             board_status: 1,
        //             trips: { $arrayElemAt: ["$trips", 0] }
        //         }
        //     },
        //     {
        //         $project: {
        //             board_status: 1,
        //             board_name: "$trips"
        //         }
        //     }
        // ]).exec(function(err, docs){
        //     if (err)
        //         throw err;
        //     console.log(docs);
        //     res.json(docs);
        //     // prints [{ "_id": 1, "StationName": "Station A",  "Tripcount": 6 }] }
        // });

        BoardPlayers.findOne({username:'stanneru'}).populate(
            'board_id','board_name'
           // match:{board_name:{$eq: 'chess1'}},
            //  select:'board_status'
        ).exec(function (err,data) {
            if(err)
                throw err;
            //else if(data&&data.board_id.board_status=='Completed')
            console.log(data.board_id.board_name);
            res.json(data.board_id.board_name);
        });

    });


    app.get('/board3',function (req,res,done) {
        var query="select * from boards where boardName = ?";
        connection.query(query,['hyyy'],function (err,rows) {
            if(err)
                throw err;
            else if(rows&&rows.length>0){
                res.json(rows[0].boardID);
                done(null,rows[0].boardID);}
        });
    });






};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}