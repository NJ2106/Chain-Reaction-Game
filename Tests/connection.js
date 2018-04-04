const mongoose=require('mongoose');

//ES6 Promises


//connect to database before running the tests
before(function (done) {
    //connect to mongodb

    mongoose.connect('mongodb://localhost/test_demo');
    mongoose.Promise=global.Promise;
    mongoose.connection.once('open',function () {
        console.log('Connection has been made');
        done();
    }).on('error',function (error) {
        console.log('connection error:',error);

    });

});

