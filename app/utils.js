var query=require('./queries');
var logic=require('./gamelogic');

var userwithLastTurn=null;
var checkTimeout=null;
module.exports={
    getBoardData: function (boardName,userID,moveID,done) {
        var Object={};
        var rows=6;
        var cols=6;
        Object["boardName"]=boardName;
        Object["rows"]=rows;
        Object["cols"]=cols;
        Object["boardData"]=null;
        Object["userData"]=null;

        var _this=this;

        query.getMoves(boardName,function (err,data) {
            if(!err && data){
                console.log('entered utils boardData');
                var moves=[];
                var userList=[];
                var boardState=null;
                for (var i=0;i<data.length;i++){
                    moves.push(data[i].moveValue);

                    query.getSequenceofUser(data[i].username,boardName,function (err2,data2) {
                        if(!err2 && data2){
                            userList.push(data2);

                            if(userList.length==data.length){
                                if(userID && moveID){
                                    userList.push(userID);
                                    moves.push(moveID);
                                }
                                boardState=logic.getStateofCurrentBoard(userList,moves,rows,cols);
                                if(!boardState){
                                    done("Invalid move",null);
                                    return;
                                }
                                Object["boardData"]=boardState;
                                query.getBoardUsers(boardName,function (err3,data3) {
                                    if(!err3){
                                        _this.getTotalMoves(data3,boardName,function (err5,data5) {
                                            if(err5)
                                                done(err5,null);
                                            else {
                                                var userInfo=[];
                                                for (var j=0;j<data3.length;j++){
                                                    userInfo.push({
                                                        "userName":data3[j].username,
                                                        "userIndex":data3[j].user_seq,
                                                        "color":data3[j].colorID,
                                                        "points":logic.getScoreofUser(data3[j].user_seq,boardState,rows,cols),
                                                        "winner":false,
                                                        "numMoves":(50-data5[j])
                                                    });
                                                }
                                                Object["userData"]=userInfo;
                                                done(null,Object);
                                            }
                                            
                                        });
                                    }
                                    else {
                                        done(err3,null);
                                    }
                                });
                            }
                        }
                        else {
                            console.log("Error occurred");
                            done(err2,null);}

                    });
                }
                if(data.length <=0){
                    console.log("if(data.length <=0) ");
                    if(userID && moveID){
                        userList.push(userID);
                        moves.push(moveID);
                    }
                    boardState=logic.getStateofCurrentBoard(userList,moves,rows,cols);
                    if(!boardState){
                        done("Invalid Move",null);
                        return;
                    }
                    Object["boardData"]=boardState;

                    query.getBoardUsers(boardName,function (err3,data3) {
                        console.log(data3);
                        console.log("getBoardUsers");

                        if(!err3 && data3){
                            console.log("entering the problem");
                            _this.getTotalMoves(data3,boardName,function (err5,data5) {
                                console.log("getTotalMoves");
                                if(err5)
                                    done(err5,null);
                                else {
                                    var userInfo=[];
                                    for (var j=0;j<data3.length;j++){
                                        userInfo.push({
                                            "userName":data3[j].username,
                                            "userIndex":data3[j].user_seq,
                                            "color":data3[j].colorID,
                                            "points":logic.getScoreofUser(data3[j].user_seq,boardState,rows,cols),
                                            "winner":false,
                                            "numMoves":(50-data5[j])
                                        });
                                    }
                                    Object["userData"]=userInfo;
                                    done(null,Object);
                                }

                            });
                        }
                        else {
                            done(err3,null);
                        }
                    });


                }

            }
            else done(err,null);
        });
    },

    getTotalMoves:function (user,boardName,done) {
        console.log('entered total moves');
        var userList=[];
        for (var i=0;i<user.length;i++){
            query.getNumberofMovesofUser(boardName,user[i].username,function (err,data) {
                console.log('entered database query');
                if(err){
                    console.log("error occurred in total moves function");
                    done(null,err);
                }
                else {
                    userList.push(data);
                    if(userList.length >= user.length){
                        done(null,userList);
                    }
                }
            });
        }
    },

    isGameOver:function (boardName,boardState,column,row,done) {
        query.getBoardStatus(boardName,function (err,data) {
            if(err)
                done(err,null,null);
            else {
                if(data=="ACTIVE"){
                    if(true==logic.isBoardOccupiedbyUser(boardState,row,column)){
                        var winner=logic.getCellOwner(boardState,row,column);
                        done(null,true,winner);
                    }
                    else {
                        query.getMinimumMoves(boardName,function (err,data) {
                            if(err)
                                done(null,err);
                            else {
                                if(data>=50){
                                    done(null,true,null);

                                }
                                else {
                                    query.activeUserOnBoard(boardName,function (err2,data2) {
                                        if(err2)
                                            done(err2,null,null);
                                        else {
                                            if(data2.length<=1){
                                                if(data2.length==1){
                                                    done(null,true,data2[0].username);
                                                }
                                                else if(data2.length<1)
                                                    done(null,true,'No user playing the game');
                                            }
                                            else done(null,false,null);
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
                else done(null,false,null);
            }
        });
    },

    checkActiveUserTurn: function (boardName) {
        if(checkTimeout)
            clearTimeout(checkTimeout);

        var _this = this;
        query.getUserWithCurrentTurn(boardName,function (err,data) {
            if(err)
            {

            }
            else {
                userwithLastTurn=data;
                checkTimeout=setTimeout(_this.isSameUserActive,15000,boardName);
            }

        });
    },

    isSameUserActive:function (boardName) {
        query.getUserWithCurrentTurn(boardName,function (err,data) {
            if(err){

            }
            else {
                if(userwithLastTurn==data){
                    query.addMove(userwithLastTurn,boardName,"Timeout",function (err1,data1) {
                        if(err1){

                        }
                        else {
                            query.setTurn(boardName,function (err2,data2) {
                                if(err2){

                                }
                                else {
                                    query.getConsecutiveTimeOutofUser(boardName,userwithLastTurn,function (err2,data2) {
                                        if(!err2){
                                            if(data2>=3){
                                                query.setUserInActive(userwithLastTurn,boardName,function (err3,data3) {
                                                    if(!err3){
                                                        query.addMove(userwithLastTurn,boardName,"forfeited",function (err4,data4) {

                                                        });

                                                    }
                                                    
                                                });
                                            }
                                        }

                                    });
                                    if(typeof this.checkActiveUserTurn ==="function")
                                        this.checkActiveUserTurn();
                                }

                            });

                        }
                    });
                }
            }

        });
    },

    getWinnerUsingScore:function (userData) {
        var maxScore=0;
        var isDraw=false;
        var winner=[""];
        for (var i=0;i<userData.length;i++){
            if(maxScore < userData[i].points){
                maxScore = userData[i].points;
                winner[0]=userData[i].userName;
            }

        }

        if (winner[0] != "") {
            for (var i = 0; i < userData.length; i++) {
                if (maxScore == userData[i].points && winner[0] != userData[i].userName) {
                    isDraw = true;
                    winner.push(userData[i].userName);
                    break;
                }
            }
        }

        return winner;
    }
    
};