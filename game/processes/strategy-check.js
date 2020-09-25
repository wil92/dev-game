import {EvalEnum, FieldEnum as FieldEnumValue} from '../enums';
import inputs from './test-data';
import {
    moveToPos,
    posToMove,
    validateAction,
    validateInsideMovement,
    validateOutsideMovement,
    validMovements
} from '../utils';

// noinspection JSUnusedLocalSymbols
const getValidMovements = validMovements;
// noinspection JSUnusedLocalSymbols
const isValidMovement = (mapInfo, movement) => {
    return validateOutsideMovement(mapInfo, movement) && validateInsideMovement(mapInfo, movement);
};
// noinspection JSUnusedLocalSymbols
const randomNumber = (n) => Math.floor(Math.random() * n);
// noinspection JSUnusedLocalSymbols
const transformMoveToPos = moveToPos;
// noinspection JSUnusedLocalSymbols
const transformPosToMove = posToMove;
// noinspection JSUnusedLocalSymbols
const FieldEnum = FieldEnumValue;

const TIME_TO_CHECK_SAME_TESTCASE = 3;

function checkStrategy({code, id}) {
    let inputTest;
    try {
        const instance = eval(code);
        let count = 0, totalTime = 0;
        for (let input of inputs) {
            for (let testcase of input) {
                inputTest = testcase;
                for (let i = 0; i < TIME_TO_CHECK_SAME_TESTCASE; i++) {
                    count++;
                    const initialTime = toNanoSeconds(process.hrtime());
                    const strategyResult = instance.run(testcase);
                    totalTime += toNanoSeconds(process.hrtime()) - initialTime;
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
        process.send({status: EvalEnum.ERROR, result: inputTest, error: error.toString(), id});
    }
}

function toNanoSeconds(hrTime) {
    return hrTime[0] * 1000000000 + hrTime[1];
}

process.on('message', (strategyData) => {
    checkStrategy(strategyData);
});
