var User = function  (username)  { 
     
    this.username = username;
    this.inGame = false;
    this.gameRoom = {}
    this.gamesession = []; 
    this.startedRightNowGameID = undefined
    this.startedGameArray = null

};


module.exports = User