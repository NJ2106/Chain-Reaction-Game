module.exports={

    getStateofCurrentBoard:function (userList,moveList,rows,cols) {
        let boardState={};
        for (var i=0;i<rows;i++) {
            for (var j = 0; j < cols; j++) {
                var k = "" + (i + 1) + "" + (j + 1);
                boardState[k] = [0,0];
            }
        }
        for(var i=0;i<userList.length;i++){
            if(moveList[i]=="Timeout" || moveList[i]=="forfeited"){
                continue;
            }
            boardState=this.addMovetoBoard(userList[i],moveList[i],boardState,rows,cols,false);
            if(!boardState)
                return null;
        }
        return boardState;
    },
    
    addMovetoBoard:function (userList,moveList,boardState,rows,cols,checkBurst) {
        let position=boardState[moveList];
        if(!position){
            return null;
        }
        if(position.length ==2){
            if(position[0] !=0 && !checkBurst && userList!==position[0]){
                return null;
            }
            if(checkBurst==true){
                if(position[0]==userList){
                    boardState=this.addMovetoBoard(userList,moveList,boardState,rows,cols,false);
                }
                else {
                    position[0]=userList;
                    position[1]=1;
                    boardState[moveList]=position;
                }
            }
            else {
                var val=position[1];
                if(val<=2){
                    val++;
                    position[0]=userList;
                    position[1]=val;
                    boardState[moveList]=position;
                }
                else if(val==3){
                    var boardPosition=parseInt(moveList);
                    var rowIndex=Math.floor(boardPosition/10);
                    var colIndex=(boardPosition % 10);

                    position[0]=0;
                    position[1]=0;
                    boardState[moveList]=position;

                    if(rowIndex > 1){
                        var index= ""+(rowIndex-1)+""+(colIndex);
                        boardState=this.addMovetoBoard(userList,index,boardState,rows,cols,true);

                    }
                    if(rowIndex < rows){
                        var index= ""+(rowIndex+1)+""+(colIndex);
                        boardState=this.addMovetoBoard(userList,index,boardState,rows,cols,true);
                    }
                    if(colIndex >1){
                        var index= ""+(rowIndex)+""+(colIndex-1);
                        boardState=this.addMovetoBoard(userList,index,boardState,rows,cols,true);
                    }
                    if(colIndex < cols){
                        var index= ""+(rowIndex)+""+(colIndex+1);
                        boardState=this.addMovetoBoard(userList,index,boardState,rows,cols,true);
                    }
                }
            }
        }

        return boardState;
        
    },

    getScoreofUser:function (userSeq,boardState,rows,cols) {
        var score=0;

        for(var i=0;i<rows.length;i++){
            for (var j=0;cols.length;j++){
                var key=""+(i+1)+""+(j+1);
                var position=boardState[key];
                if(position.length==2){
                    if(position[0]==userSeq)
                        score=score+10;

                }

            }
        }
        return score;

    },

    isBoardOccupiedbyUser:function (boardState,rows,cols) {
        var winner=null;
        var isCompleted=true;
        for(var i=0;i<rows;i++){
            for(var j=0;j<cols;j++){
                var index=""+(i+1)+""+(j+1);
                var position=boardState[index];
                if(position.length==2){
                    if(!winner && position[0]!=0){
                        winner=position[0];
                    }else {
                        if(winner !=position[0]){
                            isCompleted=false;
                            return isCompleted;
                        }
                    }
                }
            }
        }
        if(winner == "") {
            return false;
        }
        return isCompleted;

        
    },

    getCellOwner: function (boardState,rows,cols) {
        index="11";
        var position=boardState[index];
        if(position && position.length==2){
            return position[0];
        }
    }

};