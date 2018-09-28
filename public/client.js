// Here we got obj Client 
// It is a layer between Game and Server
// So when for example we need to move our Tank to the point X , 
// Game obj catches click and call Client.sendClick
// so here are only methods that emits and cathces events

var Client = function () {
    this.mySel = undefined;
    this.listOfRectsToDraw = [];
    this.listOfRectsToDraw1 = [];
    this.hexClicked = undefined;
};

Client.prototype.processClicks = function (options) {
    if (options.target && options.target.selectable) {    //selectable  is inner property of image
        if (options.target.parentCounterObj.owner === username) {      // if you clicked on your's counter 

            if (options.e.which === 1) {                                // LMB -
                console.log('click')
                this.mySel = options.target;
                clearHighlightDraw(this, this.mySel.orientation, 3, this.mySel.ownHex, 'red');

            } else {

                if (options.e.which === 3) {
                    console.log('Show custom Menu !')
                }
            };

        } else {
            console.log("No")
        }

    } else {
        if (this.mySel) {										// if we already selected obj ( counter ) then we move it or rotate it
            clearPreviousSector(this.listOfRectsToDraw);			//  clearing Red sector !
            clearPreviousSector(this.listOfRectsToDraw1);           //  clearing Green sector !
            
            this.hexClicked = hex_round(pixel_to_hex(flat, { x: options.e.clientX, y: options.e.clientY }));        // addon

            if (options.e.which === 1) {						// move obj
                console.log('click with mySel')
                if (isClickedInNearHex(this.mySel.ownHex, this.hexClicked )) {      //options.e, 
                    console.log('clicked in NearHex')
                    if (isClickedInCoverArc(this.mySel.orientation, this.mySel.ownHex, this.hexClicked)) {  //options.e, 

                        this.mySel.ownHex = this.hexClicked ;
                        center = center_of_hex(flat, this.mySel.ownHex);
                        //initializingVariablesToDrawCoverArc(this.mySel, options.e, this.mySel.ownHex);
                        //console.log(this.mySel.parentCounterObj.ID)
                        socket.emit("moveTo",[this.mySel.parentCounterObj.ID,this.hexClicked])    //  which counter was clicked (identi b ID ) ,   clicked hex ,  

                        this.mySel.animate({ left: center.x, top: center.y }, { //futureLeft
                            onChange: canvas.requestRenderAll.bind(canvas),
                            duration: 500
                        });
                        clearHighlightDraw(this, this.mySel.orientation, 3, this.mySel.ownHex, 'red');
                    }
                };
            }
            if (options.e.which === 3) {					// rotate it
                var newSector = creatingNewSectorToDrawOnMouseMove(options.e, this.mySel)
                if (newSector - this.mySel.orientation === 1 || newSector - this.mySel.orientation === -5) { // clicked one sector below
                    this.mySel.orientation = newSector;
                    socket.emit("turnTo",[this.mySel.parentCounterObj.ID,'+=60'])
                    clearHighlightDraw(this, this.mySel.orientation, 3, this.mySel.ownHex, 'red');

                    this.mySel.animate('angle', '+=60', {
                        onChange: canvas.renderAll.bind(canvas)
                    });
                }
                if (newSector - this.mySel.orientation === -1 || newSector - this.mySel.orientation === 5) { // one sector above
                    this.mySel.orientation = newSector;
                    socket.emit("turnTo",[this.mySel.parentCounterObj.ID,'-=60'])
                    clearHighlightDraw(this, this.mySel.orientation, 3, this.mySel.ownHex, 'red');

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
        if (newSector != sector) {

            sector = newSector;
            console.log(sector)
            clearPreviousSector(this.listOfRectsToDraw1);
            this.listOfRectsToDraw1 = highlightSector(sector, 3, this.mySel.ownHex, null, this.listOfRectsToDraw1);
            //drawSector(this.listOfRectsToDraw1);
        }
    }
};

Client.prototype.processEnteringClicks = function (data) {      ////[this.selectedCounter.ID,this.hexClicked]
    //console.log(data)
    var oppsSelectedCounter = allCounters[data[0]];
    var center = center_of_hex (flat,data[1]);
    oppsSelectedCounter.img.animate({ left: center.x, top: center.y }, { //futureLeft
        onChange: canvas.requestRenderAll.bind(canvas),
        duration: 500
    });
};
Client.prototype.processEnteringTurns = function (data) { 
    var oppsSelectedCounter = allCounters[data[0]];
    var d = data[1] ;                                   // [newSector,'-=60']
    oppsSelectedCounter.img.animate('angle', d[1], {
        onChange: canvas.renderAll.bind(canvas)
    });
};

Client.prototype.drawAll = function (data) {

};
