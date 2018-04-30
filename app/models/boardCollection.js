var mongoose=require('mongoose');
var refValidator=require('mongoose-ref-validator');
var User=require('./user');
var sanitize=require('mongoose-sanitizer');

var Schema = mongoose.Schema;
var BoardSchema=new Schema({
    board_name:{
        type:String,
        required:true,
        unique:true,
        //sparse:true

    },
    player:{
        type:Schema.Types.ObjectId,ref:'BoardPlayers',required:true
    },
    board_status:{
        type:String
    },
    starttime:{
        date:Date
    },
    endtime:{
        date:Date
    },
    winner:{
        type:String,
        default : null
    }
});
BoardSchema.plugin(refValidator);
    //BoardSchema.plugin(sanitize);
   var Board = mongoose.model('Board', BoardSchema,'board');
   module.exports=Board;