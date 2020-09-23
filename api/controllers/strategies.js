import {Controller, Get, Inject, Post} from '../../core';
import {Strategies} from '../repositories';
import {Auth} from '../middlewares/auth';
import {CheckStrategy, Sanitizer} from "../services";
import {EvalEnum} from "../../game/enums";
import dummyCode from '../../public/dummy';

@Controller({route: '/strategies'})
export default class StrategyController {

    @Inject(Strategies)
    strategiesRepository;

    @Inject(CheckStrategy)
    checkStrategy;

    @Inject(Sanitizer)
    sanitizer;

    @Get({route: '/', middlewares: Auth})
    async strategies(req, res) {
        const strategies = await this.strategiesRepository.list();
        res.send(strategies);
    }

    @Get({route: '/dummy'})
    dummyStrategy(req, res) {
        res.send({code: dummyCode, name: "Dummy Code"});
    }

    @Get({route: '/:id', middlewares: Auth})
    async strategyById(req, res) {
        const strategy = await this.strategiesRepository.findOne({_id: req.params.id})
        res.send({code: strategy.code, name: strategy.name});
    }

    @Post({route: '/:id', middlewares: Auth})
    async createStrategy(req, res) {
        if (this.sanitizer.sanitizeRequestBody(req, res, ['code', 'name'])) {
            await this.strategiesRepository.update({_id: req.params.id}, {
                code: req.body.code,
                name: req.body.name
            });
            const strategy = await this.strategiesRepository.findOne({_id: req.params.id})
            res.send({code: strategy.code, name: strategy.name});
        }
    }

    @Post({route: '/', middlewares: Auth})
    async create(req, res) {
        if (this.sanitizer.sanitizeRequestBody(req, res, ['code', 'name'])) {
            const result = await this.checkStrategy.checkStrategy(this.toValidCode(req.body.code));
            delete result.id;
            const valid = result.status === EvalEnum.OK;
            const newStrategy = await this.strategiesRepository.create({
                code: req.body.code,
                name: req.body.name,
                valid,
                active: false,
                user: req.user._id
            });
            res.send({code: newStrategy.code, name: newStrategy.name, id: newStrategy._id});
        }
    }

    @Post({route: '/test', middlewares: Auth})
    async test(req, res) {
        if (this.sanitizer.sanitizeRequestBody(req, res, ['code'])) {
            const result = await this.checkStrategy.checkStrategy(this.toValidCode(req.body.code));
            delete result.id;
            res.send(result);
        }
    }

    toValidCode(code) {
        return `(function(){return ${code}})()`;
    }
}
