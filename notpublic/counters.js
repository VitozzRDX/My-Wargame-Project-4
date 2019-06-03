class Counter {
    constructor(param) {
        
        this.ownHex = param.ownHex;
        this.ID = (Math.random() + 1).toString(36).slice(2, 18);
        this.owner = param.owner ;
        this.img = undefined ;
        
        param['ID'] = this.ID
        table.parametersForClient.push(param)
       //console.log(table.parametersForClient)
    }

}

class SelfMovingCounters extends Counter {
    constructor(param) {
        super(param)
    }
}

class ManCounters extends SelfMovingCounters {
    constructor(param) {
        super(param)
    }
}

class SingleManCounters extends ManCounters {
    constructor(param) {
        super(param)
    }
}

class Vehicle extends SelfMovingCounters {
    constructor(param) {
        super(param);
        this.VCAorientation = param.orientation
    }
}

class AFV extends Vehicle {
    constructor(param) {                            
        super(param);
        this.TCAorientation = this.VCAorientation
    }
    
};


let table = {
    AFV : AFV,
    ManCounters : ManCounters,
    SingleManCounters : SingleManCounters,
    parametersForClient : []
}

module.exports = table