var usernameInput = document.querySelector('.usernameInput');
var loginPage = document.querySelector('.login.page');
var lobbyPage = document.querySelector('.lobby.page') // shouldbe lobbypage !
var gettingRoomBtn = document.getElementById('creatingGame');

var socket = io();
var username;

let listOfScenarioButtons = [];


usernameInput.focus()

if (!getCookie("userName")) {                                    // no userNamecokie ?
  usernameInput.focus();                                      // let's set it
  usernameInput.onkeydown = function (event) {
    if (event.which === 13) {                                    // When the client hits ENTER on their keyboard
      username = usernameInput.value.trim();
      document.cookie = 'userName=' + username + "; expires=Thu, 01 Jan 2020 00:00:00 GMT";
      socket.emit("loginMePlease", username);
    }
  }
} else {
  username = getCookie("userName");
  socket.emit("loginMePlease", username);
}

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

socket.on("loginConfirmed", function () {
  loginPage.style.opacity = '0';
  lobbyPage.style.display = 'block';
  loginPage.remove()
});

socket.on('connected!', function (rooms) {
  buildALobby(rooms)
});

socket.on('roomCreated', function (data) {          // data = [socket.username, room.roomID]
  createAllButtons(data[0], data[1], 'Join room', "joinroom")
});

socket.on("iCreatedRoom", function (data) {
  var ul = document.createElement('ul');
  var button = document.createElement('button');
  var li = document.createElement('li');
  ul.appendChild(document.createTextNode(username));
  button.innerHTML = "Waiting for an Opponent";

  button.setAttribute('id', data);

  li.appendChild(button);
  ul.appendChild(li);
  lobbyPage.appendChild(ul);
});

socket.on("WeAreSendingYouToOtherPage", function () {
  location.href = './something.html'
});

socket.on("changeyourbutton", function (data) {      //(data=[roomID,username,])
  //document.getElementById(data[0]).parentElement.remove();
  document.getElementById(data[0]).remove();
  createAllButtons(data[1], data[0], "Start Game !", "joinroom");
});

socket.on("showYourGames", function (data) {                       //  data = user.startedGameArray = [roomID,oppsocket.username]  
  createAllButtons(data[1], data[0], "Continue Game !", "continueGame")
})

function buildALobby(rooms) {
  for (var i in rooms) {
    createAllButtons(rooms[i].hostusername, rooms[i].roomID, 'Join room', "joinroom")
  }
};

function createAllButtons(username, roomID, innerHTML, emittingMessage) {
  var ul = document.createElement('ul');
  var button = document.createElement('button');
  var li = document.createElement('li');

  ul.appendChild(document.createTextNode(username));

  button.innerHTML = innerHTML
  button.roomID = roomID
  button.addEventListener('click', function () {
    socket.emit(emittingMessage, [roomID, username])
    button.remove();
  });

  li.appendChild(button);
  ul.appendChild(li);
  lobbyPage.appendChild(ul);
};


gettingRoomBtn.onclick = function () {
  //------------------------------------------------------------------------------------------
  // get scenarioslist from server
  // bulid buttons

  //socket.emit('createRoom')   // ('getScenariosList')
  socket.emit('getScenariosList') 
};

socket.on('catchScenariosList',function(data){      //  {'L A, L V' : ['Nazi','Axis']}

  let scenarioslist = Object.keys(data) 
  //let li = document.createElement('li');
  let ul = document.createElement('ul');
  ul.innerHTML = 'Please,choose scenario :'
  for (let i of scenarioslist) {

    let li = document.createElement('li');
    let button = document.createElement('button');

    button.innerHTML = i
    button.addEventListener('click',() => {           //listOfScenarioButtons

      //socket.emit('choosedScenario',button.innerHTML)

      // for (let e of listOfScenarioButtons) {
      //   e.remove()
      // }
      

      let newUl = document.createElement('ul');
      newUl.innerHTML = 'Please, choose your Side :'

      let innerList = data[button.innerHTML];

      for (let e of innerList) {

        let lii = document.createElement('li');
        let btn = document.createElement('button');
        btn.innerHTML = e;
        
        btn.addEventListener('click',() => { 

          console.log([button.innerHTML,btn.innerHTML]);

          socket.emit('choosedScenarioAndSide',[button.innerHTML,btn.innerHTML])

          newUl.remove()

        })
        lii.appendChild(btn);
        newUl.appendChild(lii);
      }

      ul.remove();

      lobbyPage.appendChild(newUl);

    });

    li.appendChild(button);
    ul.appendChild(li)

    listOfScenarioButtons.push(button)
    
  }

  lobbyPage.appendChild(ul)
})
  //------------------------------------------------------------------------------------------