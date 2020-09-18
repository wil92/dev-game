export class Strategy {

    constructor(code) {
        this.code = code;
        this.name = [ ...new Array(5) ].reduce(p => p + 'qwertyuiasdfghjzxcnmiopjkl'[Math.floor(Math.random() * 20)], '');
        this.position = {x: 0, y: 0};
        this.velocity = 3;
        this.health = 100;
        this.attack = 10;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const letters = '123456789ABCDE';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    }

    setPosition(x, y) {
        this.position = {x, y};
    }

    execute({vision}) {
        // execute code, with the field info
        try {
            const obj = eval(this.code);
            return obj.run({vision, velocity: this.velocity});
        } catch (ignore) {
        }
        return null;
    }
}
