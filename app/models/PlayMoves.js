var mongoose=require('mongoose');
var refValidator=require('mongoose-ref-validator');
var User=require('./user');
var Board=require('./boardCollection');
var BoardPlayers=require('./BoardPlayersCollection');
var sanitize=require('mongoose-sanitizer');
var board=new Board();

var Schema=mongoose.Schema;

var PlayMoveSchema=new Schema({
    board_id:{
        type: mongoose.Schema.Types.ObjectId, ref:'BoardPlayers',
        required:true
    },
    username:{
        type:mongoose.Schema.Types.ObjectId,ref:'BoardPlayers',
        required:true
    },
    move_seq:{
        type:Number,
        required:true
    },
    move_val:{
        type:String,
        required:true
    }
});
PlayMoveSchema.plugin(sanitize);
PlayMoveSchema.plugin(refValidator);
const PlayMove=mongoose.model('PlayMove',PlayMoveSchema,'playmove');
module.exports=PlayMove;