// Game is on Server side 

let tableCounter = require('./counters');

//console.log(tableCounter)


function forMPCostCalc (ownHex,hexClicked,dict) {
    if(dict[JSON.stringify([ownHex,hexClicked])]!=undefined){
        return dict[JSON.stringify([ownHex,hexClicked])]
    }else {
        return 1
    }
}

function Hex(q, r, s) {
    if (Math.round(q + r + s) !== 0) throw "q + r + s must be 0";
    return { q: q, r: r, s: s };
};

var hex_directions = [Hex(1, 0, -1), Hex(1, -1, 0), Hex(0, -1, 1), Hex(-1, 0, 1), Hex(-1, 1, 0), Hex(0, 1, -1)];

function hex_direction(direction) {
    return hex_directions[direction];
};

function hex_scale(a, k) {
    return Hex(a.q * k, a.r * k, a.s * k);
};

function hex_add(a, b) {
    return Hex(a.q + b.q, a.r + b.r, a.s + b.s);
};

function hex_neighbor(hex, direction) {
    return hex_add(hex, hex_direction(direction));
};

function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};



var Game = function () {
    this.gamesession = [];
    this.ID = (Math.random() + 1).toString(36).slice(2, 18);
    this.allCounters = {};      //   {id:counterobj}
    this.players = {};          
    this.state = {}; //{players:game.players,whoseTurnIsItNow:whoseTurnIsItNow,phase:phase}
    this.halfturn = 0;
    this.rallyPhaseStatus = undefined;
//------------------------------------------------------------------------------------------------
    this.classesTable = tableCounter ;
    this.sides = {};
    this.firstPlayer = undefined;
    this.scenario  = undefined;
    this.allScenarios = {
        'Last Ally, Last Victory':  {
            background : [
                { src :'assets/bdv.gif', coords : {top:0,left:112} },
                { src :'assets/bdu1gif.gif', coords : {top:1,left:112} },
                { src :'assets/bdt.gif', coords :{top:2,left:112} },
            ],
            startingSide : 'Nazi',
            startingSideELR : 3,
            startingSidePictureSrc : 'assets/turnphaseaxis.gif',
            secondPlayer : 'Axis',
            secondPlayerELR : 3,
            firstPlayerStartingPhase : 'firstPlayerRallyPhase',          // refactor to firstPlayerSettingPhase
            secondPlayerStartingPhase : 'secondPlayerRallyPhase',

            setOfOptionsforCounters : [ 
                // { 
                //     ownHexes : [{ q: 4, r: 2, s: -6 }],
                //     options : {class : 'AFV' , src: 'assets/IS2.gif', name: 'IS2', orientation: 1 ,owner: 'Axis',radiusView : 4, wreckSide :'assets/IS2b.gif'}
                // },
                // {
                //     ownHexes : [ { q: 2, r: 0, s: -2 }],
                //     options : {class : 'AFV' , src: 'assets/pziiif.gif', name: 'Panzer4', orientation: 1 ,owner: 'Nazi',radiusView : 4, wreckSide :'assets/pziiidb.gif'}
                // },
                // {
                //     ownHexes : [{ q: 7, r: 5, s: -12 },{ q: 8, r: 4, s: -12 }],
                //     //options : { class : 'ManCounters',src: 'assets/ru628S.gif', name: 'ruMMC',otherSideSrc : 'assets/ruh7b.gif', owner: 'Axis',ELR : 3,squadType : 'ruSquadE-0'}
                //     options : { class : 'ManCounters', name: 'ruMMC', owner: 'Axis',ELR : 3,type : 'ruSquadE-0'}
                // },
                // {
                //     ownHexes : [{ q: 3, r: 1, s: -4 },{ q: 4, r: 0, s: -4 },{ q: 4, r: 0, s: -4 }],
                //     options : { class : 'ManCounters', name: 'geMMC', owner: 'Nazi',ELR : 3,type : 'geSquadE-0'}
                // },
                // //--------------------------------------------------------------------------------------------------
                // {
                //     ownHexes : [{ q: 5, r: -1, s: -4 }],
                //     options : { class : 'SingleManCounters',src: 'assets/geL91.gif', name: 'geMMC', otherSideSrc : 'assets/geL91b.gif',owner: 'Nazi',type}
                // },
                //--------------------------------------------------------------------------------------------------
                { 
                    ownHexes : [{ q: 4, r: 2, s: -6 }],
                    options : {class : 'AFV' , name: 'IS2', orientation: 1 ,owner: 'Axis',type : 'IS2'}
                },
                {
                    ownHexes : [ { q: 2, r: 0, s: -2 }],
                    options : {class : 'AFV' , name: 'Panzer3', orientation: 1 ,owner: 'Nazi',type : 'panzer3'}
                },
                {
                    ownHexes : [{ q: 7, r: 5, s: -12 },{ q: 8, r: 4, s: -12 }],
                    options : { class : 'ManCounters', name: 'ruMMC', owner: 'Axis',ELR : 3,type : 'ruSquadE-0'}
                },
                {
                    ownHexes : [{ q: 3, r: 1, s: -4 },{ q: 4, r: 0, s: -4 },{ q: 4, r: 0, s: -4 }],
                    options : { class : 'ManCounters', name: 'geMMC', owner: 'Nazi',ELR : 3,type : 'geSquadE-0'}
                },
                //--------------------------------------------------------------------------------------------------
            ]
            // turn number
            // map
        }
    }
};

Game.prototype._createCounters = function (setOfOptionsforCounters){
    for (let i of setOfOptionsforCounters) {            
        

        for (let e of i.ownHexes) {
            let Class = this.classesTable[i.options.class]
            var copy = Object.assign({},i.options);
            //console.log(copy)
            copy['ownHex'] = e
            //console.log(copy)

            new  Class (copy)
            copy = {}
        }
    }
};



// Counter.prototype.setParametersForClient = function() {
//     this.parametersForClient = {
//         src : this.src ,
//         class : this.class,
//         ownHex : this.ownHex,
//         name: this.name,
//     }
// };


//------------------------------------------------------------------------------------------------

Game.prototype.setFirstPlayer = function(player) {
    this.firstPlayer = player
}

Game.prototype.setScenario = function(scenario) {
    this.scenario = this.allScenarios[scenario] 
}
//------------------------------------------------------------------------------------------------
Game.prototype.endTurn = function() {
    this.halfturn = this.halfturn + 1
    console.log('halfturn',this.halfturn);
    
    this.setPhase('RallyPhase')
};

Game.prototype.setPhase = function (phase) {
    console.log(phase)
    this.state.phase = phase
};

Game.prototype.switchPlayers = function (oppusersocket) {
    console.log('emitting changeTurn msg')
    oppusersocket.emit("changeTurn") 
    this.setplayerWhooseTurn(oppusersocket.username)
};


Game.prototype.switchPhase = function () {
    console.log('switching Phase')
    let phase = this.state.phase
    console.log(phase)
    switch (phase) {
        case 'RallyPhase' :
            console.log(phase)
            this.setPhase ('PrepFirePhase')
            break;
        case 'PrepFirePhase' :
            console.log(phase)
            this.setPhase ('MovementPhase')       //firstPlayerDefenciveFirePhase // refactor to just MovementPhase cause it is both Second and First Pl
            break;
        case 'MovementPhase' :
		    console.log("​Game.prototype.switchPhase -> 'MovementPhase'", 'MovementPhase')
            this.setPhase ('DefenciveFirePhase') 
            break;
        case 'DefenciveFirePhase' :
            console.log(phase)
            this.setPhase ('AdvancingFirePhase')        // 
            break;
        case 'AdvancingFirePhase' :
            console.log(phase)
            this.setPhase ('RoutPhase')        // 
            break;
        case 'RoutPhase' :
            console.log(phase)
            this.setPhase ('AdvancePhase')        // 
            break;
        case 'AdvancePhase' :
            console.log(phase)
            this.setPhase ('CloseCombatPhase')        // 
            break;
    }
}

Game.prototype.createCounter = function (owner, startingPosHex, orientation, radiusView,movingPoints) { // here we should give counter his owner , starting Pos , orientation , 

    let counter = new Counter(orientation, radiusView, owner, startingPosHex,movingPoints)      // 5 is the number of MP

    return counter
}
Game.prototype.startSession = function (guestsocket, hostsocket) {

    this.gamesession.push(guestsocket, hostsocket);

    this.players = { guest: guestsocket.username, host: hostsocket.username }
    //var players = {guest:guestsocket.username,host:hostsocket.username}
    //this.setplayerWhooseTurn(this.players.host)             // initial !
    this.gamesession.forEach(item => item.emit("message", this.players))

}

Game.prototype.setplayerWhooseTurn = function (thisplayershostorguest) {
    this.state.whoseTurnIsItNow = thisplayershostorguest
}


Game.prototype.processTurnClicks = function (data,oppusersocket) {  // data = [this.mySel.parentCounterObj.ID,'-=60',newSector]
    console.log(data)
    this.selectedCounter = this.allCounters[data[0]];
    this.selectedCounter.orientation = data[2];
    oppusersocket.emit("turnTo",[this.selectedCounter.ID,data])     // [newSector,'-=60']
}; 

Game.prototype.processOppsClick = function (data,oppusersocket) {          //[this.mySel.ID,this.hexClicked] processTurnClicks
    
    console.log(data)
    let hexClicked = data[1];
    this.selectedCounter = this.allCounters[data[0]];                   // let us ind counter b ID

    console.log(this.selectedCounter);
    console.log("let's check this.state.whoseTurnIsItNow : ")
    console.log(this.state.whoseTurnIsItNow);

    if (this.selectedCounter.owner === this.state.whoseTurnIsItNow) {
        console.log("this.selectedCounter.owner === this.state.whoseTurnIsItNow")
        console.log("...")
        if (this.selectedCounter.isClickedInNearHex(this.selectedCounter.ownHex, data[1])) {
            if (this.selectedCounter.isClickedInCoverArc(this.selectedCounter.orientation, this.selectedCounter.ownHex, data[1])) {
                console.log("es we clicked in Near Hex and isClickedInCoverArc")

                console.log("we are spending MP's. It's Mp now :")
                console.log(this.selectedCounter.movingPoints)

                oppusersocket.emit("clickToMove",[this.selectedCounter.ID, hexClicked]);

                if (this.selectedCounter.movingPoints == 0||this.selectedCounter.movingPoints<0 ) {
                    this.selectedCounter.movingPoints = 5
                    console.log(" MP is off !");

                    //oppusersocket.emit("changeTurnOrder",this.state)                    // refactor  here we need only this.state.....
                }
            }
        }
    }
};

Game.prototype.processKeys = function(oppusersocket) {
    console.log("we are processingKeys");
    console.log("this.state.phase: ");
    console.log(this.state.phase)
    if (this.state.phase === "firstPlayerMovementPhase") {
        this.state.phase = "pausedforFiring";
        oppusersocket.emit("pausedforFiring")
    } else
    if (this.state.phase === "pausedforFiring") {
        this.state.phase = "firstPlayerMovementPhase"
        oppusersocket.emit("endofpauseforfiring")
    }
}

// Game.prototype.processEndRally = function(oppusersocket) {

// }


module.exports = Game