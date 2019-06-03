import {Client} from './client.js'

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
};

function findingOppsName (name,players) {
    for (let i in Object.keys(players)) {
        if (players[Object.keys(players)[i]] != name) {
            return players[Object.keys(players)[i]]
        }
    }
};

var canvas = document.getElementById('canvas')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let Main = {};

//Main.socket = io();

Main.username = getCookie('userName');
Main.client = new Client();
Main.client.socket = io();

Main.client.socket.emit("loginMePlease",Main.username);

Main.client.socket.on("startGame", function (gamestate) {

    let players = gamestate.players;
    let mySide = gamestate.sides[Main.username];
    let scenario = gamestate.scenario ;
    let setOfOptionsforCounters = gamestate.setOfOptionsforCounters;
    
    Main.opponentname = findingOppsName(Main.username,players);

    Main.client.init(scenario,mySide,setOfOptionsforCounters,)


});

window.addEventListener('keydown', function(e) {
    if( e.keyCode == 87 || e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 83) {
    e.preventDefault()};
});

document.getElementById('canvasContainer').tabIndex = 1000;
document.getElementById('canvasContainer').addEventListener("keydown", function(options) {        // we'll also need for blur event to come back focus on canv
    Main.client.processKeyDown(options);
});
document.getElementById('canvasContainer').addEventListener("keyup", function(options) {        // we'll also need for blur event to come back focus on canv
    Main.client.processKeyUp(options);
});


Main.client.socket.on('endRally',function(){
    if (Main.client.game.rallyPhaseStatus === 'ended') {
        Main.client.endPhase();
        Main.client.game.rallyPhaseStatus = undefined ;
    } else {
        Main.client.game.rallyPhaseStatus = 'ended'
    }
});

Main.client.socket.on('endPhase',function(){

    Main.client.endPhase()
});