class Counter {
    constructor(src, name, startinTop, startinLeft, orientation, radiusView) {
        this.name = name;
        //this.owner = 
        self = this;

        this.image = fabric.Image.fromURL(src, function (img) {
            console.log(' image loaded !');

            img.set({
                left: self.startinLeft,
                top: self.startinTop,
                originX: 'center',
                originY: 'center'
            });
            img.orientation = self.orientation;
            img.center = Point(img.width, img.height);
            img.ownHex = null;

            canvas.add(img)
        });
        this.orientation = orientation;
        this.startinTop = startinTop;
        this.startinLeft = startinLeft;
        this.radiusView = radiusView
    }
    //getOrientation (self) { return self.orientation }  // do not need it yet
    //fireMA() { console.log('fire') }
};

module.exports = Counter