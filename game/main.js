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
            this.interval = gameConfig[this.environment.env].interval;
            this.field = new Field();
            this.status = 'STOPPED';
            this.gameTime = 0;

            this.startGame();
        }
    }

    startGame() {
        if (this.status === 'STOPPED') {
            this.status = 'RUNNING';
            this.loop();
        }
    }

    stopGame() {
        this.status = 'STOPPED';
    }

    loop() {
        if (this.status === 'RUNNING') {
            const initialTime = Date.now();
            this.calculateIteration();
            const endTime = Date.now();

            const sleepTime = Math.max(this.interval - (endTime - initialTime), 0);

            this.gameTime += this.interval;
            setTimeout(this.loop.bind(this), sleepTime);
        }
    }

    calculateIteration() {
        this.field.runIteration(this.gameTime);
        this.sendUpdateToClients();
    }

    sendUpdateToClients() {
        const strategiesList = this.field.strategies.map(strategy => ({
            position: strategy.position,
            name: strategy.name,
            color: strategy.color
        }));
        this.socketConnection.broadcastMessage(MessagesTypes.USERS_DATA, strategiesList);
    }
}
