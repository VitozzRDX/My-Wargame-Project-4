import * as hexFunctions from './HexFunctions.js'
import {Counter} from './counters.js'

var flat = hexFunctions.Layout(hexFunctions.layout_flat, hexFunctions.Point(37.5, 37.5), hexFunctions.Point(0, 0));

var Client = function () {
    // console.log('canvas in new C :');
    // console.log(canvas);
    // console.log(canvas.add);
    this.username = null
    this.mySel = undefined;
    this.listOfRectsToDraw = [];
    this.listOfRectsToDraw1 = [];
    this.hexClicked = undefined;
    this.allCounters = {};
    //this.flat = 
    this.setOfOptionsforCounters = [{src:'assets/pziiif.gif', name:'panzer1',orientation:1,radiusView: 8,ownHex:{q:0, r:0, s:0},ID:1},
                                    {src:'assets/pziiif.gif', name:'panzer1',orientation:1,radiusView: 8,ownHex:{ q: 2, r: 0, s: -2},ID:2}]  
};

export {Client};

Client.prototype.processClicks = function (options) {

    if (options.target && options.target.selectable) {    //selectable  is inner property of image
        if (options.target.parentCounterObj.owner === this.username) {      // if you clicked on your's counter 
            if (options.e.which === 1) {                                // LMB -
                console.log('clicked on target and that target is selectable and its owner is You')
                this.mySel = options.target;
                clearHighlightDraw(this, this.mySel.orientation,this.mySel.parentCounterObj.radiusView, this.mySel.ownHex, 'red');      //rad

            } else {
                if (options.e.which === 3) {
                    console.log('Show custom Menu !')
                }
            };

        } else {
            console.log("No")
        }

    } else {
        console.log('');
        console.log('click with one condition unchecked : either there is no options.target, or target is not selectable')
        if (this.mySel) {										// if we already selected obj ( counter ) then we move it or rotate it
            clearPreviousSector(this.listOfRectsToDraw);			//  clearing Red sector !
            clearPreviousSector(this.listOfRectsToDraw1);           //  clearing Green sector !
            
            this.hexClicked = hexFunctions.hex_round(hexFunctions.pixel_to_hex(flat, { x: options.e.clientX, y: options.e.clientY }));        // addon

            if (options.e.which === 1) {						// move obj
                console.log('we are here cause we got something selected and pressed LMB')
                if (hexFunctions.isClickedInNearHex(this.mySel.ownHex, this.hexClicked )) {      //options.e, 
                    console.log('clicked in NearHex of that something')
                    if (hexFunctions.isClickedInCoverArc(this.mySel.orientation, this.mySel.ownHex, this.hexClicked)) {  //options.e, 
                        console.log('clicked in CoverArc of that something')
                        this.mySel.ownHex = this.hexClicked ;
                        var center = hexFunctions.center_of_hex(flat, this.mySel.ownHex);                            // change to var center or this.center to reove ro Global

                        console.log('');
                        console.log('we checked all and emitting moveTo message with :');
                        console.log([this.mySel.parentCounterObj.ID,this.hexClicked]);

                        socket.emit("moveTo",[this.mySel.parentCounterObj.ID,this.hexClicked])    //  which counter was clicked (identi b ID ) ,   clicked hex ,  

                        this.mySel.animate({ left: center.x, top: center.y }, { //futureLeft
                            onChange: canvas.requestRenderAll.bind(canvas),
                            duration: 500
                        });
                        clearHighlightDraw(this, this.mySel.orientation,this.mySel.parentCounterObj.radiusView, this.mySel.ownHex, 'red');  // three in one
                    }
                };
            }
            if (options.e.which === 3) {					// rotate it
                console.log('we are here cause we got something selected and pressed RMB');
                var newSector = creatingNewSectorToDrawOnMouseMove(options.e, this.mySel)

                if (newSector - this.mySel.orientation === 1 || newSector - this.mySel.orientation === -5) { // clicked one sector below
                    this.mySel.orientation = newSector;

                    console.log('we are emitting "turnTo" with angle = +=60');
                    socket.emit("turnTo",[this.mySel.parentCounterObj.ID,'+=60',newSector])
                    clearHighlightDraw(this, this.mySel.orientation,this.mySel.parentCounterObj.radiusView, this.mySel.ownHex, 'red');

                    this.mySel.animate('angle', '+=60', {
                        onChange: canvas.renderAll.bind(canvas)
                    });
                }
                if (newSector - this.mySel.orientation === -1 || newSector - this.mySel.orientation === 5) { // one sector above
                    this.mySel.orientation = newSector;

                    console.log('we are emitting "turnTo" with angle = -=60');
                    socket.emit("turnTo",[this.mySel.parentCounterObj.ID,'-=60',newSector])
                    clearHighlightDraw(this, this.mySel.orientation,this.mySel.parentCounterObj.radiusView, this.mySel.ownHex, 'red');

                    this.mySel.animate('angle', '-=60', {
                        onChange: canvas.renderAll.bind(canvas)
                    });
                }
            }
        }
    }
};

Client.prototype.processMouseMove = function (options) {     // server doesn.t need it 
    if (this.mySel) {
        var newSector = creatingNewSectorToDrawOnMouseMove(options.e, this.mySel)
        if (newSector != this.mySel.orientation) {
            //sector = newSector;
            //console.log(sector)
            clearPreviousSector(this.listOfRectsToDraw1);
            this.listOfRectsToDraw1 = highlightSector(newSector , 3, this.mySel.ownHex, null, this.listOfRectsToDraw1);
            //drawSector(this.listOfRectsToDraw1);
        }
    }
};

Client.prototype.processEnteringClicks = function (data) {      ////[this.selectedCounter.ID,this.hexClicked]
    console.log(data)
    var oppsSelectedCounter = this.allCounters[data[0]];
    var center = hexFunctions.center_of_hex (flat,data[1]);
    oppsSelectedCounter.img.animate({ left: center.x, top: center.y }, { //futureLeft
        onChange: canvas.requestRenderAll.bind(canvas),
        duration: 500
    });
};

Client.prototype.processEnteringTurns = function (data) { // [this.selectedCounter.ID, [this.mySel.parentCounterObj.ID,'-=60',newSector]]
    var oppsSelectedCounter = this.allCounters[data[0]];
    var d = data[1] ;                                   
    oppsSelectedCounter.img.animate('angle', d[1], {
        onChange: canvas.renderAll.bind(canvas)
    });
};

Client.prototype.drawBackground = function (src) {
    // console.log('canvas in DB :');
    // console.log(canvas);
    fabric.Image.fromURL(src, function (img) {		// map !
        // console.log('canvas in DB fabric.Image:');
        // console.log(canvas);
        // console.log(canvas.add);
        img.set({
                left: 112,
                top: 33,
            });
        img.selectable = false;
        canvas.add(img)
        canvas.sendToBack(img)
    })//.bind(canvas)
};

Client.prototype.createCounter = function(data) {      // constructor(src, name,orientation, radiusView,ownHex)
    var counter = new Counter(data.src, data.name,data.orientation, data.radiusView,data.ownHex,data.ID,flat);//,canvas
    this.allCounters[counter.ID] = counter ;
    return counter;
};

Client.prototype.drawCounter = function (counterObj) {
    counterObj.center = hexFunctions.hex_to_pixel (counterObj.flat,counterObj.ownHex)
    fabric.Image.fromURL(counterObj.src, function (img) {
        img.set({
            left: counterObj.center.x,
            top: counterObj.center.y,
            originX: 'center',
            originY: 'center'
        });
        img.orientation = counterObj.orientation;
        img.center = hexFunctions.Point(img.width, img.height);
        img.ownHex = counterObj.ownHex;
        img.parentCounterObj = counterObj         // good ! now we can remove all img. and get them by img.parentCounterObj
        counterObj.img = img
        canvas.add(img)
    });//.bind(this));
}

Client.prototype.drawAll = function () {
    var listOfIDs = Object.keys(this.allCounters);
    console.log(this.allCounters)
    for ( var i in listOfIDs) {
        //console.log(i)
        //this.allCounters[listOfIDs[i]].drawImage()
        this.drawCounter(this.allCounters[listOfIDs[i]])
    }
};

function creatingNewSectorToDrawOnMouseMove(event, selectedObj) {
    var hexOnMouseOver = hexFunctions.hex_round(hexFunctions.pixel_to_hex(flat, { x: event.clientX, y: event.clientY }));
    var res = selectedObj.ownHex;
    var newSector =
        hexOnMouseOver.r - res.r <= 0 && hexOnMouseOver.s - res.s <= 0 ? 0 :
            hexOnMouseOver.q - res.q >= 0 && hexOnMouseOver.r - res.r >= 0 ? 1 :
                hexOnMouseOver.s - res.s <= 0 && hexOnMouseOver.q - res.q <= 0 ? 2 :
                    hexOnMouseOver.r - res.r >= 0 && hexOnMouseOver.s - res.s >= 0 ? 3 :
                        hexOnMouseOver.q - res.q <= 0 && hexOnMouseOver.r - res.r <= 0 ? 4 :
                            5;
    return newSector
}

function clearPreviousSector(List) {
   for (var i in List) {
       canvas.remove(List[i])
   }
};

function highlight(q, r, s, color) {  			 // , listOfHexObjToRemove // drawing given  rect - change highlight to 'draw'
   var rect = new fabric.Polygon(hexFunctions.polygon_corners(flat, { q: q, r: r, s: s }), {
       stroke: 'green',
       opacity: 0.3,
       fill: color,
       selectable: false
   });
   canvas.add(rect);
   return rect		// addon
}

function highlightSector(sector, maxRadius, startingHexCoord, color,list) {			//, listOfHexObjToRemove// sector - orientation , maxPad - distance of look , color - realize !
   var list = []
   for (var radius = 1; radius <= maxRadius; radius++) {
       for (var a = 0; a >= -radius; a--) {
           var b = - radius - a;

           if (sector == 0) {list.push(highlight(radius + startingHexCoord.q, a + startingHexCoord.r, b + startingHexCoord.s, color))};	// , listOfHexObjToRemove
           if (sector == 1) {list.push(highlight(-a + startingHexCoord.q, -b + startingHexCoord.r, -radius + startingHexCoord.s, color))};
           if (sector == 2) {list.push(highlight(b + startingHexCoord.q, radius + startingHexCoord.r, a + startingHexCoord.s, color))};
           if (sector == 3) {list.push(highlight(-radius + startingHexCoord.q, -a + startingHexCoord.r, -b + startingHexCoord.s, color))};
           if (sector == 4) {list.push(highlight(a + startingHexCoord.q, b + startingHexCoord.r, radius + startingHexCoord.s, color))};
           if (sector == 5) {list.push(highlight(-b + startingHexCoord.q, -radius + startingHexCoord.r, -a + startingHexCoord.s, color))};
       }
   }
   return list
};

function clearHighlightDraw (obj,orientation,maxRadius,startingHexCoord, color) {		//clearHighlightDraw(this,this.mySel.orientation, 3, this.mySel.ownHex, 'red');
   clearPreviousSector(obj.listOfRectsToDraw);
   obj.listOfRectsToDraw = highlightSector(orientation,maxRadius,startingHexCoord, color,obj.listOfRectsToDraw);
};

function differenceBetweenCAandSector(a, b) {
    return a - b
};

function getNumberAndSignToTurnCounter(mySec, secClicked) {
    var diff = differenceBetweenCAandSector(mySec, secClicked);
    if (diff === 1 || diff === -5) return 1;   // important ! , though now it is only one possibility for those diffs , but it should by chosen by player how he wants to turn its counter
    if (diff === 2 || diff === -4) return 2;
    if (diff === 3 || diff === -3) return 3;
    if (diff === -1 || diff === 5) return -1;
    if (diff === -2 || diff === 4) return -2;
}
