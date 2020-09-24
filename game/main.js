import {Inject} from '../core';
import {Environment, WebSocketConnection, MessagesTypes} from '../api/services';
import gameConfig from '../config/game.json';
import {Field} from './field';
import {Strategies} from "../api/repositories";
import dummyCode from '../public/dummy';

const MAX_NUMBER_OF_STRATEGIES = 50;

export class Main {

    @Inject(Environment)
    environment;

    @Inject(WebSocketConnection)
    socketConnection;

    @Inject(Strategies)
    strategiesRepository;

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
        this.sendUpdateToClients();
    }

    sendUpdateToClients() {
        const strategiesList = this.field.strategies.map(strategy => ({
            position: strategy.position,
            name: strategy.name,
            color: strategy.color,
            id: strategy.id,
            username: strategy.username,
            health: strategy.health
        }));
        this.socketConnection.broadcastMessage(MessagesTypes.GAME_STANDING, this.field.getStanding());
        if (strategiesList.length > 0) {
            this.socketConnection.broadcastMessage(MessagesTypes.USERS_DATA, strategiesList);
        } else {
            this.socketConnection.broadcastMessage(MessagesTypes.GAME_END);
            this.stopGame();
            setTimeout(this.restartGame.bind(this), 10000);
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
        this.field = new Field();
        this.status = 'STOPPED';
        this.gameTime = 0;
        const strategies = await this.strategiesRepository.list({active: true});
        strategies.forEach(strategy => this.field.addStrategy({
            id: strategy._id,
            name: strategy.name,
            code: this.strategiesRepository.toValidCode(strategy.code),
            username: strategy.user.username
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
