import cp from 'child_process';

import {randomName} from './utils';
import {EvalEnum} from './enums';

const TIMES_TO_WAIT_EVAL = 10;

export class Eval {

    constructor() {
        this.process = cp.fork('./game/strategy-eval.js');
    }

    evalStrategy(code, data) {
        return new Promise((resolve) => {
            const id = randomName(5) + Date.now();
            this.process.send({code, data, id});
            const timeLimit = setTimeout(function () {resolve({status: EvalEnum.TIMEOUT});}, 150);
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
