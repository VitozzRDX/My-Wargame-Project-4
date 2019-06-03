var Room = function (socket) {

    this.roomID = (Math.random()+1).toString(36).slice(2, 18);
    this.listofplayers = [];
    this.hostusername = socket.username;
    this.hostsocketid = socket.id;
    this.playersSides = {};
    this.scenarioName = undefined;

    this.sidesPlayers = {};
    this.chosenSide = undefined;
    this.freeSide = undefined;
}

Room.prototype.setPlayersSides = function (username,side) {
    this.playersSides[username] = side
}
Room.prototype.addPlayertoList = function (socket) {
    this.listofplayers.push(socket.username)
};

module.exports = Room