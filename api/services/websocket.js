import WebSocket from 'ws';

import {Inject} from '../../core';
import {Environment} from './environment';
import webSocketConfig from '../../config/websocket.json';

export const MessagesTypes = {
    USERS_DATA: 'USERS_DATA',
    MAP_UPDATE: 'MAP_UPDATE',
    GAME_PAUSE: 'GAME_PAUSE',
    GAME_END: 'GAME_END',
    GAME_START: 'GAME_START'
};

export class WebSocketConnection {

    @Inject(Environment)
    environment;

    constructor() {
        this.enable = webSocketConfig[this.environment.env].enable;
        if (this.enable) {
            this.server = new WebSocket.Server({
                port: webSocketConfig[this.environment.env].port,
                path: webSocketConfig[this.environment.env].path
            });

            console.log('websocket started in port:', webSocketConfig[this.environment.env].port);

            this.server.on('connection', () => {
                console.log('Client connection');
            });
        }
    }

    broadcastMessage(type, data) {
        this.server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({type, data}));
            }
        });
    }
}
