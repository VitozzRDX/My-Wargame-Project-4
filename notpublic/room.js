var Room = function (socket) {

    this.roomID = (Math.random()+1).toString(36).slice(2, 18);
    this.listofplayers = [];
    this.hostusername = socket.username;
    this.hostsocketid = socket.id;
}

Room.prototype.addPlayertoList = function (socket) {
    this.listofplayers.push(socket.username)
};

module.exports = Room