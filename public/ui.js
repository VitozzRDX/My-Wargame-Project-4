class Interface {
    constructor() {
        this.buttonsHash = {}
    }

    buildButton(obj,bool,options) {

        //console.log('inside interface.buildButton(' ,obj )

        let button = document.createElement('button');
        //-------------------------------------------------------------

        button.classList.add(obj.class)
        button.innerHTML = obj.name

        button.addEventListener('click', () => {    // for beauty we can take event from obj click or mousedown

            obj.callback(button,options);

        });

        if (!bool) {
            button.disabled = true
        }

        //-------------------------------------------------------------
        let m = document.getElementById('UIContainer')

        m.appendChild(button)
        //console.log('adding obj.name to buttonsHash ', obj.name)
        this.buttonsHash[obj.name] = button
        //console.log(this.buttonsHash)
    }

    remove(name) {
        //console.log('this.buttonsHash',this.buttonsHash)
        this.buttonsHash[name].remove()
    }

    clearAllUI() {
        for (let i in this.buttonsHash) {
            this.buttonsHash[i].remove()
        }
    }
}

export { Interface };
