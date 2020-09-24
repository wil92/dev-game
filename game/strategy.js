import {randomName} from './utils';
import {EvalEnum} from './enums';

export class Strategy {

    constructor(code, evalInstance, name, username, id) {
        this.unique = randomName(10) + Date.now();
        this.code = code;
        this.name = name || randomName(5);
        this.username = username || randomName(5);
        this.id = id;
        this.position = {x: 0, y: 0};
        this.velocity = 2;
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
        this.position = typeof x === 'number' ? {x, y} : x;
    }

    /**
     *
     * @param vision {[[number]]}
     * @param players {[{position: {x: number, y: number}, health: number, attack: number, name: string}]}
     * @param position {{x: number, y: number}}
     * @returns {Promise<*>}
     */
    async executeStrategy({vision, players, position}) {
        try {
            const strategyData = {
                vision,
                players,
                position,
                velocity: this.velocity,
                health: this.health,
                attack: this.attack,
                name: this.name
            };
            return this.eval.evalStrategy(this.code, strategyData)
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
            console.log(error);
        }
        return Promise.reject();
    }
}
