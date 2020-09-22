import {Controller, Get, Inject, Post} from '../../core';
import {Main} from '../../game';
import {CheckStrategy, Sanitizer} from '../services';
import {Off} from "../middlewares/off";

@Controller({route: '/game'})
export default class GameController {

    @Inject(Main)
    mainGame;

    @Inject(CheckStrategy)
    checkStrategy;

    @Inject(Sanitizer)
    sanitizer;

    @Post({route: '/start', middlewares: Off})
    async start(req, res) {
        console.log('start game');
        this.mainGame.startGame();
        res.send({});
    }

    @Post({route: '/stop', middlewares: Off})
    async stop(req, res) {
        console.log('stop game');
        this.mainGame.stopGame();
        res.send({});
    }

    @Get({route: '/field'})
    field(req, res) {
        res.send(this.mainGame.field.grid);
    }
}
