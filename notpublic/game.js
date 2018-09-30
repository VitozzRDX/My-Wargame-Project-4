// Game is on Server side 

function Point(x, y) {
    return { x: x, y: y };
};

function Orientation(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
    return { f0: f0, f1: f1, f2: f2, f3: f3, b0: b0, b1: b1, b2: b2, b3: b3, start_angle: start_angle };
};

function Layout(orientation, size, origin) {
    return { orientation: orientation, size: size, origin: origin };
};

function Hex(q, r, s) {
    if (Math.round(q + r + s) !== 0) throw "q + r + s must be 0";
    return { q: q, r: r, s: s };
};

var hex_directions = [Hex(1, 0, -1), Hex(1, -1, 0), Hex(0, -1, 1), Hex(-1, 0, 1), Hex(-1, 1, 0), Hex(0, 1, -1)];

function hex_direction(direction) {
    return hex_directions[direction];
};

function hex_round(h) {
    var qi = Math.round(h.q);
    var ri = Math.round(h.r);
    var si = Math.round(h.s);
    var q_diff = Math.abs(qi - h.q);
    var r_diff = Math.abs(ri - h.r);
    var s_diff = Math.abs(si - h.s);
    if (q_diff > r_diff && q_diff > s_diff) {
        qi = -ri - si;
    }
    else
        if (r_diff > s_diff) {
            ri = -qi - si;
        }
        else {
            si = -qi - ri;
        }

    return Hex(qi, ri, si);
};

function hex_to_pixel(layout, h) {
    var M = layout.orientation;
    var size = layout.size;
    var origin = layout.origin;
    var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
    var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
    return Point(x + origin.x, y + origin.y);
};

function pixel_to_hex(layout, p) {
    var M = layout.orientation;
    var size = layout.size;
    var origin = layout.origin;
    var pt = Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
    var q = M.b0 * pt.x + M.b1 * pt.y;
    var r = M.b2 * pt.x + M.b3 * pt.y;

    return Hex(q, r, -q - r);
};

function hex_corner_offset(layout, corner) {
    var M = layout.orientation;
    var size = layout.size;
    var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6;
    return Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
};

function polygon_corners(layout, h) {
    var corners = [];
    var center = hex_to_pixel(layout, h);

    for (var i = 0; i < 6; i++) {
        var offset = hex_corner_offset(layout, i);
        corners.push(Point(center.x + offset.x, center.y + offset.y));
    }
    return corners;
};

function center_of_hex(layout, h) {
    return hex_to_pixel(layout, h);
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

class Counter {
    constructor(orientation, radiusView, owner, startingPosHex) {
        //this.name = name;
        this.owner = owner;
        this.orientation = orientation;
        this.radiusView = radiusView;
        //this.ID = (Math.random() + 1).toString(36).slice(2, 18);
        this.ownHex = startingPosHex;
    }
};

var Game = function () {
    this.gamesession = [];
    this.ID = (Math.random() + 1).toString(36).slice(2, 18);
    this.allCounters = {};      //   {id:counterobj}
    this.players = {};          // addon
};

Game.prototype.createCounter = function (owner, startingPosHex, orientation, radiusView) { // here we should give counter his owner , starting Pos , orientation , 
    var counterData = { "owner": owner, "startingPos": startingPosHex, "orientation": orientation };
    //this.gameState.push()     ??? 
    var counter = new Counter(orientation, radiusView, owner, startingPosHex)      // ?? this.counter ?
    //this.allCounters[counter.ID] = counter;
    //this.allCounters[counter.ID] = new Counter (orientation,radiusView,owner,startingPosHex) ;
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
    this.playerWhooseTurnItIs = thisplayershostorguest
}

Counter.prototype.isClickedInNearHex = function (originHex, hexClicked) {
    console.log(" we are inside isClickedInNearHex ")
    console.log("originHex :");
    console.log(originHex)
    console.log("hexClicked :");
    console.log(hexClicked);

    var listOfNtHexes = this.listOfNearestHexes(originHex, 1);
    console.log("listOfNtHexes :")
    console.log(listOfNtHexes)
    for (var i in listOfNtHexes) {											// optimize ?
        if (deepEqual(listOfNtHexes[i], hexClicked)) {
            console.log("es we clicked in Near Hex")
            return true;
        }
    }
    console.log("No we clicked not in Near Hex")
    return false
}

Counter.prototype.isClickedInCoverArc = function (orientation, originHex, hexClicked) {
    console.log(" we are inside isClickedInCoverArc ");
    console.log("originHex :");
    console.log(originHex)
    console.log("hexClicked :");
    console.log(hexClicked);

    var listOfNtHexes = this.creatingListOfNearestHexesInCA(orientation, originHex);

    console.log("listOfNtHexes :")
    console.log(listOfNtHexes)

    for (var i in listOfNtHexes) {											// optimize ?
        if (deepEqual(listOfNtHexes[i], hexClicked)) {
            console.log("Yes we clicked in CA")
            return true;
        }
    }
    console.log("No we clicked not in CA")
    return false
}

Counter.prototype.listOfNearestHexes = function (startingHexCoord, radius) {
    console.log(" we are inside listOfNearestHexes ")
    console.log(startingHexCoord)
    var results = [];
    var hex = hex_add(startingHexCoord, hex_scale(hex_direction(4), radius));              // optimize it  - radius is always == 1  // startingHex.add()
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < radius; j++) {
            results.push(hex);
            hex = hex_neighbor(hex, i)
        }
    }
    return results
}

Counter.prototype.creatingListOfNearestHexesInCA = function (sector, startingHexCoord) {	//,list
    var list = []
    var radius = 1
    for (var a = 0; a >= -1; a--) {
        var b = - 1 - a;
        if (sector == 0) list.push({ q: radius + startingHexCoord.q, r: a + startingHexCoord.r, s: b + startingHexCoord.s });
        if (sector == 1) list.push({ q: -a + startingHexCoord.q, r: -b + startingHexCoord.r, s: -radius + startingHexCoord.s });
        if (sector == 2) list.push({ q: b + startingHexCoord.q, r: radius + startingHexCoord.r, s: a + startingHexCoord.s });
        if (sector == 3) list.push({ q: -radius + startingHexCoord.q, r: -a + startingHexCoord.r, s: -b + startingHexCoord.s });
        if (sector == 4) list.push({ q: a + startingHexCoord.q, r: b + startingHexCoord.r, s: radius + startingHexCoord.s });
        if (sector == 5) list.push({ q: -b + startingHexCoord.q, r: -radius + startingHexCoord.r, s: -a + startingHexCoord.s });
    }
    return list
};
Game.prototype.processTurnClicks = function (data,oppusersocket) {  // data = [this.mySel.parentCounterObj.ID,'-=60',newSector]
    console.log(data)
    this.selectedCounter = this.allCounters[data[0]];
    this.selectedCounter.orientation = data[2];
    oppusersocket.emit("turnTo",[this.selectedCounter.ID,data])     // [newSector,'-=60']
}; 

Game.prototype.processOppsClick = function (data,oppusersocket) {          //[this.mySel.ID,this.hexClicked] processTurnClicks
    console.log(data)
    this.selectedCounter = this.allCounters[data[0]]                       // let us ind counter b ID
    console.log(this.selectedCounter);
    console.log(this.playerWhooseTurnItIs);
    // if (this.selectedCounter.owner === this.playerWhooseTurnItIs) {
    //     console.log("this.selectedCounter.owner === this.playerWhooseTurnItIs")
    //     console.log("...")
        if (this.selectedCounter.isClickedInNearHex(this.selectedCounter.ownHex, data[1])) {
            if (this.selectedCounter.isClickedInCoverArc(this.selectedCounter.orientation, this.selectedCounter.ownHex, data[1])) {
                console.log("es we clicked in Near Hex and isClickedInCoverArc")
                this.selectedCounter.ownHex = data[1];
                console.log ("we emitting clickToMove to oppuser with this data :");
                console.log ([this.selectedCounter.ID, data[1]]);
                oppusersocket.emit("clickToMove",[this.selectedCounter.ID, data[1]])
            }
        }
    //}
};

module.exports = Game