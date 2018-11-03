
import {Client} from './client.js'
//import {Counter} from './counters.js'

var Main = {};

//var socket = io();
Main.client = new Client()

document.getElementById('canvasContainer').addEventListener('contextmenu', function(e) {
    e.preventDefault();

}, false);

Main.client.drawBackground('assets/bdp.gif');

Main.client.username = getCookie("userName");

for (var i in Main.client.setOfOptionsforCounters) {
    Main.client.createCounter(Main.client.setOfOptionsforCounters[i])
}

Main.client.drawAll();

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
};

console.log("...");
console.log("we emit loginMePlease message ");
socket.emit("loginMePlease", Main.client.username);

socket.on("message", function (players) {
    console.log("You got Game with :")
    console.log(players)                            // now we got {guest,host players} let, set owners of Panzer counters
    console.log(Main.client.allCounters)  
    Main.client.allCounters['1'].setOwner(players.guest)
    Main.client.allCounters['2'].setOwner(players.host)
});
socket.on("gotDataToDraw", function (data) {       // data here shoul b e only starting point . drawAl Invokes once it really draws All 
    Main.client.drawAll(data)
});

socket.on("clickToMove",function(data){		//[this.selectedCounter.ID,this.hexClicked]
    Main.client.processEnteringClicks(data);
});

socket.on("turnTo",function(data){			//[this.selectedCounter.ID, [this.mySel.parentCounterObj.ID,'-=60',newSector]]
    Main.client.processEnteringTurns(data);
});

canvas.on({
    'mouse:down': function (options) {
        Main.client.processClicks(options);
    },
    'mouse:move': function (options) {
        Main.client.processMouseMove(options);           // No ! client shold not process it cause server doesn't need to know where a player moved his mouse
    }
});
