var mongoose=require('mongoose');
var refValidator=require('mongoose-ref-validator');
var Board=require('./boardCollection');
var User=require('./user');
var sanitize=require('mongoose-sanitizer');
var Schema=mongoose.Schema;

var BoardPlayerSchema=new Schema({
    board_id:{
        type:Schema.Types.ObjectId,ref:'Board',
        //required:true
    },
    username:{
        type:String,
        required:true

    },
    points:{
        type:Number,
        //required:true,
        default:0,
    },
    colorid:{
        type:String,
        //required:true
    },
    user_seq:{
        type:Number,
        //required:true,
        default:0


    },
    isTurn:{
        type:Number,
        //required:true,
        default:0
    },
    isActive:{
        type:Number,
        //required:true,
        default:1
    }


});
BoardPlayerSchema.plugin(refValidator);
//BoardPlayerSchema.plugin(sanitize);
var BoardPlayers=mongoose.model('BoardPlayers',BoardPlayerSchema,'boardPlayers');
module.exports=BoardPlayers;