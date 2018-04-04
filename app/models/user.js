var mongoose=require('mongoose');
mongoose.plugin(require('mongoose-ref-validator'));
var bcrypt = require('bcrypt-nodejs');

// schema for our user-model
var Schema = mongoose.Schema;
var userSchema=  new Schema({

    username: {
        type: String,
        required: true
        //index: {unique: true},
        //$exists: true

        //sparse : true

    }
    ,
     password: {
         type: String,
         required: true
     }




});

// Generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};



// creating a model for user and exposing it to our app

var User= mongoose.model('User1', userSchema,'users234');
module.exports=User;