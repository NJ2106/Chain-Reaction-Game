var mongoose=require('mongoose');
var refValidator=require('mongoose-ref-validator');
var Board=require('./boardCollection');
var User=require('./user');
var Schema=mongoose.Schema;

var BoardPlayerSchema=new Schema({
    board_id:{
        type:Schema.ObjectId,ref:'Board',
        required:true
    },
    username:{
        type:Schema.ObjectId,ref:'User',
        required:true
    },
    points:{
        type:Number,
        required:true,
        default:0,
    },
    colorid:{
        type:String,
        required:true
    },
    user_seq:{
        type:Number,
        required:true,
        default:0
    },
    isTurn:{
        type:Number,
        required:true,
        default:0
    },
    isActive:{
        type:Number,
        required:true,
        default:1
    }


});
BoardPlayerSchema.plugin(refValidator);
module.exports=mongoose.model('BoardPlayers',BoardPlayerSchema);
