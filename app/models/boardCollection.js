var mongoose=require('mongoose');
var refValidator=require('mongoose-ref-validator');
var User=require('./user');

var Schema = mongoose.Schema;
var BoardSchema=new Schema({
    board_id:{
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
    board_name:{
        type:String,
        required:true
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

   var Board = mongoose.model('Board', BoardSchema,'board');
   module.exports=Board;