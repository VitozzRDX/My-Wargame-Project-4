
import { Canv } from './canv.js'
import { Map } from './map.js'
import { table } from './counters.js'
import { Interface } from './ui.js'
import { Game } from './game.js'

const countersClassesTable = table;

let checkWhoseCounter = function (owner, mySide) {
    return owner == mySide
};

let diceRoll = function () {
    return Math.floor(Math.random() * 6) + 1;
};

class Client {
    constructor() {
        this.allPhases_CallbacksHash = {
            'firstPlayerRallyPhase': this.firstPlayerRallyPhase.bind(this),
            'firstPlayerPrepFirePhaseCallback': this.firstPlayerPrepFirePhaseCallback.bind(this),

            'secondPlayerRallyPhase': this.secondPlayerRallyPhase.bind(this),
            'secondPlayerPrepFirePhaseCallback': this.secondPlayerPrepFirePhaseCallback.bind(this),
            // d fire addon -----------------------------------------------------------------------------------------
            'MMCfireMicroPhase': this.MMCfireMicroPhase.bind(this),
            'VehfireMicroPhase': this.VehfireMicroPhase.bind(this),
            'MMCChooseBetweenSeparateAttackAndSmallerFGMicroPhase': this.MMCChooseBetweenSeparateAttackAndSmallerFGMicroPhase.bind(this)
            //---------------------------------------------------------------------------------------------------------

        };
        this.canvasObj = new Canv();
        this.map = new Map();
        this.interface = new Interface();
        this.game = new Game()

        this.mySel = undefined
        this.mySide = undefined
        this.firingGroup = [];
        this.markedFired = [];

        this.currentCounterInterface = [];

        this.interfaceScheme = {
            'End Rally': {
                'callback': this.endRallyCallback.bind(this),
                'class': 'endRally',
                'name': 'End Rally'
            },
            'End Phase': {

                'class': 'endPhase',
                'name': 'End Phase'
            },
            'Rally': {
                'enabledPhases': ['firstPlayerRallyPhase', 'secondPlayerRallyPhase', 'firstPlayerPrepFirePhaseCallback'],
                'callback': this.rallyCallback.bind(this),
                'class': 'Rally',
                'name': 'Rally'
            },
            'MC Prepare to Fire!': {
                'enabledPhases': ['firstPlayerPrepFirePhaseCallback'],
                'callback': this.prepareToManCountersFireCallback.bind(this),
                'class': 'PrepareToFire',
                'name': 'MC Prepare to Fire!',
            },
            'Veh Prepare to Fire!': {
                'enabledPhases': ['firstPlayerPrepFirePhaseCallback'],
                'callback': this.prepareToVehicleFireCallback.bind(this),
                'class': 'PrepareToFire',
                'name': 'Veh Prepare to Fire!',
            },
            'Cancel Fire Preparation': {
                'callback': this.CancelFirePreparation.bind(this),
                'class': 'CancelFirePreparation',
                'name': 'Cancel Fire Preparation',
            },
            'Still Fire as Separate Groups': {
                'callback': this.StillFireasSeparateGroups.bind(this),
                'class': 'StillFireasSeparateGroups',
                'name': 'Still Fire as Separate Groups'
            },
            'Fire From Every Hex': {
                'callback': this.FireFromEveryHex.bind(this),
                'class': 'FireFromEveryHex',
                'name': 'Fire From Every Hex'
            },

        };

        this.squadType_propertiesHash = {               // refactor we should get table from server with squadTypes only for Scenario
            'ruSquadE-0' :{                             // refactor to array ?
                normalRange :6 ,
                firePower :2,
                morale:8,
                assaultFire : true,
                halfSquad :'ruHalfSquadE-0',
                src : 'assets/ru628S.gif',
                experienceDrop : false,
                otherSideSrc : 'assets/ruh7b.gif',
                className :'ManCounters',
            },
            'ruHalfSquadE-0' : {
                normalRange :3 ,
                firePower :2,
                morale:8,
                assaultFire : false,
                halfSquad :false,
                src : 'assets/ru328H.gif',
                experienceDrop : false,
                otherSideSrc : 'assets/ruh7b.gif' ,
                className :'ManCounters',
            },
            'geSquadE-0' : {
                normalRange :8 ,
                firePower :3,
                morale:8,
                assaultFire : true,
                halfSquad :'geHalfSquadE-0',
                src : 'assets/ge467S.gif',
                experienceDrop : false,
                otherSideSrc : 'assets/geh7b.gif' ,
                className :'ManCounters',
            },
            'geHalfSquadE-0' : {
                normalRange :3 ,
                firePower :3,
                morale:8,
                assaultFire : false,
                halfSquad :false,
                src : 'assets/ge338H.gif',
                experienceDrop : false,
                otherSideSrc : 'assets/geh7b.gif' ,
                className :'ManCounters',
            },
            'panzer3' : {
                radiusView : 4,
                wreckSide :'assets/pziiidb.gif',
                className :'AFV',
                src: 'assets/pziiif.gif',
            },
            'IS2' : {
                radiusView : 4,
                wreckSide :'assets/IS2b.gif',
                className :'AFV',
                src: 'assets/IS2.gif',
            },
        }

    }

    init(scenario, mySide, setOfOptionsforCounters) {

        this.mySide = mySide
        
        let myStartingPhase;
        let CallbackForCanvas_CurrentPhase;

        if (mySide === scenario.startingSide) {
            myStartingPhase = scenario.firstPlayerStartingPhase
        } else {
            myStartingPhase = scenario.secondPlayerStartingPhase
        };

        this.game.setGamePhase(myStartingPhase);
        CallbackForCanvas_CurrentPhase = this.allPhases_CallbacksHash[myStartingPhase]
        this._setPhase(CallbackForCanvas_CurrentPhase);

        this._createCounters(setOfOptionsforCounters)

        this.drawBackground(scenario.background)
        this.drawCounters(countersClassesTable.allCounters)
        this.drawRondelImage('assets/turnphase.gif', scenario.startingSidePictureSrc)
        this.buildMenuInterface()

        this._setCurrentMenuInterface()

        //this.drawObstacles()



    };

    getMySide() {
        return this.mySide
    }

    _setPhase(callback) {
        this.canvasObj.setOffMouseClickListener();
        this.canvasObj.setMouseClickListener(callback)
    };

    firstPlayerRallyPhase(options) {
        console.log('Its a FPRP')

        if (options.e.which === 1 && options.target.selectable && checkWhoseCounter(options.target.parentCounterObj.owner, this.mySide)) {

            this.mySel = options.target

            this.clearCounterInterface()
            this.buildCounterInterface()
            this._setCurrentCounterInterface()

        }
    };

    secondPlayerRallyPhase() {
        console.log('Its a SPRP')
    };

    drawBackground(backgroundArray) {
        for (let i of backgroundArray) {        //  i - { src :'assets/bdv.gif', coords : [0,0] }, coords = {top:0,left:0}
            let src = i.src;
            let where = i.coords;
            this.canvasObj.drawbackgroundImage(src, where, (img) => {
                where.top = where.top * img.height - img.height + 33;
            })
        }
    };

    drawCounters(countersArray) {
        for (let i of countersArray) {
            //let center = this.map.getCenterOfHex(i.ownHex);

            let center = this.map.getCenterOfHexForMoving(i.ownHex);

            this.map.fillHex(i.ownHex);
            //-----------------------------------------------------------------------------------------
            this.map.fillHex_CountersArrayHash(i.ownHex, i)
            //-----------------------------------------------------------------------------------------
            Object.assign(i.options, { left: center.x, top: center.y })
            this.canvasObj.drawCounterImage(i)


        }
    };

    _createCounters(setOfOptionsforCounters) {

        for (let i of setOfOptionsforCounters) {    // i =  { src: 'assets/ru628S.gif', name: 'ruMMC', ownHex:,owner}

            //let className = countersClassesTable[i.class];
//-------------------------------------------------------------------
            let type  = i.type
            let ops = this.squadType_propertiesHash[type]

            let className = countersClassesTable[ops.className]

            let param = Object.assign(ops,i)

            let counter = new className(param)

            // if (i.squadType) {

            //     let squadType = i.squadType     // 'ruSquadE-0'

            //     let ops = this.squadType_propertiesHash[squadType]

            //     Object.assign(counter,ops)
            // }

//------------------------------------------------------------------
            //new className(i)

        }
    };

    processKeyDown(options) {
        if (options.repeat) {
            return;
        }
        if (options.keyCode == 87) {                                    // refactor to case switch + change animateSliding(if o !== undef)
            this.canvasObj._setBackgrndImgCoordsBeforeSliding();
            let o = { where: 'top', how: '-=1000' };
            this.canvasObj.animateSliding(o)
        }
        if (options.keyCode == 65) {
            this.canvasObj._setBackgrndImgCoordsBeforeSliding();
            let o = { where: 'left', how: '-=1000' };
            this.canvasObj.animateSliding(o)
        }
        if (options.keyCode == 68) {
            this.canvasObj._setBackgrndImgCoordsBeforeSliding();
            let o = { where: 'left', how: '+=1000' };
            this.canvasObj.animateSliding(o)
        }
        if (options.keyCode == 83) {
            this.canvasObj._setBackgrndImgCoordsBeforeSliding();
            let o = { where: 'top', how: '+=1000' };
            this.canvasObj.animateSliding(o)
        }
    };

    processKeyUp(options) {
        if (options.keyCode == 87 || options.keyCode == 68 || options.keyCode == 83 || options.keyCode == 65) {
            this.canvasObj.stop = false;
            let newBackgroundImageCoords = this.canvasObj._getBackgrndImgCoordsAfterSliding();
            let oldBackgroundImageCoords = this.canvasObj._getBackgrndImgCoordsBeforeSliding();
            this.map.changeFlatOriginOnScreenMoving(newBackgroundImageCoords, oldBackgroundImageCoords)
        }
    };

    drawRondelImage(src, src2) {
        this.canvasObj.drawRondelImage(src, src2)
    };


    rallyCallback() {
        console.log('rally')
        // this.setCounterInterfaceScheme('Rally','disabled');

        // this.setCounterInterfaceScheme('Break','enabled');
    };

    _rotateTurnRondel(cb) {                                   // cb we can call at the end of rotation and it should also got turnin on canvas plus buttons
        let rondel = this.canvasObj.getRondelPicture()
        this.canvasObj.animateRondelRotation('-=45', rondel, cb)
    };

    firstPlayerPrepFirePhaseCallback(options) {

        if (options.e.which === 1 && options.target.selectable && checkWhoseCounter(options.target.parentCounterObj.owner, this.mySide)) {

            this.mySel = options.target
            //console.log('mySel',this.mySel)

            this.clearCalcAndDraw()   //this._move.bind(this) callback is optional . If it is here , than we need it on click on red hexes

            //console.log('calling clearBuildSetCUI() on click in firstPlayerPrepFirePhase')
            this.clearBuildSetCUI()
            //console.log('end')
            //console.log('')

        }
    };

    secondPlayerPrepFirePhaseCallback() {
        console.log('SPPFP')
    };

    endPhaseCallback() {

        this.socket.emit('endPhase');

        this.endPhase()

    };

    clearCalcAndDraw(cb) {

        let objRectsOfTCAAndVCA = this.mySel.parentCounterObj.getCoverArc();
        this.canvasObj.clearlistOfRectsToDraw()

        for (let color in objRectsOfTCAAndVCA) {
            for (let hex of objRectsOfTCAAndVCA[color]) {
                let polyCorners = this.map.getPolyCorners(hex)
                this.canvasObj.drawPoly(polyCorners, color, cb, hex)
            }
        }
    };


    endRallyCallback(button) {

        this.socket.emit('endRally');

        if (this.game.rallyPhaseStatus === 'ended') {

            // turn on the endRally button
            this.game.changeMenuInterface('End Rally', true)

            this.endPhase()

            this.game.rallyPhaseStatus = undefined;

        } else {

            this.game.rallyPhaseStatus = 'ended'

            // turn off the endRally button
            button.disabled = true

            this.game.changeMenuInterface('End Rally', false)


        }
    };

    endPhase() {

        this.game.switchToNextPhase();
        let phase = this.game.getPhase();

        if (phase) {         // Not Last ?
            this._setPhase(this.allPhases_CallbacksHash[phase])
        }

        this._rotateTurnRondel();

        this.clearMenuInterface();
        this.buildMenuInterface()
        this._setCurrentMenuInterface()

        // if we got chosen Counter , let's rebuild its interface :
        if (this.mySel) {

            this.clearCounterInterface()
            this.buildCounterInterface()
            this._setCurrentCounterInterface()

        }

    };

    _setCurrentMenuInterface() {
        this.currentMenuInterface = this.game.getMenuShemeByPhase()
    }


    _setCurrentCounterInterface() {
        this.currentCounterInterface = this.mySel.parentCounterObj.getCurrentInterface()
    }

    buildCounterInterface() {

        let selection = this.mySel.parentCounterObj

        let scheme = selection.getCurrentInterface()

        for (let name in scheme) {

            let status1 = scheme[name];

            let status2 = this._checkIfButtonIsEnabledInThisPhase(name)

            let result = status1 && status2

            this.interface.buildButton(this.interfaceScheme[name], result)

        }
    };

    clearMenuInterface() {

        for (let name in this.currentMenuInterface) {

            this.interface.remove(name)
        }
    };

    clearCounterInterface() {
        //console.log('.. clearing interface')

        let currentCounterInterface = this.currentCounterInterface
        //console.log('currentCounterInterface :', currentCounterInterface)

        for (let name in currentCounterInterface) {
            //console.log('removing :',name)
            this.interface.remove(name)
        }
        //console.log('..end clearing CUI')
    }

    _checkIfButtonIsEnabledInThisPhase(name) {

        let phase = this.game.getPhase()

        let arr = this.interfaceScheme[name]['enabledPhases']

        if (arr.indexOf(phase) != -1) {
            return true
        }

        return false
    }

    _move(hex) {
        // get hex type from table[hex]
        // if (_checkIfMoveIsPossible ())
        // get image img = this.mySel
        // get center = this.map.
        // this.canvasObj.animateMoving(center,img)
        // see E8 Phases New Interface (e) AddingAllBtn
    };

    _checkIfMoveIsPossible() {
        // return selection.checkIfMPLeft()
    }

    clearBuildSetCUI() {

        this.clearCounterInterface()
        this.buildCounterInterface()
        this._setCurrentCounterInterface()
    }


    buildMenuInterface() {
        //console.log('building MUI')
        let scheme = this.game.getMenuShemeByPhase()
        //console.log('scheme', scheme)
        for (let name in scheme) {

            let result = scheme[name];
            this.interface.buildButton(this.interfaceScheme[name], result)
        }
    }
    // d fire addon -----------------------------------------------------------------------------------------

    _settingFireGroup(phase) {
        this.firingGroup.push(this.mySel.parentCounterObj);

        let cb = this.allPhases_CallbacksHash[phase]

        this._setPhase(cb)
        this.game.switchPhase(phase)

        this.canvasObj.clearRedHexes()

        let selection = this.mySel.parentCounterObj
        let previousPhase = this.game.getPreviousPhase()
        let textForFiringBorder = selection.getTextForFiringBorder(previousPhase)

        let group = this.canvasObj.createAndDrawFiringBorder_CounterGroup(this.mySel, textForFiringBorder)

        selection.group = group
        //console.log('bringToFront inside _settingFireGroup')
        group.bringToFront()
        this.clearCounterInterface()
        //console.log('end')
        //this.clearBuildSetCUI() 

        this.clearBuildSetMUI()

    }
    prepareToManCountersFireCallback() {   // prepareToFireCallback

        this._settingFireGroup('MMCfireMicroPhase')
    };

    prepareToVehicleFireCallback() {

        this._settingFireGroup('VehfireMicroPhase')
    }

    VehfireMicroPhase(options) {

    }

    MMCfireMicroPhase(options) {

        console.log('Its a MMCfireMicroPhase')
        console.log('')
        console.log('choose Target Hex to Fire, or nearest Counter to form Fire Group')
        //console.log(options)

        if (options.e.which === 1 && options.target.selectable && checkWhoseCounter(options.target.parentCounterObj.owner, this.mySide)) {

            let selection = options.target.parentCounterObj

            if (this.firingGroup.indexOf(selection) == -1 && this.checkIfCounterIsNear(options.target.ownHex)) {

                if (this.firingGroup.indexOf(selection) != -1) {
                    //console.log('bringToFront inside if this.firingGroup.indexOf(selection) != -1')
                    selection.group.bringToFront()
                }

                if (selection instanceof countersClassesTable['SingleManCounters']) {

                    let numberOfCounters = this.map.getnumberOfCountersIn(selection.ownHex)

                    if (numberOfCounters === 1) {
                        return
                    }
                }

                let previousPhase = this.game.getPreviousPhase()
                let textForFiringBorder = selection.getTextForFiringBorder(previousPhase)

                let group = this.canvasObj.createAndDrawFiringBorder_CounterGroup(options.target, textForFiringBorder)
                //this.canvasObj.drawFiringBorder(ops)
                selection.group = group
                this.firingGroup.push(selection)
                //console.log('bringToFront inside  if (this.firingGroup.indexOf(selection) == -1 && this.checkIfCounterIsNear(options.target.ownHex)) ')
                group.bringToFront()
            }


        };

        //LoS---------------------------------------------------------------------------------------------------------
        if (options.e.which === 1) {

            //let target = options.target.parentCounterObj
            console.log('')
            console.log('click coords:', { x: options.e.x, y: options.e.y })
            let pointer = this.canvasObj.canvas.getPointer(options.e);
            console.log('pointer :', pointer)

            let targetHex = this.map.getHexFromCoords({ x: pointer.x + 2, y: pointer.y + 2 });
            console.log('targetHex :', targetHex)

            let hex_countersArrayHash = this.firingGroup.reduce((acc, n, i) => {  // {{q,r,s} : [c1,c2..]
                let ownHex = JSON.stringify(n.ownHex)
                if (!acc[ownHex]) {
                    let a = [];
                    a.push(n)
                    acc[ownHex] = a;
                } else {
                    acc[ownHex].push(n)
                }
                return acc
            }, {})

            let arrHexes = Object.keys(hex_countersArrayHash)
            // ------------------------------------------------------------------------------------
            let hex_LeadershipDRMHash = arrHexes.reduce((acc, hex) => {
                for (let c of hex_countersArrayHash[hex]) {
                    if (c instanceof countersClassesTable['SingleManCounters']) {
                        if (acc[hex] == undefined) {
                            acc[hex] = c.LeadershipDRM
                        } else {
                            let currentLDRM = acc[hex]
                            let newLDRM = c.LeadershipDRM
                            acc[hex] = Math.min(currentLDRM, newLDRM)
                        }
                    }
                }
                if (acc[hex] == undefined) {
                    acc[hex] = null
                }
                return acc
            }, {})

            let hex_boolHash = {}
            let hex_TEMHash = {};

            let obstaclePoint;
            let noLoS;

            arrHexes.forEach((hex) => {           // --- checking LoS, filling hex_boolHash and hex_TEMHash // refactor to [hex_boolHash,hex_boolHash] = {...}

                let result = this.map.checkLoS(targetHex, JSON.parse(hex))

                if (result.los) {                                     // loS is 

                    hex_boolHash[hex] = true;
                    hex_TEMHash[hex] = result.tem;


                } else {
                    hex_boolHash[hex] = false

                    noLoS = true

                }                                                   // no Los
            })

            //console.log('hex_TEMHash after filling',hex_TEMHash)
            if (!noLoS) {

                let arrayWithSeparateFGs = [];

                let temporaryArray = Object.keys(hex_boolHash).reduce((acc, hex) => {
                    acc = acc.concat(hex_countersArrayHash[hex])
                    return acc
                }, [])

                arrayWithSeparateFGs.push(temporaryArray);

                this._fire(arrayWithSeparateFGs, targetHex, hex_TEMHash, hex_LeadershipDRMHash)
            }

            if (noLoS) {
                // here arrayWithSeparateFGs will be different of players choise
                // first go to MMCChooseBetweenSeparateAttackAndSmallerFGMicroPhase to not let selecting anything
                //then build MUI
                let cb = this.allPhases_CallbacksHash['MMCChooseBetweenSeparateAttackAndSmallerFGMicroPhase']
                this._setPhase(cb)

                let temporaryArray = [];
                let arrayWithSeparateFGs = Object.keys(hex_boolHash).reduce((acc, hex, n) => {        // will be [[c,c,c],[c]]

                    if (hex_boolHash[hex]) {
                        temporaryArray = temporaryArray.concat(hex_countersArrayHash[hex])
                    } else {

                        if (temporaryArray.length > 0) {
                            acc.push(temporaryArray);
                        }
                        temporaryArray = [];
                    }
                    if (n + 1 == Object.keys(hex_boolHash).length && temporaryArray.length > 0) {

                        acc.push(temporaryArray);
                    }
                    return acc
                }, [])

                let obj = {
                    'arrayWithSeparateFGs': arrayWithSeparateFGs,
                    'target': targetHex,
                    'hex_TEMHash': hex_TEMHash,
                    'hex_LeadershipDRMHash': hex_LeadershipDRMHash
                }
                //------------------- do all firing units are in one hex ?----------------------
                if (arrHexes.length > 1) {
                    this.clearCounterInterface()
                    this.clearMenuInterface()

                    this.interface.buildButton(this.interfaceScheme['Still Fire as Separate Groups'], true, obj)
                    this.interface.buildButton(this.interfaceScheme['Fire From Every Hex'], true, obj)
                } else {

                }
            }
        }

    };

    FireFromEveryHex(button, obj) {
        console.log('FireFromEveryHex')

        this.clearAllUI()
        this._fire(obj.arrayWithSeparateFGs)
    }
    StillFireasSeparateGroups(button, obj) {
        console.log('StillFireasSeparateGroups')

        this.clearAllUI()
        this._fire(obj.arrayWithSeparateFGs)
    }

    MMCChooseBetweenSeparateAttackAndSmallerFGMicroPhase() { // only to turn off all reaction  !
        console.log('Its a MMCChooseBetweenSeparateAttackAndSmallerFGMicroPhase')
        console.log('please choose preferable FG forming way ')


    }

    clearAllUI() {
        //console.log('call clearAllUI')
        this.interface.clearAllUI()
    }
    //----------------------------------------------------------------------------------------------------------
    _fire(arrayWithSeparateFGs, targetHex, hex_TEMHash, hex_LeadershipDRMHash) {        // rename it to Infantry Fire ?
        // console.log('')
        // console.log('fire !')
        // console.log('arrayWithSeparateFGs,target,hex_TEMHash,hex_LeadershipDRMHash :')
        // console.log(arrayWithSeparateFGs,target,hex_TEMHash,hex_LeadershipDRMHash)
        arrayWithSeparateFGs.forEach((groupArr) => {

            let leadershipModificator;
            let setOfHindranceHexes = new Set();

            let resultingFP = groupArr.reduce((acc, counter) => {               // get distance, calc FP for this dist, fill set with all unique hex 

                let distance = this.map.getHexesInLoS(targetHex, counter.ownHex)

                acc = acc + counter.calculateFirePower(distance)

                setOfHindranceHexes.add(counter.ownHex)

                return acc
            }, 0)

            let hindranceDRM = Array.from(setOfHindranceHexes).reduce((acc, hex) => {   // we must take Hind from every hex and add it

                acc = acc + hex_TEMHash[JSON.stringify(hex)]
                return acc

            }, 0)
            //---------------------- drawing text with hexes-----------------------------------------------------

            Array.from(setOfHindranceHexes).forEach((hex, i) => {
                let t = 'fired_from_'
                this.canvasObj.drawText(t + JSON.stringify(hex), { top: i + 50, left: window.innerWidth / 2 })

            })

            //------------------------- calculating Leadership DRM ------------------------------------------------- // refactor push it all to arrow func
            try {

                leadershipModificator = Object.keys(hex_LeadershipDRMHash).reduce((acc, hex) => {   // foreach hex founding minimal LDRM or null if theris hex without L

                    let drm = hex_LeadershipDRMHash[hex];

                    if (drm === null) {
                        throw 'found Hex without SMC !'
                        //acc = 0
                    }
                    if (acc == undefined) {
                        acc = drm
                    } else {
                        acc = Math.min(acc, drm)
                    }
                    return acc

                }, undefined)

            }
            catch (error) {
                //console.log(error)
                leadershipModificator = 0
            }
            //--------------------Let's Roll Dices ------------------------------------------------------------------

            let resultOfPureRoll = this.getResultRollingTwoDice() //   {'WhiteDice' : ,'RedDice' : ,'sum' :}

            let modifiedDicesRoll = resultOfPureRoll['sum'] + leadershipModificator + hindranceDRM

            //console.log([resultOfPureRoll['sum'],leadershipModificator,hindranceDRM])

            //-------------- Do resultOfPureRoll rolled double ? --------------------------------------------------------
            let coweringCoefficient = null
            if (resultOfPureRoll.WhiteDice == resultOfPureRoll.RedDice && leadershipModificator == 0) {      // refactor ! it can be LDRM ==0 but still got Leader

                if (inexperiencedMMC) {   //  change let inexperiencedMMC to true if one counter is. Check it somwhere
                    console.log('Double cowering !')
                    coweringCoefficient = -2
                }
                console.log('Cowering !')
                coweringCoefficient = -1
                //resultingFP
                groupArr.forEach((counter) => {
                    counter.cowers()
                })
            }
            //-------------------------------------------------------------------------------------------------------------
            resultingFP = this.game.getActualFirePower(resultingFP, coweringCoefficient)

            let effect = this.game.getIFTresult(modifiedDicesRoll, resultingFP)//infantryFireTable[modifiedDicesRoll][resultingFP] // resut is [3,'KIA']

            let t = 'effect_on_IFTable :'
            this.canvasObj.drawText(t + JSON.stringify(effect), { top: i + 50, left: window.innerWidth / 3 })

            //---------------------- let's use Effect on target hex -----------------------------------


            switch (effect[1]) {
                case 'KIA':

                    let num =  effect[0]
                    console.log('we got KIA result with num :', effect[0])

                    let arr = this.map.hex_CountersArrayHash[targetHex].slice();

                    // choose randomly targets from hex
                    let arrToKill = (() => {

                        // do numbers of killed is bigger then numbers of counters ?
                        if (arr.length < num) {
                            return arr
                        }

                        let res = []
                        for (let i = 0; i < num; i++) {
                            var item = arr[Math.floor(Math.random() * arr.length)];
                            arr.splice(arr.indexOf(item), 1)
                            res.push(item)
                        }
                        return res
                    })();

                    console.log('array with Counters, choosen to kill :',arrToKill)

                    // they are killed

                    arrToKill.forEach((counter)=>{
                        
                        counter.kill()
                        
                        if (counter instanceof countersClassesTable['AFV']) {
                           
                            this.canvasObj.drawWreck({ left: counter.options.left, top: counter.options.top },counter.wreckSide) // refactor to .flip
                        }

                        this.canvasObj.canvas.remove(counter.img)
                    })
                    // rest if broken - casualty reduction , else broken

                    console.log('survivers :', arr)

                    arr.forEach((counter)=>{
                        if (counter.getGameStatus() === 'broken') {

                            //counter.casualtyReduct()    //here we shuld set new img for counter - return its HS

                            let result =  counter.casualtyReduct()  // itis a  'ruHalfSquadE-0'

                            // do counter killed after Casuality Reduction ?

                            if (counter.getGameStatus() === 'KIA') {

                                this.canvasObj.canvas.remove(counter.img);

                                return
                            };

                            let newProps = this.squadType_propertiesHash[result]

                            Object.assign(counter,newProps)

                            this.canvasObj.renewCounterImg(counter.img,counter.otherSideSrc)

                        } else {

                            counter.setGameStatus('broken');

                            this.canvasObj.renewCounterImg(counter.img,counter.otherSideSrc)

                        }

                    })

                    // this.canvasObj.kill(counter) -- need killing picture дщщ
                    break;
                case 'K/':
                    console.log('we got K/ result with num :', effect[0])
                    break;

                case 'MC':
                    console.log('we got Moral Check result with num :', effect[0])
                    break;
                case 'PTC':
                    console.log('we got PTC result')
            }

            //let rollOnHit = 

            //this.game.

            //let targetHitEffect = target.hit(effect)    // refactor forEach target in this hex


        })
    }
    //----------------------------------------------------------------------------------------------------------
    // _creatingArrayWithFireGroupsArrays(hex_boolHash, hex_countersArrayHash, fg) {
    //     let result = [];
    //     let arr = []
    //     for (hex in hex_boolHash) {
    //         if (hex_boolHash[hex]) {
    //             arr.concat(hex_countersArrayHash[hex])
    //         } else {
    //             result.push(arr);
    //             arr = [];
    //         }
    //     }

    //     fg.reduce((acc, n) => {
    //         let h = n.ownHex
    //         if (hex_boolHash[h]) {

    //         }
    //     }, [])
    // }
    _calculateFirePower() {
        // inside ask if two group is possible
    }

    // formFireGroupsAfterCheckLoS(hex, fg) {

    //     let result = fg.reduce((acc, counter, i) => {
    //         if (this.checkLos(hex, counter.ownHex)) {
    //             let group = acc[acc.length - 1];
    //             if (!group || group.index !== i - 1) {
    //                 group = { data: [] };
    //                 acc.push(group);
    //             }

    //             group.index = i;
    //             group.data.push(counter);
    //         }

    //         return acc;
    //     }, []).map(n => n.data);

    //     console.log('resulting fg-s :', result)
    // }

    // _calculateFirePower(firingGroup, target) {
    //     let result = 0;
    //     firingGroup.forEach((counter) => {

    //         //let distance = this.map.hex_distance(counter.ownHex,target.ownHex)
    //         let fp = this.counter.calculateFirePower(distance)


    //         result = result + fp
    //     })
    //     return result
    // }

    checkIfCounterIsNear(hex) {
        if (JSON.stringify(hex) === JSON.stringify(this.mySel.ownHex)) {
            return true
        }
        let objRectsOfTCAAndVCA = this.mySel.parentCounterObj.getCoverArc();
        let redHexesarr = objRectsOfTCAAndVCA['red'];

        for (let i of redHexesarr) {
            if (JSON.stringify(i) === JSON.stringify(hex)) {
                return true
            }
        }
        return false
    };

    //---------------------------------------------------------------------------------------------------------

    CancelFirePreparation() {

        let previousPhase = this.game.getPreviousPhase()
        this._setPhase(this.allPhases_CallbacksHash[previousPhase])
        this.game.setGamePhase(previousPhase)

        this.firingGroup.forEach((counter) => {
            this.canvasObj.canvas.remove(counter.group)
            counter.group.destroy()
            counter.img.selectable = true;
            counter.img.evented = true
        })

        this.firingGroup = [];
        this.mySel = undefined; // refctor 

        this.canvasObj.clearFiringBorders()
        this.clearBuildSetMUI()

    }

    // returnSavedSelection() {
    //     return this.savedSelection
    // }

    // saveSelection() {
    //     this.savedSelection = this.mySel  
    // }

    clearBuildSetMUI() {

        this.clearMenuInterface();
        this.buildMenuInterface()
        this._setCurrentMenuInterface()
    }

    drawObstacles() {
        let hexTerrainTable = this.map.hexTerrainTable
        for (let hex in hexTerrainTable) {
            if (hexTerrainTable[hex].obstacleLines !== undefined) {
                let arrO = hexTerrainTable[hex].obstacleLines
                for (let a of arrO) {

                    let r = a.reduce((acc, el) => {
                        for (let i of Object.keys(el)) {
                            acc.push(el[i])
                        };
                        return acc
                    }, [])

                    //console.log('it should got [num,num...num] view :',r)
                    this.canvasObj.drawLine(r)
                }
            }
            if (hexTerrainTable[hex].obstaclePoints !== undefined) {
                let arrO = hexTerrainTable[hex].obstaclePoints

                for (let o of arrO) {
                    o.x -= 2
                    o.y -= 2
                    //console.log(JSON.stringify(o,null)) 
                    this.canvasObj.drawCircle(o)
                }
            }
        }
    }

    getResultRollingTwoDice() {
        let d1 = diceRoll()
        let d2 = diceRoll()
        return { 'WhiteDice': d1, 'RedDice': d2, 'sum': d2 + d1 }
    }

}

export { Client };
