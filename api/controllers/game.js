import {Controller, Get, Inject, Post} from '../../core';
import {Main} from '../../game';
import {CheckStrategy, Sanitizer} from '../services';
import {EvalEnum} from '../../game/enums';

@Controller({route: '/game'})
export default class GameController {

    @Inject(Main)
    mainGame;

    @Inject(CheckStrategy)
    checkStrategy;

    @Inject(Sanitizer)
    sanitizer;

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
}
