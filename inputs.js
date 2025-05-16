export class KeyUpAndDown {
    constructor() {
        const self = this;
        this.keys = {};
        this.lastKeyDown = '';
        this.lastKeyUp = '';
        document.addEventListener('keydown', (event) => {
            //event.preventDefault();
            self.keys[event.key] = true;
            self.lastKeyDown = event.key;
        });
        document.addEventListener('keyup', (event) => {
            self.keys[event.key] = false;
            self.lastKeyUp = event.key;
        });
    }
    down(key, callback) {
        if (this.keys[key] == true) {
            callback();
        }
        return this.keys[key]
    }
    up(key, callback) {
        if (this.keys[key] == false) {
            callback();
        }
        return this.keys[key]
    }
}

export class MouseMovement {
    constructor() {
        const self = this;
        this.mouseMovements = {};
        this.mouseMovements['X'] = 0;
        this.mouseMovements['Y'] = 0;
        this.canvas = document.getElementById('gl');
        this.mouseEvent = this.canvas.addEventListener('mousemove', (event) => {
            event.preventDefault();
            self.mouseMovements['X'] = event.movementX;
            self.mouseMovements['Y'] = event.movementY;
        })
    }
    move(callback) {
        callback();
        this.mouseMovements['X'] = 0;
        this.mouseMovements['Y'] = 0;
    }
}

export class MouseClicks {
    constructor() {
        this.clicks = {
            'left': false,
            'right': false
        };
        this.canvas = document.getElementById('gl');
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        this.canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();
            if (event.button === 0) {
                this.clicks['left'] = true;
            } else if (event.button === 2) {
                this.clicks['right'] = true;
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.clicks['left'] = false;
            } else if (event.button === 2) {
                this.clicks['right'] = false;
            }
        });
    }
}