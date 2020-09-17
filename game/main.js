import {Inject} from '../core';
import {Environment, WebSocketConnection} from '../api/services';
import gameConfig from '../config/game.json';
import {Field} from './field';

export class Main {

    @Inject(Environment)
    environment;

    @Inject(WebSocketConnection)
    socketConnection;

    constructor() {
        this.interval = gameConfig[this.environment.env].interval;
        this.field = new Field();
        this.status = 'STOPPED';

        this.startGame();
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

            setTimeout(this.loop.bind(this), sleepTime);
        }
    }

    calculateIteration() {
        this.field.runIteration();
        this.socketConnection.broadcastMessage('interval');
    }
}
