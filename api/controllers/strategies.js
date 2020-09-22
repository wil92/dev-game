import {Controller, Get, Inject, Post} from '../../core';
import {Strategies} from '../repositories';
import {Auth} from '../middlewares/auth';
import {CheckStrategy, Sanitizer} from "../services";
import {EvalEnum} from "../../game/enums";
import dummyCode from '../../public/dummy';

@Controller({route: '/strategies'})
export default class StrategyController {

    @Inject(Strategies)
    usersService;

    @Inject(CheckStrategy)
    checkStrategy;

    @Inject(Sanitizer)
    sanitizer;

    @Get({route: '/', middlewares: Auth})
    async strategies(req, res) {
        const strategies = await this.usersService.list();
        res.send(strategies);
    }

    @Get({route: '/dummy'})
    dummyStrategy(req, res) {
        res.send({code: dummyCode});
    }

    @Post({route: '/', middlewares: Auth})
    async create(req, res) {
        if (this.sanitizer.sanitizeRequestBody(req, res, [ 'code', 'name' ])) {
            const result = await this.checkStrategy.checkStrategy(this.toValidCode(req.body.code));
            delete result.id;
            if (result.status === EvalEnum.OK) {
                // toDo 22.09.20: create new strategy
            }
            res.send(result);
        }
    }

    @Post({route: '/test', middlewares: Auth})
    async test(req, res) {
        if (this.sanitizer.sanitizeRequestBody(req, res, [ 'code' ])) {
            const result = await this.checkStrategy.checkStrategy(this.toValidCode(req.body.code));
            delete result.id;
            res.send(result);
        }
    }

    toValidCode(code) {
        return `(function(){return ${code}})()`;
    }
}
