var mongoose=require('mongoose');
mongoose.plugin(require('mongoose-ref-validator'));
var User=require('./user');
var Board=require('./boardCollection');
var BoardPlayers=require('./BoardPlayersCollection');
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
const PlayMove=mongoose.model('PlayMove',PlayMoveSchema,'playmove');
module.exports=PlayMove;