import cp from 'child_process';

import {Injectable} from '../../core';
import {randomName} from '../../game/utils';
import {EvalEnum} from '../../game/enums';

const TIMES_TO_WAIT_TEST = 10;
const LIMIT_TIME_TO_TEST_STRATEGY = 5000; // 5 seconds

@Injectable()
export class CheckStrategy {

    constructor() {
        this.process = cp.fork('./game/processes/strategy-check.js');
    }

    checkStrategy(code) {
        return new Promise((resolve) => {
            const id = randomName(5) + Date.now();
            this.process.send({code, id});
            const timeLimit = setTimeout(() => resolve({status: EvalEnum.TIMEOUT}), LIMIT_TIME_TO_TEST_STRATEGY);
            this.subscription(resolve, id, timeLimit);
        });
    }

    subscription(resolve, id, timeLimit, times) {
        times = times || 0;
        if (times > TIMES_TO_WAIT_TEST) {
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
