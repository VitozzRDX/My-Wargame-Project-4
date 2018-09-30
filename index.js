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
        console.log("User :")
        console.log(username)
        console.log("are inside 'loginMePlease'");

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
            console.log("our User is .inGame");
            var game = allGames[user.gameID];
            if (game.gamesession.length < 2) {
                game.gamesession.push(socket);
            }
            if (game.gamesession.length === 2) {
                console.log("we are still inside 'loginMePlease' and our User is :");
                console.log(user);
                console.log("... and we checked if this User is .inGame and game.gamesession.length = 2 , so below is game.players :")
                console.log(game.players);
                game.gamesession.forEach(item => item.emit("message", game.players))

            }
            user.inGame = false;
        }

        socket.emit('loginConfirmed');

        socket.on("continueGame", function (data) {       //data =  [roomID,oppUsername]
            user.inGame = true;
            socket.emit("WeAreSendingYouToOtherPage");
        });

        socket.on('joinroom', function (data) {       //(data=[roomID,username,])

            console.log("we got 'joinroom' event data below (data=[roomID,username,]) :");
            console.log(data);
            console.log("our username is :");
            console.log(socket.username);

            var roomtojoin = rooms.find(item => item.roomID === data[0]);   // find room with given ID //

            console.log("we found our room bY its ID and its host is :")
            console.log(roomtojoin.hostusername);

            var oppsocket = allsockets2[data[1]];

            console.log("let us find oppuser. It is :")
            console.log(oppsocket.username);
            
            if (socket.username !== roomtojoin.hostusername) {        // not Host ?
                console.log("we checked if socket.username was not the same as  roomtojoin.host and emitted changeyourbutton event")
                oppsocket.emit("changeyourbutton", [data[0], socket.username])       
            };

            roomtojoin.listofplayers.push(socket.username);
            
            console.log("we pushed socket.username to roomtojoin.listofplayers and now it is :") ;
            console.log(roomtojoin.listofplayers);

            if (roomtojoin.listofplayers.length == 2) {
                console.log("we checked room's length and it is full")
                var game = new Game();
                console.log("created new Game");

                allGames[game.ID] = game
                var oppUser = allUsers[oppsocket.username];

                console.log("found oppUser . It is :")
                console.log(oppUser)
                console.log("... when our User still :")
                console.log(user)

                oppUser.inGame = true;
                oppUser.gameID = game.ID
                oppUser.startedGameArray = [data[0], socket.username]

                user.inGame = true;
                user.gameID = game.ID
                user.startedGameArray = [data[0], oppsocket.username]    

                console.log("let us check a hoster of room. It still should be same : ")
                console.log(data[1]);
                console.log(roomtojoin.hostusername);
                console.log("");
                console.log("let us check if connected right now socket is equal to room's hoster")
                console.log(socket.username);
                console.log(data[1]);
                if (socket.username !== roomtojoin.hostusername) { //data[1]) {        // not Host ?
                    console.log("no socket is not equal to room's hoster nae");
                    console.log("...")
                    var guestusername = socket.username  
                } else {
                    console.log("yes socket is equal to room's hoster nae");
                    console.log("...")
                    var guestusername = oppsocket.username
                }

                game.players = { guest: guestusername, host: roomtojoin.hostusername }

                console.log("server creating counters :")
                var p1 = game.createCounter(game.players.guest,{q:0,r:0,s:0},1,4);
                p1.ID = 1;
                game.allCounters[p1.ID] = p1;
                console.log(p1);
                var p2 = game.createCounter(game.players.host,{q:2,r:0,s:-2},1,4);                            // ////  add-on
                p2.ID = 2;
                game.allCounters[p2.ID] = p2;
                console.log(p2);
                console.log("...");

                game.setplayerWhooseTurn(game.players.host) ;

                var arr = [socket, oppsocket]
                arr.forEach(item => item.emit("WeAreSendingYouToOtherPage"))
            }
        });

        socket.on('createRoom', function () {                               
            var room = new Room (socket);
            rooms.push(room);
            
            for (var i in rooms) {
                roomsListtoSend.push({ hostusername: rooms[i].hostusername, roomID: rooms[i].roomID })
            };

            socket.broadcast.emit('roomCreated', [socket.username, room.roomID])
            socket.emit("iCreatedRoom",room.roomID)
        });

        
        socket.on ("moveTo",function (data) {       // [this.mySel.parentCounterObj.ID,this.hexClicked]
            console.log(" from socket ... ");
            console.log(socket.username);
            console.log("... got moveTo message . Launching game.processOppsClick ");
            var oppusersocket = allsockets2[user.startedGameArray[1]];
            game.processOppsClick (data,oppusersocket)
        });

        socket.on("turnTo",function (data) {    //[this.mySel.parentCounterObj.ID,'-=60',newSector]
            console.log(" socket ");
            console.log(socket.username);
            console.log("... emitted turnTo message");
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


server.listen(process.env.PORT || 2000,function(){
    console.log('Listening on '+server.address().port);
});