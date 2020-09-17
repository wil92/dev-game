export class Strategy {

    constructor(code) {
        this.code = code;
        this.name = [ ...new Array(5) ].reduce(p => p + 'qwertyuiasdfghjzxcnmiopjkl'[Math.floor(Math.random() * 20)], '');
        this.position = {x: 0, y: 0};
        this.velocity = 2;
    }

    setPosition(x, y) {
        this.position = {x, y};
    }

    execute({vision}) {
        // execute code, with the field info
        // console.log('executed strategy:', this.name, 'in position:', this.position);
        try {
            const obj = eval(this.code);
            return obj.run({vision, velocity: this.velocity});
        } catch (ignore) {
        }
        return null;
    }
}
