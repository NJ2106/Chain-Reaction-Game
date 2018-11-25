var Board=require('./models/boardCollection');
var BoardPlayers=require('./models/BoardPlayersCollection');
var mongoose=require('mongoose');
var sanitize=require('mongoose-sanitizer');
var mysql=require('mysql');
var connection=mysql.createConnection({
    'host':'mydbinstance.cm9l4ehvcosw.us-east-1.rds.amazonaws.com',
    'user':'stanneru',
    'password':'Momndad_99'
});
connection.query('USE chain_reaction');

module.exports={
    createNewBoard: function (boardName,done) {
        //var board1=sanitize(boardName);
        // var board = new Board();
        //         board.board_name=boardName;
        //         board.board_status='Completed';
        //
        //         board.save(function (err) {
        //             if(err)
        //                 throw err;
        //             else {
        //             console.log("saved in collection board");
        //             done(null,board);}
        //     //return done(null,board);
        // });

                        //MYSQL
            var query="insert into boards (boardName,boardStatus) values(?,\"WAIT\")";
            connection.query(query,[boardName],function (err,rows) {
                if(err)
                    throw err;
                else done(null,rows);
            });



    },
    getGamesList: function (done) {
        //var query='Waiting';
        // Board.find({board_status : 'Completed'},function (err,data) {
        //     if(err)
        //         throw err;
        //     return done(null,data);
        // });

        connection.query("select boardName from boards where boardStatus=\"WAIT\"",function (err,rows) {
            if(err)
                done(err,null);
            else if(rows){
            console.log(rows.boardName);
            return done(null,rows);}
        });

    },
    joinExistingGame: function (userName,boardName,done) {
        // var _this=this;
        // this.getBoardId(boardName,function (err,data) {
        //     console.log('reached getBoardId in JoinExistinggame in query');
        //   if(!err) {
        //       var id = data;
        //       _this.getNumofUsers(boardName, function (err1, data1) {
        //           console.log('reached getNumofUsers in JoinExistinggame in query');
        //           if (!err1) {
        //               var numOfUsers = data1 + 1;
        //               var boardPlayers=new BoardPlayers();
        //               boardPlayers.board_id= mongoose.Types.ObjectId(id);
        //               boardPlayers.username=userName;
        //               boardPlayers.user_seq=numOfUsers;
        //
        //               boardPlayers.save(function (err2) {
        //                   console.log('reached save in JoinExistinggame in query');
        //                   if(err2)
        //                       throw err2;
        //                   return done(null,boardPlayers);
        //               });
        //
        //           }
        //           else return done(err1, null);
        //       });
        //   }
        //   else return done(err,null);
        // });

        var _this=this;
        this.getBoardId(boardName,function (err,rows) {
            if(!err){
                var id=rows;
                _this.getNumofUsers(boardName,function (err1,rows1) {
                    if(!err1){
                        var numOfUsers=rows1;
                        var colorID=_this.getColorId(numOfUsers+1);
                        var query="insert into players (boardID,username,colorID,user_seq) values (?,?,?,?)";
                        connection.query(query,[id,userName,colorID,numOfUsers+1],function (err3,rows3) {
                            if(err3)
                                done(err3,null);
                            done(null,rows3);
                        });

                    }
                    else done(err1,null);
                });

            }
            else done(err,null);


        });





    },
    getColorId:function (user_seq) {
        switch (user_seq){
            case 1:return "green";
            case 2:return "blue";
            case 3:return "black";
            case 4:return "red";
            case 5:return "brown";
            case 6:return "DarkSeaGreen";
            case 7:return "DeepPink";
            case 8:return "DarkGray";

        }
        return "DarkSalmon";
    },

    getNumofUsers:function (boardName,done) {
        // console.log("entered num users");
        // var _this=this;
        // _this.getBoardId(boardName,function (err,data) {
        //     if(!err) {
        //         console.log("scess with get id");
        //         console.log(data);
        //         var id=data;
        //         BoardPlayers.count({board_id:mongoose.Types.ObjectId(id)}, function (err1, data1) {
        //             if (err1)
        //                 throw err1;
        //             console.log("almost done in numusers");
        //             console.log(data1)
        //             return done(null, data1);
        //         });
        //     }
        //     else return done(err,null);
        // });
        var query = "select * from (boards natural join players) where boardName=?";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(err,null);
            return done(null,rows.length);

        })



    },
    getBoardId: function (boardName,done) {

        // Board.findOne({board_name: boardName},function (err,data) {
        //     if (err)
        //         throw err;
        //     else {
        //         //rsres.json(data._id);
        //         console.log("almost done");
        //         //console.log(data);
        //         console.log(data._id);
        //         var id=data._id;
        //         return done(null, id);
        //
        // }
        //
        //
        // });

        var query="select * from boards where boardName = ?";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                throw err;
            else if(rows&&rows.length>0)
                done(null,rows[0].boardID);
        });

    },
    
    IsPlayerOnBoard:function (userName,done) {
        var query="select * from (boards natural join players) where username=? AND boardStatus !=\"COMPLETED\" AND user_active=1";
        connection.query(query,[userName],function (err,rows) {
            if(err)
                throw err;
            else {
                if(rows.length>0)
                    done(null,'yes');
                else done(null,'no');
            }


        });
    },
    
    BoardofUser: function (userName,done) {
        var query="select * from (boards natural join players) where username=? AND boardStatus !=\"COMPLETED\" AND user_active=1";
        connection.query(query,[userName],function (err,rows) {
            if(err)
                done(null,err);
            done(null,rows);
        });
    },
    
    endPlay: function (boardName,winner,done) {
        var _this=this;
        var query="update boards set endTime=(select NOW()),gameWinner=? where boardName=?";
        connection.query(query,[winner,boardName],function (err,rows) {
            if(err)
                done(null,err);
            else {
                _this.setBoardStatus(boardName,"COMPLETED",function (err1,data1) {

                    if(data1)
                        done(null,rows);
                    else
                    done(null,err1);
                });
            }
        });
    },
    
    setBoardStatus:function (boardName,boardStatus,done) {
        var query="update boards set boardStatus=? where boardName=?";
        connection.query(query,[boardStatus,boardName],function (err,rows) {
            if(err)
                done(null,err);
            done(null,rows);
        });
    },
    getBoardStatus:function (boardName,done) {
        var query="select * from boards where boardName=?";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(null,err);
            done(null,rows[0].boardStatus);
        });
    },
    

    
    startBoardPlay:function (boardName,done) {
        var query="update boards set startTime = (select NOW()) where boardName=?";
        var _this = this;
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(null,err);
            else {
                _this.setBoardStatus(boardName,"ACTIVE",function (err1,data1) {
                    if(err1)
                        done(null,err1);
                    done(null,data1);
                });
            }
        });
    },

    getBoardofCurrentUser:function (userName,done) {
        var query="select * from (boards natural join players) where username=?";
        connection.query(query,[userName],function (err,rows) {
            if(err)
                done(null,err);
            done(null,rows);
        });
    },
    
    setTurn:function (boardName,done) {
        var query="select * from (boards natural join players) where boardName=?";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(null,err);
            else {
                var activeUsers=[];
                var lastTurnUserId=0;

                for(var i=0;i<rows.length;i++){
                    if(rows[i].user_turn==1)
                        lastTurnUserId=rows[i].user_seq;
                    if(rows[i].user_active==1)
                        activeUsers.push(rows[i]);

                }
                rows=activeUsers;

                var minIndexofUser=0;
                var maxIndexofUser=0;
                var nextIndexofUser=lastTurnUserId+1000;

                for (var i=0;i<rows.length;i++){
                    if(i==0){
                        minIndexofUser=rows[i].user_seq;
                        maxIndexofUser=rows[i].user_seq;
                    }
                    else {
                        if(minIndexofUser > rows[i].user_seq)
                            minIndexofUser=rows[i].user_seq;
                        if(maxIndexofUser < rows[i].user_seq)
                            maxIndexofUser = rows[i].user_seq;
                    }

                    if(nextIndexofUser > rows[i].user_seq && rows[i].user_seq > lastTurnUserId)
                        nextIndexofUser = rows[i].user_seq;

                }

                var finalUserTurnId=0;
                if(lastTurnUserId==0)
                    finalUserTurnId=minIndexofUser;
                else {
                    if(lastTurnUserId==maxIndexofUser)
                        finalUserTurnId=minIndexofUser;
                    else finalUserTurnId=nextIndexofUser;
                }

                if(finalUserTurnId!=0) {
                    var query1 = "update players set user_turn=1 where boardID = ? AND user_seq= ?";
                    connection.query(query1, [rows[0].boardID, finalUserTurnId], function (err1, rows1) {
                        if (err1)
                            done(null, err1);
                        else {
                            if (lastTurnUserId != 0) {
                                var query2 = "update players set user_turn = 0 where boardID =? AND user_seq=?";
                                connection.query(query2, [rows[0].boardID, lastTurnUserId], function (err2, rows2) {
                                    if (err2)
                                        done(err2, null);
                                    done(null, rows1);
                                });
                            }
                            else done(null,rows1);
                        }
                    });
                }

            }
        });
    },

    getUserWithCurrentTurn:function (boardName,done) {
        var query="select * from (boards natural join players) where boardName = ? AND user_active=1";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(null,err);
            else if(rows.length>0)
                done(null,rows[0].username);
        });
    },
    
    addMove:function (userName,boardName,moveValue,done) {
        var _this=this;
        this.getBoardId(boardName,function (err1,data1) {
            if(!err1){
                var id=data1;
                _this.getNumberofMovesOnBoard(boardName,function (err2,data2) {
                    if(err2)
                        done(null,err2);
                    else {
                        var numofMoves=data2;
                        var query = "insert into moves (boardID,username,move_seq,moveValue) values (?,?,?,?)";
                        connection.query(query,[id,userName,numofMoves+1,moveValue],function (err3,data3) {
                            if(err3)
                                done(null,err3);
                            else done(null,data3);
                        });
                    }
                });
            }
            else done(null,err1);

        });
    },
    
    getNumberofMovesOnBoard:function (boardName,done) {
        var query="select * from (boards natural join moves) where boardName=?";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(null,err);
            else done(null,rows.length);
        });
    },

    getConsecutiveTimeOutofUser:function (boardName,userName,done) {
        var query="select * from boards where boardName=?";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(err,null);
            else if(rows.length>0){
                var query1="select * from moves where boardID=? and username=?";
                connection.query(query1,[rows[0].boardID,userName],function (err1,rows1) {
                    if(err1)
                        done(err1,null);
                    else if(rows1){
                        var count=0;
                        for(var i=rows1.length-1;i>=0;i--){
                            if(rows1[i].moveValue=="Timeout"){
                                count++;
                            }
                            else break;
                        }
                        done(null,count);
                    }
                });
            }



        });
    },

    setUserInActive:function (userName,boardName,done) {
        var query="select * from (boards natural join players) where boardName=? AND username=?";
        connection.query(query,[boardName,userName],function (err,rows) {
            if(err)
                done(err,null);
            else {
                if(rows.length>0){
                    if(rows[0].user_active==1){
                        var query1="update players set user_active=1 where boardID=? AND username =?";
                        connection.query(query1,[rows[0].boardID,userName],function (err1,rows1) {
                            if(err1)
                                done(err1,null);
                            else if(rows1)
                                done(null,rows1);
                        });
                    }
                    else done(null,false);
                }
            }
        });
    },

    getActiveBoardofUser:function (userName,done) {
        var query= "select * from (boards natural join players) where username=? AND boardStatus=\"ACTIVE\" AND user_active=1";
        connection.query(query,[userName],function (err,rows) {
            if(err)
                done(err,null);
            else if(rows)
                done(null,rows);
        });
    },

    checkUserTurn:function (userName,boardName,done) {
        var query="select * from (boards natural join players) where boardName=? AND username=?";
        connection.query(query,[boardName,userName],function (err,rows) {
            if(err)
                done(err,null);
            else {
                if(rows){
                    if(rows[0].user_turn==1)
                        done(null,true);
                    else
                    done(null,false);
                }

            }
        });
    },


    getBoardStatusofUser:function (boardName,userName,done) {
        var query="select * from (boards natural join players) where boardName=? AND username=?";
        connection.query(query,[boardName,userName],function (err,rows) {
            if(err)
                done(err,null);
            else if(rows.length > 0)
                done(null,rows[0].boardStatus);
        });

    },

    getActiveOrWaitingBoardofUser:function (userName,done) {
        var query="select * from (boards natural join players) where username=? AND boardStatus !=\"COMPLETED\" AND user_active=1";
        connection.query(query,[userName],function (err,rows) {
            if(err)
                done(err,null);
            done(null,rows);
        });
    },

    getMoves:function (boardName,done) {
        var query="select * from (boards natural join moves) where boardName=? ORDER BY move_seq ASC";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(err,null);
            else if(rows){
                done(null,rows);
            }
        });
    },

    getSequenceofUser:function (userName,boardName,done) {
        var query="select * from (boards natural join players) where boardName=? AND username=?";
        connection.query(query,[boardName,userName],function (err,rows) {
            if(err)
                done(err,null);
            else if(rows)
                done(null,rows[0].user_seq);
        });
    },
    getBoardUsers: function (boardName,done) {
        var query="select * from (boards natural join players) where boardName=?";
        connection.query(query,[boardName],function (err,rows) {
            if(err){
                done(null,err);
            }else if(rows){
                done(null,rows);
            }
        });
    },

    getNumberofMovesofUser:function (boardName,userName,done) {
        var query="select * from boards where boardName=?";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(err,null);
            else if(rows.length > 0){
                var query1="select * from moves where boardID=? AND username=?";
                connection.query(query1,[rows[0].boardID,userName],function (err1,rows1) {
                    if(err1)
                        done(err1,null);
                    else{
                        console.log(rows1.length)
                        done(null,rows1.length);}
                });
            }
        });
    },

    getMinimumMoves:function (boardName,done) {
        this.getBoardId(boardName,function (err1,data1) {
            if(err1){
                done(null,err1);
            }
            else {
                var boardID=data1;
                var query="select username, COUNT(*) as numMoves from (moves natural join players) where boardID=? GROUP BY username";
                connection.query(query,[boardID],function (err,rows) {
                    if(err)
                        done(err,null);
                    else if(rows){
                        var moves=10000;

                        for (var i=0;i<rows.length;i++){
                            if(moves > rows[i].numMoves){
                                moves =rows[i].numMoves;
                            }
                        }
                        if(rows.length <=0){
                            moves=0;
                        }
                        done(null,moves);
                    }
                });
            }
        });
    },

    activeUserOnBoard:function (boardName,done) {
        var query="select * from (boards natural join players) where boardName=? AND user_active=1";
        connection.query(query,[boardName],function (err,rows) {
            if(err)
                done(null,err);
            else if(rows){
                done(null,rows);
            }

        });
    }



  




};