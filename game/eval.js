import cp from 'child_process';

import {randomName} from './utils';
import {EvalEnum} from './enums';

const TIMES_TO_WAIT_EVAL = 10;
const LIMIT_TIME_TO_EVAL_STRATEGY = 150;

export class Eval {

    constructor() {
        this.process = cp.fork('./game/processes/strategy-eval.js');
    }

    destroy() {
        this.process.kill("SIGINT");
    }

    /**
     *
     * @param code {string}
     * @param data {{vision: [[number]], velocity: number, position: {x: number, y: number}, health: number, attack: number, name: string, players: [{position: {x: number, y: number}, health: number, attack: number, name: string}]}}
     * @returns {Promise<{status: number}>}
     */
    evalStrategy(code, data) {
        return new Promise((resolve) => {
            const id = randomName(5) + Date.now();
            this.process.send({code, data, id});
            const timeLimit = setTimeout(() => resolve({status: EvalEnum.TIMEOUT}), LIMIT_TIME_TO_EVAL_STRATEGY);
            this.subscription(resolve, id, timeLimit);
        });
    }

    subscription(resolve, id, timeLimit, times) {
        times = times || 0;
        if (times > TIMES_TO_WAIT_EVAL) {
            clearTimeout(timeLimit);
            return resolve({status: EvalEnum.ERROR});
        }
        this.process.once('message', (result) => {
            if (result.id === id) {
                clearTimeout(timeLimit);
                resolve(result);
            } else {
                this.subscription(resolve, id, timeLimit, times + 1);
            }
        });
    }
}
