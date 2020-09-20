import {EvalEnum} from './enums';

function evalStrategy({code, data, id}) {
    let strategyResult;
    try {
        const instance = eval(code);
        strategyResult = instance.run(data);
    } catch (error) {
        // toDo 19.09.20: disqualify strategy with exception
        return process.send({status: EvalEnum.ERROR, error, id});
    }
    process.send({status: EvalEnum.OK, result: strategyResult, id});
}

process.on('message', (strategyData) => {
    evalStrategy(strategyData);
});
