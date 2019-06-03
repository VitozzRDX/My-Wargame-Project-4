
class Canv {
    constructor() {
        this.canvas = new window.fabric.CanvasEx('canvas');
        this.canvas.skipOffscreen = false;                  // to see offscreened Counter
        this.canvas.hoverCursor = 'pointer';

        this.canvas2 = new window.fabric.CanvasEx('canvas2');

        this.setResizeListener()
        this.setZoomListener()

        this.rondelPicture = undefined;         // reference for rotate rondel on end Phase
        this.startingSidePicture = undefined;   // reference for set flipping Axis-Nazi to other side on end Turn
        this.stop = false;                      // flag for stop animating
        this.anchor = undefined;               // anchor to set coords on change flat

        this.backgroundImagesArray = [];
        this.countersImagesArray = [];
        this.menuImagesArray = [];

        this.listOfRectsToDraw = [];            // add here green and red hex rectangles
        this.listOfFiringBorder = [];
        this.allImagesAndRectsToSlide = [];
        this.listOfRedHexes = [];   // to remove it on PreptoFire
    };

    setResizeListener() {
        let self = this;
        window.addEventListener('resize', () => {
            self.canvas.setHeight(window.innerHeight);
            self.canvas.setWidth(window.innerWidth);
            self.canvas.renderAll();
        }, false);
    };

    setOffMouseClickListener(callback) {
        this.canvas.off(
            'mouse:down', callback
        )
    };

    setMouseClickListener(callback) {
        this.canvas.on({
            'mouse:down': callback
        })
    };

    _setBackgrndImgCoordsBeforeSliding() {
        let x = this.backgroundImage.left;
        let y = this.backgroundImage.top;
        this.anchor = { x: x, y: y }

    };

    _getBackgrndImgCoordsBeforeSliding() {
        return this.anchor
    }

    _getBackgrndImgCoordsAfterSliding() {
        return { x: this.backgroundImage.left, y: this.backgroundImage.top }
    }


    animateSliding(ops) {
        console.log('calling animateSliding')
        let l = this.countersImagesArray.concat(this.backgroundImagesArray).concat(this.listOfRectsToDraw).concat(this.listOfFiringBorder);
        this.stop = true;
        let self = this;
        for (let i of l) {
            i.animate(ops.where, ops.how, {                                 // ops.where, ops.how,options
                onChange: self.canvas.requestRenderAll.bind(self.canvas),       // options.onChange == self.canv.requestRenderAll.bind(self.canv)
                duration: 2500,
                abort: function () {

                    return !self.stop
                }
            })
        }
    };

    drawbackgroundImage(src, where, cb) {
        self = this
        window.fabric.Image.fromURL(src, (img) => {
            cb(img);
            img.set(where)
            img.selectable = false;
            self.canvas.add(img);
            self.canvas.sendToBack(img);
            self.backgroundImagesArray.push(img)
            self.backgroundImage = img

        })
    };

    drawCounterImage(counter) {
        self = this
        window.fabric.Image.fromURL(counter.src, (img) => {

            img.set(counter.options)
            img.orientation = counter.VCAorientation;
            img.ownHex = counter.ownHex;
            img.parentCounterObj = counter
            counter.img = img;

            self.canvas.add(img);
            self.countersImagesArray.push(img)
        })
    };
//--------------------------------------------------------------------------------------------------
    drawWreck(where,src) {
        self = this
        window.fabric.Image.fromURL(src, (img) => {
            img.set({
                originX: 'center',
                originY: 'center',
                top: where.top,
                left: where.left,
                selectable: false,
                evented: false
            })
            self.canvas.add(img);
        })
    }
//--------------------------------------------------------------------------------------------------
    drawRondelImage(...srcArgs) {                // src,startingSidePictureSrc
        var self = this;
        for (let i of srcArgs) {
            window.fabric.Image.fromURL(i, (img) => {
                img.set({
                    originX: 'center',
                    originY: 'center',
                    top: self.canvas2.height / 9,
                    left: self.canvas2.width / 2,
                    selectable: false,
                    opacity: 0.5,
                    evented: false
                })
                if (srcArgs.indexOf(i) === 1) {
                    self.startingSidePicture = img
                } else {
                    self.rondelPicture = img
                }
                self.canvas2.add(img);
            })
        }
    };

    setZoomListener() {
        var self = this;
        this.canvas.on('mouse:wheel', function (opt) {
            var delta = opt.e.deltaY;
            var zoom = self.canvas.getZoom();
            zoom = zoom + delta / 200;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            self.canvas.setZoom(zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();

        })
    };

    getRondelPicture() {
        return this.rondelPicture
    };

    animateRondelRotation(angle, img, callback) {
        let self = this;
        let ops = {                                                                // add-on
            onChange: this.canvas2.requestRenderAll.bind(this.canvas2),
            duration: 500,
        };
        let c = {
            onComplete: () => {

                self.canvas2.on('mouse:down', function (options) { callback(options) }); //callback.apply(obj,options)
            }
        };
        if (callback) {
            Object.assign(ops, c)
        };
        img.animate('angle', angle, ops);
    };

    clearlistOfRectsToDraw() {
        for (let i in this.listOfRectsToDraw) {
            this.canvas.remove(this.listOfRectsToDraw[i])
        };
        this.listOfRectsToDraw = [];
    }

    drawPoly(sixCoords, color, callback, hex) {
        var rect = new fabric.Polygon(sixCoords, {
            stroke: 'green',
            opacity: 0.3,
            fill: color,
            selectable: false,
            evented: false
        });
        if (color === 'red') {
            rect.set({ evented: true })
            rect.on('mousedown', () => { callback(hex) })
            this.listOfRedHexes.push(rect)
        }
        this.canvas.add(rect);
        this.listOfRectsToDraw.push(rect)
    }

    animateMoving(where, img, callback) {                       // weshould createa animateEnteringMoving

        let self = this;
        let ops = {                                                                // add-on
            onChange: this.canvas.requestRenderAll.bind(this.canvas),
            duration: 500,
        };
        let c = {
            onComplete: () => {
                self.canvas.on('mouse:down', function (options) { callback(options) }); //callback.apply(obj,options)
            }
        };
        if (callback) {
            Object.assign(ops, c)
        };
        img.animate(where, ops);
    };
    // d fire addon -----------------------------------------------------------------------------------------
    drawFiringBorder(ops) {
        console.log('drawFiringBorder called')
        let center = ops.center
        let size = ops.size
        var rect = new fabric.Rect({
            left: center.x,
            top: center.y,

            originX: 'center',
            originY: 'center',
            width: size,
            height: size,
            stroke: 'red',
            strokeWidth: 4,
            fill: '',
            selectable: false,
        });
        this.canvas.add(rect);
        this.listOfFiringBorder.push(rect)
    }

    setAllImagesAndRectsToSlide() {
        this.allImagesAndRectsToSlide = this.countersImagesArray.concat(this.backgroundImagesArray).concat(this.listOfRectsToDraw).concat(this.listOfFiringBorder);
    }

    // drawImage(src,top,left) {
    //     self = this
    //     window.fabric.Image.fromURL(src, (img) => {

    //         img.set({top : top,left:left })
 
    //         self.canvas.add(img);
 
    //     })
    // };
    //---------------------------------------------------------------------------------------------------------

    clearRedHexes() {
        for (let i of this.listOfRedHexes) {
            this.canvas.remove(i)
        }
        this.listOfRedHexes = []
    }

    clearFiringBorders() {
        for (let i of this.listOfFiringBorder) {
            this.canvas.remove(i)
        }
        this.listOfFiringBorder = []
    }
    //---------------------------------------------------------------------------------------------------------
    drawLine (arr) {
        let line = new fabric.Line(arr, {
            stroke: 'red',
            selectable: false 
        })

        this.canvas.add(line)
    }

    drawCircle (center) {
        this.canvas.add(	new fabric.Circle({
            left:center.x,
            top:center.y,
            radius:3,
            stroke:'red',
            strokeWidth:1,
            fill:'',
            selectable: false ,
        }))
    }

    //---------------------------------------------------------------------------------------------------------

    createAndDrawFiringBorder_CounterGroup(img,text) {

        
        var rect = new fabric.Rect({
            left: img.left,
            top: img.top,

            originX: 'center',
            originY: 'center',
            width: img.width + 2,
            height: img.width + 2,
            stroke: 'red',
            strokeWidth: 4,
            fill: '',
            selectable: false,
            evented : false
        });

        var textbox = new fabric.Textbox(text, {
			left: img.left - img.width/2 - 12,
			top: img.top + img.width/2,
			fill: '#880E4F',
			strokeWidth: 0.1,
			stroke: "#D81B60",
			angle : -90,
			fontSize: 9,
			backgroundColor: 'white',
			selectable: false,
			evented : false
        });
        
        let g = new fabric.Group([rect,textbox,img],{
			// selectable: false,
			// evented : false
        })
        
        this.canvas.add(g);
        g.img = img;
        g.parentCounterObj = img.parentCounterObj
        return g
    }

    drawText(text,where) {
        var textbox = new fabric.Textbox(text, {
            
			fill: '#880E4F',
			strokeWidth: 0.1,
			stroke: "#D81B60",

			fontSize: 12,
			backgroundColor: 'white',
			selectable: false,
			evented : false
        })
        textbox.set(where)
        this.canvas.add(textbox)
    }

    //--------------------------------------------------------------------

    renewCounterImg(img,newImgSrc) {
        img.setSrc(newImgSrc,()=>{
            this.canvas.renderAll()
        })
    }
};


export { Canv }