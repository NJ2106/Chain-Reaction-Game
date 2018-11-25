var query=require('./queries');
var utils=require('./utils');

module.exports={
    createNewGame: function (req,res) {


    //     query.createNewBoard(req.body.gameTitle, function (err, data) {
    //         console.log('reached create game in controller');
    //         if (err)
    //             res.status(500).send("Board already Exists");
    //         console.log('board created');
    //         res.send("board created");
    //     });
    // },
    //         addUserToBoard:function (req,res) {
    //
    //
    //         query.joinExistingGame(req.user.username, req.query.gameTitle, function (err, data) {
    //             if (err)
    //                 res.send("Board Already Exists").status(500);
    //             else {
    //                 console.log("success in joining game at controllers")
    //                 res.send("Joined the Game").status(200);
    //             }
    //
    //         });

        //========MYSQL Queries
        query.createNewBoard(req.body.gameTitle,function (err) {
            if(err){
                //throw err;
                res.send("Error in creating board").status(500);
            }else {
                query.joinExistingGame(req.user.username,req.body.gameTitle,function (err) {
                    if(err)
                        res.send('Board Already Exists with the given name');
                    else res.send("New Board Created").status(200);


                });
            }
        });







    },

    getGamesList:function (req,res) {
        console.log("inside gameslist of controllers");
        query.getGamesList(function (err,data) {
            console.log("inside controllers")
                if(err) {
                    res.status(500).send("Invalid Error");
                }
                else {
                    var data1 = {'games': data};
                    res.status(200).send(data1);
                    //console.log("success in controllers");
                }
        });
    },
    
    joinExistingGame: function (req,res) {
        console.log('entered the controller');
        query.getNumofUsers(req.query.gameTitle,function (err,data) {
            if(err)
                throw err;
            else {
                if(data<8){
                    console.log('entered data section in controller');
                    query.joinExistingGame(req.user.username,req.query.gameTitle, function (err) {
                        //To be coded
                        if(err)
                            res.send("Invalid Error...You're already in the game").status(500);
                        else res.send("Joined game Successfully");
                    });

                }
                else {
                    console.log("game players reached maximum");
                    res.send("This game already have maximum players to play the game");}
            }
        });
    },

    currentlyInGame: function (req,res) {
        query.IsPlayerOnBoard(req.user.username,function (err,data) {
            if(err)
                res.send("server error-1");
            else {
                res.send(data).status(200);
            }
        })
    },
    // check the "Winner variable properly if error occurs
    userPlayingRequest: function (req,res) {
        console.log("entered the function in controller");
        query.getActiveOrWaitingBoardofUser(req.user.username,function (err,data) {
            if(err)
            res.send('User not found on any Board');
            else {
                console.log(data);
                if(data.length>=1){
                    var boardName=data[0].boardName;
                    utils.getBoardData(boardName,null,null,function (err1,data1) {
                        console.log("entered to fetch boardData");
                        if(err1)
                            res.send('Server Error');
                        else {
                            utils.isGameOver(boardName,data1.boardData,data1.cols,data1.rows,function (err2,data2,winner) {
                                if(err2)
                                    res.send('Server Error');
                                else {
                                    if(data2==true){
                                        if(!winner){
                                            var winners=utils.getWinnerUsingScore(data1.userData);
                                            if(winners.length>1)
                                                winner="Draw";
                                            else if(winners.length==1)
                                                winner=winners[0];
                                        }

                                        query.endPlay(boardName,winner,function (err3,data3) {
                                            if(err3)
                                                res.send("Server Error");
                                            else {
                                                for(var i=0;i<data1.userData.length;i++){
                                                    if(data1.userData[i].userName==winner){
                                                        data1.userData[i].winner=true;
                                                        break;
                                                    }
                                                }
                                                res.send(data1);
                                            }
                                        });

                                    }
                                    else res.send(data1);

                                }
                            });
                        }
                    });
                }
            }
        });
    },
    
    startGame:function (req,res) {
        query.getBoardofCurrentUser(req.user.username,function (err,data) {
            if(err)
                res.send('Server Error');
            else {
                if(data)
                    var boardName=data[0].boardName;
                query.getNumofUsers(boardName,function (err1,data1) {
                    if(data1>=2){
                        query.startBoardPlay(boardName,function (err2,data2) {
                            if(data2&&!err2){
                                query.setTurn(boardName,function (err3,data3) {
                                    if(err3)
                                        res.send('Internal Error');
                                    else {
                                        utils.checkActiveUserTurn(boardName);
                                        res.send('Game Started');
                                    }
                                });
                            }
                            else res.send('Unknown Error');
                        })
                    }
                    else res.send('Atleast 2 players needed to play the game');
                });
            }
        });
    },

    processTurnRequest: function (req,res) {
        query.getActiveBoardofUser(req.user.username,function (err,data) {
            if(err){
                res.send('Server Error...User not in any of the games');
            }
            else {
                if(data.length >=1){
                    var boardName=data[0].boardName;

                    query.checkUserTurn(req.user.username,boardName,function (err1,data1) {
                        if(err1)
                            res.send("server error");
                        else res.send(data1);
                    });
                }
            }
        });
    },
    
    getBoardStatus:function (req,res) {
        query.getBoardStatusofUser(req.query.boardName,req.user.username,function (err,data) {
            if(err)
                res.send("Server Error");
            else {
                res.send(data);
            }

        });
    },

    forfeitTheGame: function (req,res) {
        query.getActiveOrWaitingBoardofUser(req.user.username,function (err,data) {
            if(err)
                res.send("User not in any game");
            else {
                if(data.length > 0){
                    var boardName=data[0].boardName;
                    query.setUserInActive(req.user.username,boardName,function (err1,data1) {
                        console.log("forfeit");
                        if(err1)
                            res.send('Internal error');
                        else {
                            query.addMove(req.user.username,boardName,"forfeited",function (err2,data2) {
                                if(err2)
                                    res.send('error forfeiting game');
                                else res.send("User forfeited the Game");
                            });

                        }
                    });
                }
            }
        });
    },

    addMoveRequest: function (req,res) {
        var moveVal=req.body.value;
        var userName=req.user.username;
        query.getActiveBoardofUser(userName,function (err,data) {
            if(err)
                res.send("user not in game");
            else {
                if(data.length>=1){
                    var boardName=data[0].boardName;
                    query.checkUserTurn(userName,boardName,function (err1,data1) {
                        if(!err1 && data1==true){
                            query.getSequenceofUser(userName,boardName,function (err2,data2) {
                                if(err2) {
                                    res.send("User not in this board");
                                }
                                else {
                                    let userID=data2;
                                    utils.getBoardData(boardName,userID,moveVal,function (err3,data3) {
                                        if(err3){
                                            res.send("Invalid move");
                                        }

                                        else {
                                            query.addMove(userName,boardName,moveVal,function (err4,data4) {
                                                if(err4){
                                                    res.send("Server error");
                                                }
                                                else {
                                                    query.setTurn(boardName,function (err5,data5) {
                                                        if(err5){
                                                            res.send("Server error");
                                                        }
                                                        else {
                                                            utils.isGameOver(boardName,data3.boardData,data3.cols,data3.rows,function (err6,data6,winner) {
                                                                if(err6){
                                                                    res.send("Server error")
                                                                }
                                                                else {
                                                                    if(data6==true){
                                                                        if(!winner){
                                                                            winner=utils.getWinnerUsingScore(data3.userData);
                                                                        }
                                                                        query.endPlay(boardName,winner,function (err7,data7) {
                                                                            if(err7){
                                                                                res.send("Server Error");
                                                                            }
                                                                            else {
                                                                                for(var i=0;i<data3.userData.length;i++){
                                                                                    if(data3.userData[i].userName==winner){
                                                                                        data3.userData[i].winner=true;
                                                                                        break;
                                                                                    }
                                                                                }
                                                                                res.send(data3).status(200);
                                                                            }
                                                                        });
                                                                    }
                                                                    else {
                                                                        utils.checkActiveUserTurn(boardName);
                                                                        res.send(data3).status(200);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            res.send("Not your Turn");
                        }
                    });
                }
            }
        });

        
    }
};