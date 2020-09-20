import {randomName} from './utils';
import {EvalEnum} from './enums';

export class Strategy {

    constructor(code, evalInstance) {
        this.code = code;
        this.name = randomName(5);
        this.position = {x: 0, y: 0};
        this.velocity = 3;
        this.health = 100;
        this.attack = 10;
        this.color = this.getRandomColor();
        this.eval = evalInstance;
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

    async execute({vision}) {
        try {
            return this.eval.evalStrategy(this.code, {vision, velocity: this.velocity})
                .then(({status, result, error}) => {
                    if (status === EvalEnum.OK) {
                        return result;
                    } else if (status === EvalEnum.TIMEOUT) {
                        console.error('Timeout with strategy', this.name);
                    } else {
                        // toDo 19.09.20: disqualify strategy
                        console.error(status, error);
                    }
                });
        } catch (error) {
            // toDo 19.09.20: disqualify strategy with exception
            console.log(error);
        }
        return Promise.reject();
    }
}
