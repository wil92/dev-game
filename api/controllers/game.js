import {Controller, Get, Inject, Post} from '../../core';
import {Main} from '../../game';
import {CheckStrategy} from '../services';
import {EvalEnum} from "../../game/enums";

@Controller({route: '/game'})
export default class GameController {

    @Inject(Main)
    mainGame;

    @Inject(CheckStrategy)
    checkStrategy;

    @Get({route: '/start'})
    async start(req, res) {
        console.log('start game');
        this.mainGame.startGame();
        res.send({});
    }

    @Get({route: '/stop'})
    async stop(req, res) {
        console.log('stop game');
        this.mainGame.stopGame();
        res.send({});
    }

    @Get({route: '/field'})
    field(req, res) {
        res.send(this.mainGame.field.grid);
    }

    @Post({route: '/strategy'})
    async createStrategy(req, res) {
        const result = await this.checkStrategy.checkStrategy(req.body.code);
        delete result.id;
        if (result.status === EvalEnum.OK) {
            this.mainGame.addNewStrategy(req.body.code, req.body.code);
        }
        res.send(result);
    }

    @Post({route: '/strategy/test'})
    async testStrategy(req, res) {
        const result = await this.checkStrategy.checkStrategy(req.body.code);
        delete result.id;
        res.send(result);
    }
}
