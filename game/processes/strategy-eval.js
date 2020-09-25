import {EvalEnum, FieldEnum as FieldEnumValue} from '../enums';
import {validateInsideMovement, validateOutsideMovement, validMovements, moveToPos, posToMove} from '../utils';

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

function evalStrategy({code, data, id}) {
    try {
        const instance = eval(code);
        const strategyResult = instance.run(data);
        // console.log(data);
        process.send({status: EvalEnum.OK, result: strategyResult, id});
    } catch (error) {
        process.send({status: EvalEnum.ERROR, error, id});
    }
}

process.on('message', (strategyData) => {
    evalStrategy(strategyData);
});
