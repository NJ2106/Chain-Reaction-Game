module.exports=function (app,passport) {
//var passport=require('passport');
    //======================================

    // HOME PAGE

    //==========================================

    app.get('/', function (req,res) {

        res.render('../client/views/index.ejs');
        
        });

    //======================================

    // LOGIN PAGE

    //==========================================

    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('../client/views/login.ejs', { message: req.flash('loginMessage') });
        //console.log("login page rendered");
    });
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : 'launch', // redirect to the secure profile section
        failureRedirect : 'login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }),
        function (req,res) {
            if(req.body.remember){
                req.session.cookie.maxAge=1000*60*3;
            }
            else req.session.cookie.expires=false;
            res.redirect('/');
        }

    );


    //======================================

    // SIGN-UP PAGE

    //==========================================

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('../client/views/signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : 'signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('../client/views/profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    //========================================
    //========================================
    // LAUNCH SECTION =========================
    //========================================

    app.get('/launch',isLoggedIn, function (req,res) {
        console.log('server side get');
        if (req.query.request == "CreateNewGame")
            res.render('../client/views/profile.ejs');
        else
            res.render('../client/views/launch.ejs');
    });
    app.post('/launch',isLoggedIn,function (req,res) {
        if(req.body.request==="CreateNewGame") {
            var re = RegExp('^[A-Za-z0-9-_]{1,10}$');
            if (true === re.test(req.body.data))
                res.send("Game strored in the database")
            console.log('stored the value');
        }
    })


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
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