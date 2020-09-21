import {EvalEnum} from '../enums';
import {validateInsideMovement, validateOutsideMovement, validMovements} from '../utils';

const getValidMovements = validMovements;
const isValidMovement = (mapInfo, movement) => {
    return validateOutsideMovement(mapInfo, movement) && validateInsideMovement(mapInfo, movement);
};

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
