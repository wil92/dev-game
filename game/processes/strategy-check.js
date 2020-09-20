import {EvalEnum} from '../enums';
import inputs from './test-data';
import {validateAction, validateInsideMovement, validateOutsideMovement, validMovements} from '../utils';

const getValidMovements = validMovements;
const isValidMovement = (mapInfo, movement) => {
    return validateOutsideMovement(mapInfo, movement) && validateInsideMovement(mapInfo, movement)
}

const TIME_TO_CHECK_SAME_TESTCASE = 3;

function checkStrategy({code, id}) {
    try {
        const instance = eval(code);
        let count = 0, totalTime = 0;
        for (let input of inputs) {
            for (let testcase of input) {
                count++;
                const initialTime = toNanoSeconds(process.hrtime());
                const strategyResult = instance.run(testcase);
                totalTime += toNanoSeconds(process.hrtime()) - initialTime;
                for (let i = 0; i < TIME_TO_CHECK_SAME_TESTCASE; i++) {
                    if (!validateAction(testcase, strategyResult)) {
                        return process.send({
                            status: EvalEnum.INVALID_ACTION,
                            result: {input: testcase, output: strategyResult},
                            id
                        });
                    }
                }
            }
        }
        process.send({status: EvalEnum.OK, result: {totalTime, averageTime: totalTime / count}, id});
    } catch (error) {
        process.send({status: EvalEnum.ERROR, error, id});
    }
}

function toNanoSeconds(hrTime) {
    return hrTime[0] * 1000000000 + hrTime[1];
}

process.on('message', (strategyData) => {
    checkStrategy(strategyData);
});
