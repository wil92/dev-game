import {Controller, Get, Inject} from '../../core';
import {Main} from '../../game';

@Controller({route: '/game'})
export default class GameController {

    @Inject(Main)
    mainGame;

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
}
