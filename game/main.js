import {Inject} from '../core';
import {Environment, WebSocketConnection, MessagesTypes} from '../api/services';
import gameConfig from '../config/game.json';
import {Field} from './field';

export class Main {

    @Inject(Environment)
    environment;

    @Inject(WebSocketConnection)
    socketConnection;

    constructor() {
        if (gameConfig[this.environment.env].enable) {
            this.initGameValues();
            this.startGame();
        }
    }

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
            color: strategy.color
        }));
        if (strategiesList.length > 0) {
            this.socketConnection.broadcastMessage(MessagesTypes.USERS_DATA, strategiesList);
        } else {
            this.socketConnection.broadcastMessage(MessagesTypes.GAME_END);
            this.stopGame();
            setTimeout(this.restartGame.bind(this), 1000);
        }
    }

    restartGame() {
        this.initGameValues();
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

    initGameValues() {
        this.interval = gameConfig[this.environment.env].interval;
        this.field = new Field();
        this.status = 'STOPPED';
        this.gameTime = 0;
    }
}
