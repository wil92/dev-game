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
    async list(req, res) {
        const strategies = await this.strategiesRepository.list({user: req.user._id});
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

    @Post({route: '/:id/activate', middlewares: Auth})
    async activateStrategy(req, res) {
        const strategy = await this.strategiesRepository.activate(req.params.id, req.user);
        if (strategy) {
            res.status(202).send();
        } else {
            res.status(406).send({error: 'Not Acceptable'});
        }
    }

    @Post({route: '/test', middlewares: Auth})
    async test(req, res) {
        if (this.sanitizer.sanitizeRequestBody(req, res, ['code'])) {
            const result = await this.checkStrategy.checkStrategy(this.strategiesRepository.toValidCode(req.body.code));
            delete result.id;
            res.send(result);
        }
    }

    @Post({route: '/:id', middlewares: Auth})
    async updateStrategy(req, res) {
        if (this.sanitizer.sanitizeRequestBody(req, res, ['code', 'name'])) {
            const result = await this.checkStrategy.checkStrategy(this.strategiesRepository.toValidCode(req.body.code));
            delete result.id;
            const valid = result.status === EvalEnum.OK;
            let strategy = await this.strategiesRepository.findOne({_id: req.params.id});
            await this.strategiesRepository.update({_id: req.params.id}, {
                code: req.body.code,
                name: req.body.name,
                valid,
                active: valid ? strategy.active : false
            });
            strategy = await this.strategiesRepository.findOne({_id: req.params.id});
            res.send({code: strategy.code, name: strategy.name, id: strategy._id});
        }
    }

    @Post({route: '/', middlewares: Auth})
    async create(req, res) {
        if (this.sanitizer.sanitizeRequestBody(req, res, ['code', 'name'])) {
            const count = await this.strategiesRepository.count({user: req.user._id});
            if (count >= 5) {
                return res.status(403).send({error: 'You reached the limit of strategies'});
            }
            const result = await this.checkStrategy.checkStrategy(this.strategiesRepository.toValidCode(req.body.code));
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
}
