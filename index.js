var express = require('express');
var app = express();
var server = require('http').Server(app);

var cookieParser = require('cookie-parser');        // with it we can use req.cookies.cookieName
var cookie = require('cookie');                     // with it we can ues cookie.parse
var cookieUserNameIsHere;
var io = require('socket.io')(server);

var Room = require('./notpublic/room');
var Game = require('./notpublic/game');
var User = require('./notpublic/user');

var rooms = [];
var roomsListtoSend = [];
var allsockets = {};
var allUsers = {};
var allsockets2 = {};
var allGames = {};

app.use(cookieParser());

app.use(function (req, res, next) {                 
    var cookieUserName = req.cookies.userName;
    if (cookieUserName === undefined) {                // On this site we are for the first time ! (or it was long ago.)
        cookieUserNameIsHere = false
    }
    else {
        cookieUserNameIsHere = true
    }
    next();
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/assets'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/something.html', function (req, res) {
    res.sendFile(__dirname + '/public/something.html');
});

io.on('connection', function (socket) {
    // io.sockets.connected is a Socket.io internal array of the sockets currently connected to the server. use it !

    if (socket.handshake.headers.cookie) {
        var cookies = cookie.parse(socket.handshake.headers.cookie)
    };
    allsockets[socket.id] = socket;

    if (cookieUserNameIsHere) {
        allsockets2[cookies.userName] = socket;
        socket.username = cookies.userName;
    }

    socket.emit('connected!', roomsListtoSend);

    socket.on('loginMePlease', function (username) {       
                     // chek Username . we can even check from Database
        socket.username = username;
        if (!allUsers[username]) {                           // it could be situation when cookie with UserName was destroyed but user still here ,to avoid it let's check
            var user = new User(username);
            allUsers[socket.username] = user;
        } else {
            var user = allUsers[socket.username];
        }
        if (user.startedGameArray) {                                   
            socket.emit("showYourGames", user.startedGameArray)
        }
        if (user.inGame) {
            var game = allGames[user.gameID];
            if (game.gamesession.length < 2) {
                game.gamesession.push(socket);
                //game.players2[socket.username] = socket ; // not sure if we need it . We could find socket, for example as game.gamesession.indexOf(socket)
            }
            if (game.gamesession.length === 2) {
                // var player1socket = game.gamesession[0];
                // var player2socket = game.gamesession[1];
                // game.players = { guest: player1socket.username, host: player2socket.username }

                // var p1 = game.createCounter(player1socket.username,{q:0,r:0,s:0},1,4);
                // p1.ID = 1;
                // game.allCounters[p1.ID] = p1;
                // var p2 = game.createCounter(player2socket.username,{q:2,r:0,s:-2},1,4);                            // ////  add-on
                // p2.ID = 2;
                // game.allCounters[p2.ID] = p2;

                // game.setplayerWhooseTurn(game.players.host) ;

                game.gamesession.forEach(item => item.emit("message", game.players))
                //console.log(allUsers)
            }
            user.inGame = false;
        }

        socket.emit('loginConfirmed');

        socket.on("continueGame", function (data) {       //data =  [roomID,oppUsername]
            user.inGame = true;
            socket.emit("WeAreSendingYouToOtherPage");
        });

        socket.on('joinroom', function (data) {       //(data=[roomID,username,])
            var roomtojoin = rooms.find(item => item.roomID === data[0]);   // find room with given ID //
            var oppsocket = allsockets2[data[1]];
            if (socket.username !== roomtojoin.hostusername) {        // not Host ?
                oppsocket.emit("changeyourbutton", [data[0], socket.username])       
            };

            roomtojoin.listofplayers.push(socket.username);
            
            if (roomtojoin.listofplayers.length == 2) {
                var game = new Game();
                
                allGames[game.ID] = game
                var oppUser = allUsers[oppsocket.username];

                oppUser.inGame = true;
                oppUser.gameID = game.ID
                oppUser.startedGameArray = [data[0], socket.username]

                user.inGame = true;
                user.gameID = game.ID
                user.startedGameArray = [data[0], oppsocket.username]    

                if (socket.username !== data[1]) {        // not Host ?
                    var guestusername = socket.username  
                } else {
                    var guestusername = oppsocket.userName
                }

                game.players = { guest: guestusername, host: roomtojoin.hostusername }

                var p1 = game.createCounter(game.players.guest,{q:0,r:0,s:0},1,4);
                p1.ID = 1;
                game.allCounters[p1.ID] = p1;

                var p2 = game.createCounter(game.players.host,{q:2,r:0,s:-2},1,4);                            // ////  add-on
                p2.ID = 2;
                game.allCounters[p2.ID] = p2;

                game.setplayerWhooseTurn(game.players.host) ;

                var arr = [socket, oppsocket]
                arr.forEach(item => item.emit("WeAreSendingYouToOtherPage"))
            }
        });

        socket.on('createRoom', function () {                                // what if we got it in the socket.on('newuser' callback ? 
            var room = new Room (socket);
            rooms.push(room);
            
            for (var i in rooms) {
                roomsListtoSend.push({ hostusername: rooms[i].hostusername, roomID: rooms[i].roomID })
            };

            socket.broadcast.emit('roomCreated', [socket.username, room.roomID])
            socket.emit("iCreatedRoom",room.roomID)
        });

        
        socket.on ("moveTo",function (data) {
            var oppusersocket = allsockets2[user.startedGameArray[1]];
            game.processOppsClick (data,oppusersocket)
        });

        socket.on("turnTo",function (data) {
            console.log(data);
            var oppusersocket = allsockets2[user.startedGameArray[1]];
            game.processTurnClicks(data,oppusersocket)
        })
        socket.on('disconnect', function () {       
            delete allsockets2[socket.username];
            var a = allGames[user.gameID].gamesession.indexOf(socket);
            
            if (a>0) {
            allGames[user.gameID].gamesession.splice(a, 1);
            }
            console.log("Disconected : " + socket.id); 


        });

    })


});

console.log('Server started.');
server.listen(2000);