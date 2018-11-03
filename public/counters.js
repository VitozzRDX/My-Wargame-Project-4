//import * as hexFunctions from './HexFunctions.js'


class Counter {
    constructor(src, name,orientation, radiusView,ownHex,ID,flat) {	
        this.src = src;
        this.name = name;
        this.ownHex = ownHex;
        //this.owner = none
        this.orientation = orientation;
        this.radiusView = radiusView;
        this.center = undefined;
        //this.ID = (Math.random() + 1).toString(36).slice(2, 18);
        this.ID = ID;
        this.flat = flat;
        //this.canvas = canvas;
    }
};

// Counter.prototype.drawImage = function () {

//     self = this;
//     this.center = hexFunctions.hex_to_pixel (this.flat,this.ownHex)
//     fabric.Image.fromURL(self.src, function (img) {
//         img.set({
//             left: this.center.x,
//             top: this.center.y,
//             originX: 'center',
//             originY: 'center'
//         });
//         img.orientation = this.orientation;
//         img.center = hexFunctions.Point(img.width, img.height);
//         img.ownHex = this.ownHex;
//         img.parentCounterObj = this         // good ! now we can remove all img. and get them by img.parentCounterObj
//         this.img = img
//         canvas.add(img)
//     }.bind(this));
// };

Counter.prototype.setOwner = function (owner) {
    this.owner = owner
};

export {Counter};