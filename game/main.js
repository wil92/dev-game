import {Inject} from '../core';
import {Environment, WebSocketConnection, MessagesTypes} from '../api/services';
import gameConfig from '../config/game.json';
import {Field} from './field';
import {Positions, Strategies} from "../api/repositories";
import dummyCode from '../public/dummy';

const MAX_NUMBER_OF_STRATEGIES = 50;
const WAIT_TIME_TO_START_NEW_GAME = 3000;

export class Main {

    @Inject(Environment)
    environment;

    @Inject(WebSocketConnection)
    socketConnection;

    @Inject(Strategies)
    strategiesRepository;

    @Inject(Positions)
    positionsRepository;

    loop() {
        if (this.status === 'RUNNING') {
            const initialTime = Date.now();
            this.calculateIteration().then(() => {
                const endTime = Date.now();

                const sleepTime = Math.max(this.interval - (endTime - initialTime), 0);

                this.gameTime += this.interval;
                setTimeout(this.loop.bind(this), sleepTime);
            });
        }
    }

    async calculateIteration() {
        await this.field.runIteration(this.gameTime);
        await this.sendUpdateToClients();
    }

    async sendUpdateToClients() {
        const strategiesList = this.field.strategies.map(strategy => ({
            position: strategy.position,
            name: strategy.name,
            color: strategy.color,
            id: strategy.id,
            username: strategy.username,
            health: strategy.health
        }));
        this.socketConnection.broadcastMessage(MessagesTypes.GAME_STANDING, this.field.getStanding());
        if (strategiesList.length > 1) {
            this.socketConnection.broadcastMessage(MessagesTypes.USERS_DATA, strategiesList);
        } else {
            this.field.closeStanding();
            await this.positionsRepository.saveGame(this.field.getStanding());
            this.socketConnection.broadcastMessage(MessagesTypes.GAME_END);
            this.stopGame();
            setTimeout(this.restartGame.bind(this), WAIT_TIME_TO_START_NEW_GAME);
        }
    }

    async restartGame() {
        await this.initGameValues();
        this.startGame();
    }

    startGame() {
        if (gameConfig[this.environment.env].enable && this.status === 'STOPPED') {
            this.status = 'RUNNING';
            this.socketConnection.broadcastMessage(MessagesTypes.GAME_START);
            this.loop();
        }
    }

    stopGame() {
        this.status = 'STOPPED';
    }

    async initGameValues() {
        this.interval = gameConfig[this.environment.env].interval;
        if (this.field) {
            this.field.destroy();
        }
        this.field = new Field();
        this.status = 'STOPPED';
        this.gameTime = 0;
        const strategies = await this.strategiesRepository.list({active: true});
        strategies.forEach(strategy => this.field.addStrategy({
            id: strategy._id,
            name: strategy.name,
            code: this.strategiesRepository.toValidCode(strategy.code),
            username: strategy.user.username,
            userId: strategy.user._id
        }));

        this.generateBots(strategies.length);
    }

    generateBots(strategiesCount) {
        [ ...new Array(MAX_NUMBER_OF_STRATEGIES - strategiesCount) ].forEach(() => {
            this.field.addStrategy({
                id: null,
                name: null,
                code: this.strategiesRepository.toValidCode(dummyCode),
                username: 'Bot'
            });
        });
    }
}
